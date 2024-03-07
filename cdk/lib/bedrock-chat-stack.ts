import { CfnOutput, RemovalPolicy, StackProps, Stack } from "aws-cdk-lib";
import { HttpMethods, ObjectOwnership } from "aws-cdk-lib/aws-s3";

import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { NodejsBuild } from "deploy-time-build";

import { Construct } from "constructs";
import { Auth } from "./constructs/auth";
import { Api } from "./constructs/api";
import { Database } from "./constructs/database";
import { WebSocket } from "./constructs/websocket";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Embedding } from "./constructs/embedding";
import { VectorStore } from "./constructs/vectorstore";
import { UsageAnalysis } from "./constructs/usage-analysis";

export interface BedrockChatStackProps extends StackProps {
  readonly bedrockRegion: string;
  readonly webAclId: string;
  readonly enableUsageAnalysis: boolean;
}

export class BedrockChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BedrockChatStackProps) {
    super(scope, id, {
      description: "Bedrock Chat Stack (uksb-1tupboc46)",
      ...props,
    });

    const vpc = new ec2.Vpc(this, "VPC", {});
    const vectorStore = new VectorStore(this, "VectorStore", {
      vpc: vpc,
    });

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

    const assetBucket = new Bucket(this, "AssetBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    const userPoolDomainPrefixKey: string = this.node.tryGetContext(
      "userPoolDomainPrefix"
    );
    const distribution = new CloudFrontWebDistribution(this, "Distribution", {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: assetBucket,
            originAccessIdentity,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          errorCachingMinTtl: 0,
          responseCode: 200,
          responsePagePath: "/",
        },
        {
          errorCode: 403,
          errorCachingMinTtl: 0,
          responseCode: 200,
          responsePagePath: "/",
        },
      ],
      loggingConfig: {
        bucket: accessLogBucket,
        prefix: "Frontend/",
      },
      webACLId: props.webAclId,
    });

    const getOrigin = () => {
      return `https://${distribution.distributionDomainName}`;
    };

    const documentBucket = new Bucket(this, "DocumentBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const auth = new Auth(this, "Auth", { origin: getOrigin() });
    const database = new Database(this, "Database", {
      // Enable PITR to export data to s3 if usage analysis is enabled
      pointInTimeRecovery: props.enableUsageAnalysis,
    });

    const backendApi = new Api(this, "BackendApi", {
      vpc,
      database: database.table,
      auth,
      bedrockRegion: props.bedrockRegion,
      tableAccessRole: database.tableAccessRole,
      dbConfig,
      documentBucket,
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
    });

    documentBucket.addCorsRule({
      allowedMethods: [HttpMethods.PUT],
      allowedOrigins: [getOrigin(), "http://localhost:5173"],
      allowedHeaders: ["*"],
      maxAge: 3000,
    });

    const region = Stack.of(auth.userPool).region;

    new NodejsBuild(this, "ReactBuild", {
      assets: [
        {
          path: "../frontend",
          exclude: ["node_modules", "dist"],
          commands: ["npm ci"],
        },
      ],
      buildCommands: ["npm run build"],
      buildEnvironment: {
        VITE_APP_API_ENDPOINT: backendApi.api.apiEndpoint,
        VITE_APP_WS_ENDPOINT: websocket.apiEndpoint,
        VITE_APP_USER_POOL_ID: auth.userPool.userPoolId,
        VITE_APP_USER_POOL_CLIENT_ID: auth.client.userPoolClientId,
        VITE_APP_REGION: region,
        VITE_APP_REDIRECT_SIGNIN_URL: getOrigin(),
        VITE_APP_REDIRECT_SIGNOUT_URL: getOrigin(),
        VITE_APP_COGNITO_DOMAIN: `${userPoolDomainPrefixKey}.auth.${region}.amazoncognito.com/`,
        VITE_APP_USE_STREAMING: "true",
      },
      destinationBucket: assetBucket,
      distribution,
      outputSourceDirectory: "dist",
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

    if (props.enableUsageAnalysis) {
      new UsageAnalysis(this, "UsageAnalysis", {
        sourceDatabase: database,
      });
    }

    new CfnOutput(this, "DocumentBucketName", {
      value: documentBucket.bucketName,
    });
    new CfnOutput(this, "FrontendURL", {
      value: getOrigin(),
    });
  }
}
