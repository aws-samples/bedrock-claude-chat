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
import * as agwa from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { Auth } from "./auth";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

export interface WebSocketProps {
  readonly database: ITable;
  readonly backendApiEndpoint: string;
  readonly auth: Auth;
  readonly tableAccessRole: iam.IRole;
}

export class WebSocket extends Construct {
  readonly webSocketApi: apigwv2.IWebSocketApi;
  private readonly defaultStageName = "dev";

  constructor(scope: Construct, id: string, props: WebSocketProps) {
    super(scope, id);

    const { database, tableAccessRole } = props;

    const authHandler = new python.PythonFunction(this, "AuthHandler", {
      entry: path.join(__dirname, "../../../backend/websocket/auth"),
      runtime: Runtime.PYTHON_3_11,
      environment: {
        USER_POOL_ID: props.auth.userPool.userPoolId,
        CLIENT_ID: props.auth.client.userPoolClientId,
        REGION: Stack.of(this).region,
      },
      timeout: Duration.seconds(10),
    });

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
          file: "websocket/invoke_bedrock/Dockerfile",
        }
      ),
      memorySize: 256,
      timeout: Duration.seconds(60),
      environment: {
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        TABLE_NAME: database.tableName,
        API_ENDPOINT: props.backendApiEndpoint,
        TABLE_ACCESS_ROLE_ARN: tableAccessRole.roleArn,
      },
      role: handlerRole,
    });

    const authorizer = new agwa.WebSocketLambdaAuthorizer(
      "Authorizer",
      authHandler,
      {
        identitySource: ["route.request.querystring.token"],
      }
    );

    const webSocketApi = new apigwv2.WebSocketApi(this, "WebSocketApi", {
      connectRouteOptions: {
        authorizer,
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          handler
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DefaultIntegration",
          handler
        ),
      },
    });
    new apigwv2.WebSocketStage(this, "WebSocketStage", {
      webSocketApi,
      stageName: this.defaultStageName,
      autoDeploy: true,
    });
    webSocketApi.grantManageConnections(handler);
    // webSocketApi.addRoute("Stream", {
    //   integration: new WebSocketLambdaIntegration(
    //     "StreamIntegration",
    //     handler
    //   ),
    // });

    this.webSocketApi = webSocketApi;

    new CfnOutput(this, "WebSocketEndpoint", {
      value: webSocketApi.apiEndpoint,
    });
  }

  get apiEndpoint() {
    return `${this.webSocketApi.apiEndpoint}/${this.defaultStageName}`;
  }
}
