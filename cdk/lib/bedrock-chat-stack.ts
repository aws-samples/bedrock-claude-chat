import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Auth } from "./constructs/auth";
import { Api } from "./constructs/api";
import { Database } from "./constructs/database";
import { Frontend } from "./constructs/frontend";
import { WebSocket } from "./constructs/websocket";
import * as cdk from "aws-cdk-lib";

export interface BedrockChatStackProps extends StackProps {
  readonly bedrockRegion: string;
  readonly bedrockEndpointUrl: string;
}

export class BedrockChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BedrockChatStackProps) {
    super(scope, id, props);

    const accessLogBucket = new Bucket(this, "AccessLogBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const auth = new Auth(this, "Auth");
    const database = new Database(this, "Database");
    const backendApi = new Api(this, "BackendApi", {
      database: database.table,
      auth,
      bedrockRegion: props.bedrockRegion,
      bedrockEndpointUrl: props.bedrockEndpointUrl,
      tableAccessRole: database.tableAccessRole,
    });

    // For streaming response
    const websocket = new WebSocket(this, "WebSocket", {
      database: database.table,
      backendApiEndpoint: backendApi.api.apiEndpoint,
      tableAccessRole: database.tableAccessRole,
      auth,
      bedrockRegion: props.bedrockRegion,
      bedrockEndpointUrl: props.bedrockEndpointUrl,
    });

    const frontend = new Frontend(this, "Frontend", {
      backendApi: backendApi.api,
      auth,
      accessLogBucket,
    });

    new CfnOutput(this, "FrontendURL", {
      value: `https://${frontend.cloudFrontWebDistribution.distributionDomainName}`,
    });
  }
}
