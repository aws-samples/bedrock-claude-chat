import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  HttpMethods,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Auth } from "./constructs/auth";
import { Api } from "./constructs/api";
import { Database } from "./constructs/database";
import { Frontend } from "./constructs/frontend";
import { WebSocket } from "./constructs/websocket";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { DbConfig, Embedding } from "./constructs/embedding";
import { VectorStore } from "./constructs/vectorstore";
import { UsageAnalysis } from "./constructs/usage-analysis";
import { ApiPublishCodebuild } from "./constructs/api-publish-codebuild";
import { WebAclForPublishedApi } from "./constructs/webacl-for-published-api";
import { VpcConfig } from "./api-publishment-stack";

export interface BedrockChatStackProps extends StackProps {
  readonly bedrockRegion: string;
  readonly webAclId: string;
  readonly enableUsageAnalysis: boolean;
  readonly publishedApiAllowedIpV4AddressRanges: string[];
  readonly publishedApiAllowedIpV6AddressRanges: string[];
}

export class BedrockChatStack extends cdk.Stack {
  public readonly publishedApiWebAclArn: string;
  // public readonly vpcId: string;
  public readonly vpcConfig: VpcConfig;
  public readonly conversationTableName: string;
  public readonly tableAccessRoleArn: string;
  public readonly dbConfig: DbConfig;
  constructor(scope: Construct, id: string, props: BedrockChatStackProps) {
    super(scope, id, {
      description: "Bedrock Chat Stack (uksb-1tupboc46)",
      ...props,
    });

    const vpc = new ec2.Vpc(this, "VPC", {
      // vpcName: `${id}-VPC`,
    });
    const vectorStore = new VectorStore(this, "VectorStore", {
      vpc: vpc,
    });
    // CodeBuild is used for api publication
    const apiPublishCodebuild = new ApiPublishCodebuild(
      this,
      "ApiPublishCodebuild",
      {}
    );

    const dbConfig = {
      host: vectorStore.cluster.clusterEndpoint.hostname,
      username: vectorStore.secret
        .secretValueFromJson("username")
        .unsafeUnwrap()
        .toString(),
      password: vectorStore.secret
        .secretValueFromJson("password")
        .unsafeUnwrap()
        .toString(),
      port: vectorStore.cluster.clusterEndpoint.port,
      database: vectorStore.secret
        .secretValueFromJson("dbname")
        .unsafeUnwrap()
        .toString(),
    };

    const accessLogBucket = new Bucket(this, "AccessLogBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const documentBucket = new Bucket(this, "DocumentBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const auth = new Auth(this, "Auth");
    const database = new Database(this, "Database", {
      // Enable PITR to export data to s3 if usage analysis is enabled
      pointInTimeRecovery: props.enableUsageAnalysis,
    });

    let usageAnalysis;
    if (props.enableUsageAnalysis) {
      usageAnalysis = new UsageAnalysis(this, "UsageAnalysis", {
        sourceDatabase: database,
      });
    }

    const backendApi = new Api(this, "BackendApi", {
      vpc,
      database: database.table,
      auth,
      bedrockRegion: props.bedrockRegion,
      tableAccessRole: database.tableAccessRole,
      dbConfig,
      documentBucket,
      apiPublishProject: apiPublishCodebuild.project,
      usageAnalysis,
    });
    documentBucket.grantReadWrite(backendApi.handler);

    // For streaming response
    const websocket = new WebSocket(this, "WebSocket", {
      vpc,
      dbConfig,
      database: database.table,
      tableAccessRole: database.tableAccessRole,
      auth,
      bedrockRegion: props.bedrockRegion,
    });

    const frontend = new Frontend(this, "Frontend", {
      backendApiEndpoint: backendApi.api.apiEndpoint,
      webSocketApiEndpoint: websocket.apiEndpoint,
      auth,
      accessLogBucket,
      webAclId: props.webAclId,
    });
    documentBucket.addCorsRule({
      allowedMethods: [HttpMethods.PUT],
      allowedOrigins: [frontend.getOrigin(), "http://localhost:5173"],
      allowedHeaders: ["*"],
      maxAge: 3000,
    });

    const embedding = new Embedding(this, "Embedding", {
      vpc,
      bedrockRegion: props.bedrockRegion,
      database: database.table,
      dbConfig,
      tableAccessRole: database.tableAccessRole,
      documentBucket,
    });
    documentBucket.grantRead(embedding.container.taskDefinition.taskRole);

    vectorStore.allowFrom(embedding.taskSecurityGroup);
    vectorStore.allowFrom(embedding.removalHandler);
    vectorStore.allowFrom(backendApi.handler);
    vectorStore.allowFrom(websocket.handler);

    // WebAcl for published API
    const webAclForPublishedApi = new WebAclForPublishedApi(
      this,
      "WebAclForPublishedApi",
      {
        allowedIpV4AddressRanges: props.publishedApiAllowedIpV4AddressRanges,
        allowedIpV6AddressRanges: props.publishedApiAllowedIpV6AddressRanges,
      }
    );

    new CfnOutput(this, "DocumentBucketName", {
      value: documentBucket.bucketName,
    });
    new CfnOutput(this, "FrontendURL", {
      value: frontend.getOrigin(),
    });
    new CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
    });

    this.publishedApiWebAclArn = webAclForPublishedApi.webAclArn;
    this.vpcConfig = {
      vpcId: vpc.vpcId,
      availabilityZones: vpc.availabilityZones,
      publicSubnetIds: vpc.publicSubnets.map((subnet) => subnet.subnetId),
      privateSubnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
      isolatedSubnetIds: vpc.isolatedSubnets.map((subnet) => subnet.subnetId),
    };
    this.conversationTableName = database.table.tableName;
    this.tableAccessRoleArn = database.tableAccessRole.roleArn;
    this.dbConfig = dbConfig;
  }
}
