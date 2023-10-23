import { Construct } from "constructs";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as python from "@aws-cdk/aws-lambda-python-alpha";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as sns from "aws-cdk-lib/aws-sns";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Auth } from "./auth";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { CfnRouteResponse } from "aws-cdk-lib/aws-apigatewayv2";

export interface WebSocketProps {
  readonly database: ITable;
  readonly auth: Auth;
  readonly bedrockRegion: string;
  readonly tableAccessRole: iam.IRole;
}

export class WebSocket extends Construct {
  readonly webSocketApi: apigwv2.IWebSocketApi;
  private readonly defaultStageName = "dev";

  constructor(scope: Construct, id: string, props: WebSocketProps) {
    super(scope, id);

    const { database, tableAccessRole } = props;

    const topic = new sns.Topic(this, "SnsTopic", {
      displayName: "WebSocketTopic",
    });

    const publisher = new python.PythonFunction(this, "Publisher", {
      entry: path.join(__dirname, "../../../backend/publisher"),
      runtime: Runtime.PYTHON_3_11,
      environment: {
        WEBSOCKET_TOPIC_ARN: topic.topicArn,
      },
    });
    topic.grantPublish(publisher);

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
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    const handler = new DockerImageFunction(this, "Handler", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../../backend"),
        {
          platform: Platform.LINUX_AMD64,
          file: "websocket.Dockerfile",
        }
      ),
      memorySize: 256,
      timeout: Duration.minutes(15),
      environment: {
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        USER_POOL_ID: props.auth.userPool.userPoolId,
        CLIENT_ID: props.auth.client.userPoolClientId,
        BEDROCK_REGION: props.bedrockRegion,
        TABLE_NAME: database.tableName,
        TABLE_ACCESS_ROLE_ARN: tableAccessRole.roleArn,
      },
      role: handlerRole,
    });
    handler.addEventSource(
      new SnsEventSource(topic, {
        filterPolicy: {},
      })
    );

    const webSocketApi = new apigwv2.WebSocketApi(this, "WebSocketApi", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          publisher
        ),
      },
    });
    const route = webSocketApi.addRoute("$default", {
      integration: new WebSocketLambdaIntegration(
        "DefaultIntegration",
        publisher
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

    new CfnOutput(this, "WebSocketEndpoint", {
      value: this.apiEndpoint,
    });
  }

  get apiEndpoint() {
    return `${this.webSocketApi.apiEndpoint}/${this.defaultStageName}`;
  }
}
