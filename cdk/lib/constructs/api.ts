import { Construct } from "constructs";
import { CfnOutput, Duration } from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { Auth } from "./auth";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { Stack } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export interface ApiProps {
  readonly database: ITable;
  readonly corsAllowOrigins?: string[];
  readonly auth: Auth;
  readonly bedrockRegion: string;
  readonly bedrockEndpointUrl: string;
}

export class Api extends Construct {
  readonly api: HttpApi;
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    const { database, corsAllowOrigins: allowOrigins = ["*"] } = props;

    const tableAccessRole = new iam.Role(this, "TableAccessRole", {
      assumedBy: new iam.AccountPrincipal(Stack.of(this).account),
    });
    database.grantReadWriteData(tableAccessRole);

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

    const handler = new DockerImageFunction(this, "Handler", {
      code: DockerImageCode.fromImageAsset("../backend", {
        platform: Platform.LINUX_AMD64,
      }),
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: database.tableName,
        CORS_ALLOW_ORIGINS: allowOrigins.join(","),
        USER_POOL_ID: props.auth.userPool.userPoolId,
        CLIENT_ID: props.auth.client.userPoolClientId,
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        BEDROCK_REGION: props.bedrockRegion,
        ENDPOINT_URL: props.bedrockEndpointUrl,
        TABLE_ACCESS_ROLE_ARN: tableAccessRole.roleArn,
      },
      role: handlerRole,
    });

    const api = new HttpApi(this, "Default", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.HEAD,
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
        ],
        allowOrigins: allowOrigins,
        maxAge: Duration.days(10),
      },
    });

    const integration = new HttpLambdaIntegration("Integration", handler);
    const authorizer = new HttpUserPoolAuthorizer(
      "Authorizer",
      props.auth.userPool,
      {
        userPoolClients: [props.auth.client],
      }
    );
    let routeProps: any = {
      path: "/{proxy+}",
      integration,
      methods: [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.PATCH,
        HttpMethod.DELETE,
      ],
      authorizer,
    };

    api.addRoutes(routeProps);

    this.api = api;

    new CfnOutput(this, "BackendApiUrl", { value: api.apiEndpoint });
  }
}
