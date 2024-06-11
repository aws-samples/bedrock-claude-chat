import * as cdk from "aws-cdk-lib";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as path from "path";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface VpcConfig {
  vpcId: string;
  availabilityZones: string[];
  publicSubnetIds: string[];
  privateSubnetIds: string[];
  isolatedSubnetIds: string[];
}
interface ApiPublishmentStackProps extends StackProps {
  readonly bedrockRegion: string;
  readonly vpcConfig: VpcConfig;
  readonly dbConfigHostname: string;
  readonly dbConfigPort: number;
  readonly dbConfigSecretArn: string;
  readonly dbSecurityGroupId: string;
  readonly conversationTableName: string;
  readonly tableAccessRoleArn: string;
  readonly webAclArn: string;
  readonly usagePlan: apigateway.UsagePlanProps;
  readonly deploymentStage?: string;
  readonly largeMessageBucketName: string;
  readonly corsOptions?: apigateway.CorsOptions;
}

export class ApiPublishmentStack extends Stack {
  public readonly chatQueue: sqs.Queue;
  constructor(scope: Construct, id: string, props: ApiPublishmentStackProps) {
    super(scope, id, props);

    console.log(`usagePlan: ${JSON.stringify(props.usagePlan)}`); // DEBUG

    const dbSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "DbSecret",
      props.dbConfigSecretArn
    );

    const deploymentStage = props.deploymentStage ?? "dev";
    const vpc = ec2.Vpc.fromVpcAttributes(this, "Vpc", props.vpcConfig);

    const chatQueue = new sqs.Queue(this, "ChatQueue", {
      visibilityTimeout: cdk.Duration.minutes(30),
    });

    const handlerRole = new iam.Role(this, "HandlerRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    handlerRole.addToPolicy(
      // Assume the table access role for row-level access control.
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [props.tableAccessRoleArn],
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
    const largeMessageBucket = s3.Bucket.fromBucketName(
      this,
      "LargeMessageBucket",
      props.largeMessageBucketName
    );
    largeMessageBucket.grantReadWrite(handlerRole);

    // Handler for FastAPI
    const apiHandler = new DockerImageFunction(this, "ApiHandler", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../backend"),
        {
          platform: Platform.LINUX_AMD64,
          file: "Dockerfile",
        }
      ),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      memorySize: 1024,
      timeout: cdk.Duration.minutes(15),
      environment: {
        PUBLISHED_API_ID: id.replace("ApiPublishmentStack", ""),
        QUEUE_URL: chatQueue.queueUrl,
        TABLE_NAME: props.conversationTableName,
        CORS_ALLOW_ORIGINS: (props.corsOptions?.allowOrigins ?? ["*"]).join(
          ","
        ),
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        BEDROCK_REGION: props.bedrockRegion,
        LARGE_MESSAGE_BUCKET: props.largeMessageBucketName,
        TABLE_ACCESS_ROLE_ARN: props.tableAccessRoleArn,
        DB_SECRETS_ARN: props.dbConfigSecretArn,
      },
      role: handlerRole,
    });

    // Handler for SQS consumer
    const sqsConsumeHandler = new DockerImageFunction(
      this,
      "SqsConsumeHandler",
      {
        code: DockerImageCode.fromImageAsset(
          path.join(__dirname, "../../backend"),
          {
            platform: Platform.LINUX_AMD64,
            file: "websocket.Dockerfile",
            cmd: ["app.sqs_consumer.handler"],
          }
        ),
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        memorySize: 1024,
        timeout: cdk.Duration.minutes(15),
        environment: {
          PUBLISHED_API_ID: id.replace("ApiPublishmentStack", ""),
          QUEUE_URL: chatQueue.queueUrl,
          TABLE_NAME: props.conversationTableName,
          CORS_ALLOW_ORIGINS: (props.corsOptions?.allowOrigins ?? ["*"]).join(
            ","
          ),
          ACCOUNT: Stack.of(this).account,
          REGION: Stack.of(this).region,
          BEDROCK_REGION: props.bedrockRegion,
          TABLE_ACCESS_ROLE_ARN: props.tableAccessRoleArn,
          DB_SECRETS_ARN: props.dbConfigSecretArn,
        },
        role: handlerRole,
      }
    );
    dbSecret.grantRead(sqsConsumeHandler);
    sqsConsumeHandler.addEventSource(
      new lambdaEventSources.SqsEventSource(chatQueue)
    );
    chatQueue.grantSendMessages(apiHandler);
    chatQueue.grantConsumeMessages(sqsConsumeHandler);

    // Allow the handler to access the pgvector.
    const dbSg = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "DbSecurityGroup",
      props.dbSecurityGroupId
    );
    dbSg.connections.allowFrom(
      sqsConsumeHandler,
      ec2.Port.tcp(props.dbConfigPort)
    );

    const api = new apigateway.LambdaRestApi(this, "Api", {
      restApiName: id,
      handler: apiHandler,
      proxy: true,
      deployOptions: {
        stageName: deploymentStage,
      },
      defaultMethodOptions: { apiKeyRequired: true },
      defaultCorsPreflightOptions: props.corsOptions,
    });

    const apiKey = api.addApiKey("ApiKey", {
      description: "Default api key (Auto generated by CDK)",
    });
    const usagePlan = api.addUsagePlan("UsagePlan", {
      ...props.usagePlan,
    });
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });

    const association = new wafv2.CfnWebACLAssociation(
      this,
      "WebAclAssociation",
      {
        resourceArn: `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`,
        webAclArn: props.webAclArn,
      }
    );
    association.addDependency(api.node.defaultChild as cdk.CfnResource);

    this.chatQueue = chatQueue;

    new CfnOutput(this, "ApiId", {
      value: api.restApiId,
    });
    new CfnOutput(this, "ApiName", {
      value: api.restApiName,
    });
    new CfnOutput(this, "ApiUsagePlanId", {
      value: usagePlan.usagePlanId,
    });
    new CfnOutput(this, "AllowedOrigins", {
      value: props.corsOptions?.allowOrigins?.join(",") ?? "*",
    });
    new CfnOutput(this, "DeploymentStage", {
      value: deploymentStage,
    });
  }
}
