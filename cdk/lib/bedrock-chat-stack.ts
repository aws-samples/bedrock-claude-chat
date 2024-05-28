import { CfnOutput, RemovalPolicy, StackProps } from "aws-cdk-lib";
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
import { TIdentityProvider, identityProvider } from "./utils/identity-provider";
import { ApiPublishCodebuild } from "./constructs/api-publish-codebuild";
import { WebAclForPublishedApi } from "./constructs/webacl-for-published-api";
import { VpcConfig } from "./api-publishment-stack";
import { CronScheduleProps, createCronSchedule } from "./utils/cron-schedule";

export interface BedrockChatStackProps extends StackProps {
  readonly bedrockRegion: string;
  readonly webAclId: string;
  readonly identityProviders: TIdentityProvider[];
  readonly userPoolDomainPrefix: string;
  readonly publishedApiAllowedIpV4AddressRanges: string[];
  readonly publishedApiAllowedIpV6AddressRanges: string[];
  readonly allowedSignUpEmailDomains: string[];
  readonly rdsSchedules: CronScheduleProps;
  readonly enableMistral: boolean;
  readonly embeddingContainerVcpu: number;
  readonly embeddingContainerMemory: number;
  readonly selfSignUpEnabled: boolean;
}

export class BedrockChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BedrockChatStackProps) {
    super(scope, id, {
      description: "Bedrock Chat Stack (uksb-1tupboc46)",
      ...props,
    });
    const cronSchedule = createCronSchedule(props.rdsSchedules);

    const vpc = new ec2.Vpc(this, "VPC", {});
    const vectorStore = new VectorStore(this, "VectorStore", {
      vpc: vpc,
      rdsSchedule: cronSchedule,
    });
    const idp = identityProvider(props.identityProviders);
    // CodeBuild is used for api publication
    const apiPublishCodebuild = new ApiPublishCodebuild(
      this,
      "ApiPublishCodebuild",
      { dbSecret: vectorStore.secret }
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

    const frontend = new Frontend(this, "Frontend", {
      accessLogBucket,
      webAclId: props.webAclId,
      enableMistral: props.enableMistral,
    });

    const auth = new Auth(this, "Auth", {
      origin: frontend.getOrigin(),
      userPoolDomainPrefixKey: props.userPoolDomainPrefix,
      idp,
      allowedSignUpEmailDomains: props.allowedSignUpEmailDomains,
      selfSignUpEnabled: props.selfSignUpEnabled,
    });
    const largeMessageBucket = new Bucket(this, "LargeMessageBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const database = new Database(this, "Database", {
      // Enable PITR to export data to s3
      pointInTimeRecovery: true,
    });

    const usageAnalysis = new UsageAnalysis(this, "UsageAnalysis", {
      sourceDatabase: database,
    });

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
      largeMessageBucket,
      enableMistral: props.enableMistral,
    });
    documentBucket.grantReadWrite(backendApi.handler);

    // For streaming response
    const websocket = new WebSocket(this, "WebSocket", {
      vpc,
      dbConfig,
      database: database.table,
      tableAccessRole: database.tableAccessRole,
      websocketSessionTable: database.websocketSessionTable,
      auth,
      bedrockRegion: props.bedrockRegion,
      largeMessageBucket,
    });
    frontend.buildViteApp({
      backendApiEndpoint: backendApi.api.apiEndpoint,
      webSocketApiEndpoint: websocket.apiEndpoint,
      userPoolDomainPrefix: props.userPoolDomainPrefix,
      enableMistral: props.enableMistral,
      auth,
      idp,
    });

    documentBucket.addCorsRule({
      allowedMethods: [HttpMethods.PUT],
      allowedOrigins: [frontend.getOrigin(), "http://localhost:5173", "*"],
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
      embeddingContainerVcpu: props.embeddingContainerVcpu,
      embeddingContainerMemory: props.embeddingContainerMemory,
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

    // Outputs for API publication
    new CfnOutput(this, "PublishedApiWebAclArn", {
      value: webAclForPublishedApi.webAclArn,
      exportName: "PublishedApiWebAclArn",
    });
    new CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      exportName: "BedrockClaudeChatVpcId",
    });
    new CfnOutput(this, "AvailabilityZone0", {
      value: vpc.availabilityZones[0],
      exportName: "BedrockClaudeChatAvailabilityZone0",
    });
    new CfnOutput(this, "AvailabilityZone1", {
      value: vpc.availabilityZones[1],
      exportName: "BedrockClaudeChatAvailabilityZone1",
    });
    new CfnOutput(this, "PublicSubnetId0", {
      value: vpc.publicSubnets[0].subnetId,
      exportName: "BedrockClaudeChatPublicSubnetId0",
    });
    new CfnOutput(this, "PublicSubnetId1", {
      value: vpc.publicSubnets[1].subnetId,
      exportName: "BedrockClaudeChatPublicSubnetId1",
    });
    new CfnOutput(this, "PrivateSubnetId0", {
      value: vpc.privateSubnets[0].subnetId,
      exportName: "BedrockClaudeChatPrivateSubnetId0",
    });
    new CfnOutput(this, "PrivateSubnetId1", {
      value: vpc.privateSubnets[1].subnetId,
      exportName: "BedrockClaudeChatPrivateSubnetId1",
    });
    new CfnOutput(this, "DbConfigSecretArn", {
      value: vectorStore.secret.secretArn,
      exportName: "BedrockClaudeChatDbConfigSecretArn",
    });
    new CfnOutput(this, "DbConfigHostname", {
      value: vectorStore.cluster.clusterEndpoint.hostname,
      exportName: "BedrockClaudeChatDbConfigHostname",
    });
    new CfnOutput(this, "DbConfigPort", {
      value: vectorStore.cluster.clusterEndpoint.port.toString(),
      exportName: "BedrockClaudeChatDbConfigPort",
    });
    new CfnOutput(this, "ConversationTableName", {
      value: database.table.tableName,
      exportName: "BedrockClaudeChatConversationTableName",
    });
    new CfnOutput(this, "TableAccessRoleArn", {
      value: database.tableAccessRole.roleArn,
      exportName: "BedrockClaudeChatTableAccessRoleArn",
    });
    new CfnOutput(this, "DbSecurityGroupId", {
      value: vectorStore.securityGroup.securityGroupId,
      exportName: "BedrockClaudeChatDbSecurityGroupId",
    });
    new CfnOutput(this, "LargeMessageBucketName", {
      value: largeMessageBucket.bucketName,
      exportName: "BedrockClaudeChatLargeMessageBucketName",
    });
  }
}
