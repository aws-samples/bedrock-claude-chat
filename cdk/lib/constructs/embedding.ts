import { Construct } from "constructs";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as path from "path";
import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";

export interface DbConfig {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
}

export interface EmbeddingProps {
  readonly vpc: ec2.IVpc;
  readonly database: ITable;
  readonly dbConfig: DbConfig;
  readonly bedrockRegion: string;
  readonly tableAccessRole: iam.IRole;
}

export class Embedding extends Construct {
  readonly taskSecurityGroup: ec2.ISecurityGroup;
  constructor(scope: Construct, id: string, props: EmbeddingProps) {
    super(scope, id);

    /**
     * ECS
     */
    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: props.vpc,
    });
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 2048,
        memoryLimitMiB: 4096,
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        },
      }
    );
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:*"],
        resources: ["*"],
      })
    );
    taskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [props.tableAccessRole.roleArn],
      })
    );
    const taskLogGroup = new logs.LogGroup(this, "TaskLogGroup", {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });

    const container = taskDefinition.addContainer("Container", {
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, "../../../backend"),
        {
          file: "embedding.Dockerfile",
        }
      ),
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "embed-task",
        logGroup: taskLogGroup,
      }),
      environment: {
        BEDROCK_REGION: props.bedrockRegion,
        DB_HOST: props.dbConfig.host,
        DB_PORT: props.dbConfig.port.toString(),
        DB_USER: props.dbConfig.username,
        DB_PASSWORD: props.dbConfig.password,
        DB_NAME: props.dbConfig.database,
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        TABLE_NAME: props.database.tableName,
        TABLE_ACCESS_ROLE_ARN: props.tableAccessRole.roleArn,
      },
    });
    taskLogGroup.grantWrite(container.taskDefinition.executionRole!);
    const taskSg = new ec2.SecurityGroup(this, "TaskSecurityGroup", {
      vpc: props.vpc,
      allowAllOutbound: true,
    });

    /**
     * EventBridge Pipes
     */
    const pipeLogGroup = new logs.LogGroup(this, "PipeLogGroup", {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });
    const pipeRole = new iam.Role(this, "PipeRole", {
      assumedBy: new iam.ServicePrincipal("pipes.amazonaws.com"),
    });
    pipeRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [props.database.tableStreamArn!],
      })
    );
    pipeRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["ecs:RunTask"],
        resources: [
          taskDefinition.taskDefinitionArn,
          `${taskDefinition.taskDefinitionArn}:*`,
        ],
      })
    );
    pipeRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: ["*"],
        conditions: {
          StringLike: {
            "iam:PassedToService": "ecs-tasks.amazonaws.com",
          },
        },
      })
    );
    const pipe = new CfnPipe(this, "Pipe", {
      source: props.database.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          batchSize: 1,
          startingPosition: "LATEST",
        },
        filterCriteria: {
          // Trigger when bot is created or updated
          filters: [
            {
              pattern:
                '{"dynamodb":{"NewImage":{"SyncStatus":{"S":[{"prefix":"QUEUED"}]}}}}',
            },
          ],
        },
      },
      target: cluster.clusterArn,
      targetParameters: {
        ecsTaskParameters: {
          enableEcsManagedTags: false,
          enableExecuteCommand: false,
          launchType: "FARGATE",
          networkConfiguration: {
            awsvpcConfiguration: {
              assignPublicIp: "DISABLED",
              subnets: props.vpc.selectSubnets({
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
              }).subnetIds,
              securityGroups: [taskSg.securityGroupId],
            },
          },
          taskCount: 1,
          taskDefinitionArn: taskDefinition.taskDefinitionArn,
          overrides: {
            // Pass event as argument.
            // Ref: https://repost.aws/questions/QU_WC7301mT8qR7ip_9cyjdQ/eventbridge-pipes-and-ecs-task
            containerOverrides: [
              {
                command: ["-u", "embedding/main.py", "$.dynamodb.NewImage"],
                name: taskDefinition.defaultContainer!.containerName,
              },
            ],
          },
        },
      },
      logConfiguration: {
        cloudwatchLogsLogDestination: {
          logGroupArn: pipeLogGroup.logGroupArn,
        },
        level: "INFO",
      },
      roleArn: pipeRole.roleArn,
    });

    this.taskSecurityGroup = taskSg;
  }
}
