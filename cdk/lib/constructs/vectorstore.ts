import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { CustomResource, Duration } from "aws-cdk-lib";

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as events from "aws-cdk-lib/aws-events";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CronSchedule } from "../utils/cron-schedule";
import { CfnSchedule } from "aws-cdk-lib/aws-scheduler";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

const DB_NAME = "postgres";

export interface VectorStoreProps {
  readonly vpc: ec2.IVpc;
  readonly rdsSchedule: CronSchedule;
}

export class VectorStore extends Construct {
  /**
   * Vector Store construct.
   * We use Aurora Postgres to store embedding vectors and search them.
   */
  readonly securityGroup: ec2.ISecurityGroup;
  readonly cluster: rds.IDatabaseCluster;
  readonly secret: secretsmanager.ISecret;
  constructor(scope: Construct, id: string, props: VectorStoreProps) {
    super(scope, id);

    const sg = new ec2.SecurityGroup(this, "ClusterSecurityGroup", {
      vpc: props.vpc,
    });
    const cluster = new rds.DatabaseCluster(this, "Cluster", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      vpc: props.vpc,
      securityGroups: [sg],
      defaultDatabaseName: DB_NAME,
      enableDataApi: true,
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 5.0,
      writer: rds.ClusterInstance.serverlessV2("writer", {
        autoMinorVersionUpgrade: false,
      }),
      // readers: [
      //   rds.ClusterInstance.serverlessV2("reader", {
      //     autoMinorVersionUpgrade: false,
      //   }),
      // ],
    });

    const dbClusterIdentifier = cluster
      .secret!.secretValueFromJson("dbClusterIdentifier")
      .unsafeUnwrap()
      .toString();

    if (props.rdsSchedule.hasCron()) {
      const rdsSchedulerRole = new Role(this, "role-rds-scheduler", {
        assumedBy: new ServicePrincipal("scheduler.amazonaws.com"),
        description: "start and stop RDS",
      });

      rdsSchedulerRole.addToPolicy(
        new PolicyStatement({
          resources: ["*"],
          effect: Effect.ALLOW,
          actions: ["rds:startDBCluster", "rds:stopDBCluster"],
        })
      );

      new CfnSchedule(this, "StartRdsScheduler", {
        description: "Start RDS Instance",
        scheduleExpression: events.Schedule.cron(props.rdsSchedule.startCron)
          .expressionString,
        flexibleTimeWindow: { mode: "OFF" },
        target: {
          arn: "arn:aws:scheduler:::aws-sdk:rds:startDBCluster",
          roleArn: rdsSchedulerRole.roleArn,
          input: JSON.stringify({
            DbClusterIdentifier: dbClusterIdentifier,
          }),
        },
      });

      new CfnSchedule(this, "StopRdsScheduler", {
        description: "Stop RDS Instance",
        scheduleExpression: events.Schedule.cron(props.rdsSchedule.stopCron)
          .expressionString,
        flexibleTimeWindow: { mode: "OFF" },
        target: {
          arn: "arn:aws:scheduler:::aws-sdk:rds:stopDBCluster",
          roleArn: rdsSchedulerRole.roleArn,
          input: JSON.stringify({
            DbClusterIdentifier: dbClusterIdentifier,
          }),
        },
      });
    }

    const setupHandler = new NodejsFunction(this, "CustomResourceHandler", {
      vpc: props.vpc,
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        "../../custom-resources/setup-pgvector/index.js"
      ),
      handler: "handler",
      timeout: Duration.minutes(5),
      environment: {
        DB_HOST: cluster.clusterEndpoint.hostname,
        DB_USER: cluster
          .secret!.secretValueFromJson("username")
          .unsafeUnwrap()
          .toString(),
        DB_PASSWORD: cluster
          .secret!.secretValueFromJson("password")
          .unsafeUnwrap()
          .toString(),
        DB_NAME: cluster
          .secret!.secretValueFromJson("dbname")
          .unsafeUnwrap()
          .toString(),
        DB_PORT: cluster.clusterEndpoint.port.toString(),
        DB_CLUSTER_IDENTIFIER: dbClusterIdentifier,
      },
    });

    sg.connections.allowFrom(
      setupHandler,
      ec2.Port.tcp(cluster.clusterEndpoint.port)
    );

    const cr = new CustomResource(this, "CustomResourceSetup", {
      serviceToken: setupHandler.functionArn,
      resourceType: "Custom::SetupVectorStore",
      properties: {
        // Dummy property to trigger
        id: cluster.clusterEndpoint.hostname,
      },
    });
    cr.node.addDependency(cluster);

    this.securityGroup = sg;
    this.cluster = cluster;
    this.secret = cluster.secret!;
  }

  allowFrom(other: ec2.IConnectable) {
    this.securityGroup.connections.allowFrom(
      other,
      ec2.Port.tcp(this.cluster.clusterEndpoint.port)
    );
  }
}
