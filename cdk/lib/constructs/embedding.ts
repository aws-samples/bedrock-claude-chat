import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as path from "path";
import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { DockerImageAsset, Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  DockerImageCode,
  DockerImageFunction,
  IFunction,
} from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { SociIndexBuild } from "deploy-time-build";

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
  readonly documentBucket: IBucket;
  readonly embeddingContainerVcpu: number;
  readonly embeddingContainerMemory: number;
}

export class Embedding extends Construct {
  readonly taskSecurityGroup: ec2.ISecurityGroup;
  readonly container: ecs.ContainerDefinition;
  readonly removalHandler: IFunction;
  constructor(scope: Construct, id: string, props: EmbeddingProps) {
    super(scope, id);

    /**
     * ECS
     */
    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: props.vpc,
      containerInsights: true,
    });
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: props.embeddingContainerVcpu,
        memoryLimitMiB: props.embeddingContainerMemory,
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

    const asset = new DockerImageAsset(this, "Image", {
      directory: path.join(__dirname, "../../../backend"),
      file: "embedding.Dockerfile",
      platform: Platform.LINUX_AMD64,
    });
    SociIndexBuild.fromDockerImageAsset(this, "Index", asset);

    const container = taskDefinition.addContainer("Container", {
      image: ecs.AssetImage.fromDockerImageAsset(asset),
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
        DOCUMENT_BUCKET: props.documentBucket.bucketName,
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
          maximumRetryAttempts: 1, // Avoid infinite retry which causes stuck
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
                // Only pass keys and load the object from within the ECS task.
                // https://github.com/aws-samples/bedrock-claude-chat/issues/190
                command: ["-u", "embedding/main.py", "$.dynamodb.Keys"],
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

    /**
     * Removal handler
     */
    const removeHandlerRole = new iam.Role(this, "RemovalHandlerRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    removeHandlerRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );
    removeHandlerRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cloudformation:DescribeStacks",
          "cloudformation:DescribeStackEvents",
          "cloudformation:DescribeStackResource",
          "cloudformation:DescribeStackResources",
          "cloudformation:DeleteStack",
        ],
        resources: [`*`],
      })
    );
    removeHandlerRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "apigateway:GET",
          "apigateway:POST",
          "apigateway:PUT",
          "apigateway:DELETE",
        ],
        resources: [`arn:aws:apigateway:${Stack.of(this).region}::/*`],
      })
    );
    props.database.grantStreamRead(removeHandlerRole);
    props.documentBucket.grantReadWrite(removeHandlerRole);
    const removalHandler = new DockerImageFunction(this, "BotRemovalHandler", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../../backend"),
        {
          platform: Platform.LINUX_AMD64,
          file: "websocket.Dockerfile",
          cmd: ["app.bot_remove.handler"],
        }
      ),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      timeout: Duration.minutes(1),
      environment: {
        DB_HOST: props.dbConfig.host,
        DB_PORT: props.dbConfig.port.toString(),
        DB_USER: props.dbConfig.username,
        DB_PASSWORD: props.dbConfig.password,
        DB_NAME: props.dbConfig.database,
        DOCUMENT_BUCKET: props.documentBucket.bucketName,
      },
      role: removeHandlerRole,
    });
    removalHandler.addEventSource(
      new DynamoEventSource(props.database, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        batchSize: 1,
        retryAttempts: 2,
        filters: [
          {
            pattern: '{"eventName":["REMOVE"]}',
          },
        ],
      })
    );

    this.taskSecurityGroup = taskSg;
    this.container = container;
    this.removalHandler = removalHandler;
  }
}
