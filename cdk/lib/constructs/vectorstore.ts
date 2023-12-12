import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { CustomResource, Duration } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

// UUID for custom resource handler
const UUID = "d1b4d3c5-1f3d-11ec-9621-0242ac130012";
const DB_NAME = "postgres";

export interface VectorStoreProps {
  readonly vpc: ec2.IVpc;
}

export class VectorStore extends Construct {
  /**
   * Vector Store construct.
   * We use Aurora Postgres to store embedding vectors and search them.
   */
  private readonly securityGroup: ec2.ISecurityGroup;
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
      serverlessV2MinCapacity: 2.0,
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

    // TODO: use normal handler instead of singleton
    const customResourceHandler = new lambda.SingletonFunction(
      this,
      "CustomResourceHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../custom-resources/setup-pgvector/")
        ),
        handler: "index.handler",
        uuid: UUID,
        lambdaPurpose: "CustomResourceSetupVectorStore",
        vpc: props.vpc,
        timeout: Duration.minutes(5),
      }
    );
    sg.connections.allowFrom(
      customResourceHandler,
      ec2.Port.tcp(cluster.clusterEndpoint.port)
    );

    new CustomResource(this, "CustomResourceSetup", {
      serviceToken: customResourceHandler.functionArn,
      resourceType: "Custom::SetupVectorStore",
      properties: {
        dbConfig: {
          host: cluster.clusterEndpoint.hostname,
          user: cluster
            .secret!.secretValueFromJson("username")
            .unsafeUnwrap()
            .toString(),
          password: cluster
            .secret!.secretValueFromJson("password")
            .unsafeUnwrap()
            .toString(),
          port: cluster.clusterEndpoint.port.toString(),
          database: cluster
            .secret!.secretValueFromJson("dbname")
            .unsafeUnwrap()
            .toString(),
        },
        dbClusterIdentifier: cluster
          .secret!.secretValueFromJson("dbClusterIdentifier")
          .unsafeUnwrap()
          .toString(),
      },
    });

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
