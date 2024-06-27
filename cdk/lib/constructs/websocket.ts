import { Construct } from "constructs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

import {
  DockerImageCode,
  DockerImageFunction,
  IFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { Auth } from "./auth";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { CfnRouteResponse } from "aws-cdk-lib/aws-apigatewayv2";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface WebSocketProps {
  readonly vpc: ec2.IVpc;
  readonly database: ITable;
  readonly dbSecrets: ISecret;
  readonly auth: Auth;
  readonly bedrockRegion: string;
  readonly tableAccessRole: iam.IRole;
  readonly documentBucket: s3.IBucket;
  readonly websocketSessionTable: ITable;
  readonly largeMessageBucket: s3.IBucket;
  readonly accessLogBucket?: s3.Bucket;
}

export class WebSocket extends Construct {
  readonly webSocketApi: apigwv2.IWebSocketApi;
  readonly handler: IFunction;
  private readonly defaultStageName = "dev";

  constructor(scope: Construct, id: string, props: WebSocketProps) {
    super(scope, id);

    const { database, tableAccessRole } = props;

    // Bucket for SNS large payload support
    // See: https://docs.aws.amazon.com/sns/latest/dg/extended-client-library-python.html
    const largePayloadSupportBucket = new s3.Bucket(
      this,
      "LargePayloadSupportBucket",
      {
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.DESTROY,
        objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
        autoDeleteObjects: true,
        serverAccessLogsBucket: props.accessLogBucket,
        serverAccessLogsPrefix: "LargePayloadSupportBucket",
      }
    );

    const handlerRole = new iam.Role(this, "HandlerRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    handlerRole.addToPolicy(
      // Assume the table access role for row-level access control.
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [tableAccessRole.roleArn],
      })
    );
    handlerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:*"],
        resources: ["*"],
      })
    );
    handlerRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );
    largePayloadSupportBucket.grantRead(handlerRole);
    props.websocketSessionTable.grantReadWriteData(handlerRole);
    props.largeMessageBucket.grantReadWrite(handlerRole);
    props.documentBucket.grantRead(handlerRole);

    const handler = new DockerImageFunction(this, "Handler", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../../backend"),
        {
          platform: Platform.LINUX_AMD64,
          file: "websocket.Dockerfile",
        }
      ),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      memorySize: 512,
      timeout: Duration.minutes(15),
      environment: {
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        USER_POOL_ID: props.auth.userPool.userPoolId,
        CLIENT_ID: props.auth.client.userPoolClientId,
        BEDROCK_REGION: props.bedrockRegion,
        TABLE_NAME: database.tableName,
        TABLE_ACCESS_ROLE_ARN: tableAccessRole.roleArn,
        LARGE_MESSAGE_BUCKET: props.largeMessageBucket.bucketName,
        DB_SECRETS_ARN: props.dbSecrets.secretArn,
        LARGE_PAYLOAD_SUPPORT_BUCKET: largePayloadSupportBucket.bucketName,
        WEBSOCKET_SESSION_TABLE_NAME: props.websocketSessionTable.tableName,
      },
      role: handlerRole,
    });
    props.dbSecrets.grantRead(handler);

    const webSocketApi = new apigwv2.WebSocketApi(this, "WebSocketApi", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          handler
        ),
      },
    });
    const route = webSocketApi.addRoute("$default", {
      integration: new WebSocketLambdaIntegration(
        "DefaultIntegration",
        handler
      ),
    });
    new apigwv2.WebSocketStage(this, "WebSocketStage", {
      webSocketApi,
      stageName: this.defaultStageName,
      autoDeploy: true,
    });
    webSocketApi.grantManageConnections(handler);

    new CfnRouteResponse(this, "RouteResponse", {
      apiId: webSocketApi.apiId,
      routeId: route.routeId,
      routeResponseKey: "$default",
    });

    this.webSocketApi = webSocketApi;
    this.handler = handler;

    new CfnOutput(this, "WebSocketEndpoint", {
      value: this.apiEndpoint,
    });
  }

  get apiEndpoint() {
    return `${this.webSocketApi.apiEndpoint}/${this.defaultStageName}`;
  }
}
