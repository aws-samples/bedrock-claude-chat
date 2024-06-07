#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiPublishmentStack, VpcConfig } from "../lib/api-publishment-stack";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

const app = new cdk.App();

const BEDROCK_REGION = app.node.tryGetContext("bedrockRegion");

// Usage plan for the published API
const PUBLISHED_API_THROTTLE_RATE_LIMIT: number | undefined =
  app.node.tryGetContext("publishedApiThrottleRateLimit")
    ? Number(app.node.tryGetContext("publishedApiThrottleRateLimit"))
    : undefined;
const PUBLISHED_API_THROTTLE_BURST_LIMIT: number | undefined =
  app.node.tryGetContext("publishedApiThrottleBurstLimit")
    ? Number(app.node.tryGetContext("publishedApiThrottleBurstLimit"))
    : undefined;
const PUBLISHED_API_QUOTA_LIMIT: number | undefined = app.node.tryGetContext(
  "publishedApiQuotaLimit"
)
  ? Number(app.node.tryGetContext("publishedApiQuotaLimit"))
  : undefined;
const PUBLISHED_API_QUOTA_PERIOD: "DAY" | "WEEK" | "MONTH" | undefined =
  app.node.tryGetContext("publishedApiQuotaPeriod")
    ? app.node.tryGetContext("publishedApiQuotaPeriod")
    : undefined;
const PUBLISHED_API_DEPLOYMENT_STAGE = app.node.tryGetContext(
  "publishedApiDeploymentStage"
);
const PUBLISHED_API_ID: string = app.node.tryGetContext("publishedApiId");
const PUBLISHED_API_ALLOWED_ORIGINS_STRING: string = app.node.tryGetContext(
  "publishedApiAllowedOrigins"
);
const PUBLISHED_API_ALLOWED_ORIGINS: string[] = JSON.parse(
  PUBLISHED_API_ALLOWED_ORIGINS_STRING || '["*"]'
);

console.log(
  `PUBLISHED_API_THROTTLE_RATE_LIMIT: ${PUBLISHED_API_THROTTLE_RATE_LIMIT}`
);
console.log(
  `PUBLISHED_API_THROTTLE_BURST_LIMIT: ${PUBLISHED_API_THROTTLE_BURST_LIMIT}`
);
console.log(`PUBLISHED_API_QUOTA_LIMIT: ${PUBLISHED_API_QUOTA_LIMIT}`);
console.log(`PUBLISHED_API_QUOTA_PERIOD: ${PUBLISHED_API_QUOTA_PERIOD}`);
console.log(
  `PUBLISHED_API_DEPLOYMENT_STAGE: ${PUBLISHED_API_DEPLOYMENT_STAGE}`
);
console.log(`PUBLISHED_API_ID: ${PUBLISHED_API_ID}`);
console.log(`PUBLISHED_API_ALLOWED_ORIGINS: ${PUBLISHED_API_ALLOWED_ORIGINS}`);

const webAclArn = cdk.Fn.importValue("PublishedApiWebAclArn");
const vpcId = cdk.Fn.importValue("BedrockClaudeChatVpcId");
const availabilityZone0 = cdk.Fn.importValue(
  "BedrockClaudeChatAvailabilityZone0"
);
const availabilityZone1 = cdk.Fn.importValue(
  "BedrockClaudeChatAvailabilityZone1"
);
const publicSubnetId0 = cdk.Fn.importValue("BedrockClaudeChatPublicSubnetId0");
const publicSubnetId1 = cdk.Fn.importValue("BedrockClaudeChatPublicSubnetId1");
const privateSubnetId0 = cdk.Fn.importValue(
  "BedrockClaudeChatPrivateSubnetId0"
);
const privateSubnetId1 = cdk.Fn.importValue(
  "BedrockClaudeChatPrivateSubnetId1"
);

const vpcConfig = {
  vpcId: vpcId,
  availabilityZones: [availabilityZone0, availabilityZone1],
  publicSubnetIds: [publicSubnetId0, publicSubnetId1],
  privateSubnetIds: [privateSubnetId0, privateSubnetId1],
  isolatedSubnetIds: [],
};

const conversationTableName = cdk.Fn.importValue(
  "BedrockClaudeChatConversationTableName"
);
const tableAccessRoleArn = cdk.Fn.importValue(
  "BedrockClaudeChatTableAccessRoleArn"
);

const dbConfigHostname = cdk.Fn.importValue(
  "BedrockClaudeChatDbConfigHostname"
);
const dbConfigPort = cdk.Token.asNumber(
  cdk.Fn.importValue("BedrockClaudeChatDbConfigPort")
);

const dbConfigSecretArn = cdk.Fn.importValue(
  "BedrockClaudeChatDbConfigSecretArn"
);
const dbSecurityGroupId = cdk.Fn.importValue(
  "BedrockClaudeChatDbSecurityGroupId"
);
const largeMessageBucketName = cdk.Fn.importValue(
  "BedrockClaudeChatLargeMessageBucketName"
);

// NOTE: DO NOT change the stack id naming rule.
const publishedApi = new ApiPublishmentStack(
  app,
  `ApiPublishmentStack${PUBLISHED_API_ID}`,
  {
    env: {
      region: process.env.CDK_DEFAULT_REGION,
    },
    bedrockRegion: BEDROCK_REGION,
    vpcConfig: vpcConfig,
    conversationTableName: conversationTableName,
    tableAccessRoleArn: tableAccessRoleArn,
    dbConfigSecretArn: dbConfigSecretArn,
    dbConfigHostname: dbConfigHostname,
    dbConfigPort: dbConfigPort,
    dbSecurityGroupId: dbSecurityGroupId,
    webAclArn: webAclArn,
    largeMessageBucketName: largeMessageBucketName,
    usagePlan: {
      throttle:
        PUBLISHED_API_THROTTLE_RATE_LIMIT !== undefined &&
        PUBLISHED_API_THROTTLE_BURST_LIMIT !== undefined
          ? {
              rateLimit: PUBLISHED_API_THROTTLE_RATE_LIMIT,
              burstLimit: PUBLISHED_API_THROTTLE_BURST_LIMIT,
            }
          : undefined,
      quota:
        PUBLISHED_API_QUOTA_LIMIT !== undefined &&
        PUBLISHED_API_QUOTA_PERIOD !== undefined
          ? {
              limit: PUBLISHED_API_QUOTA_LIMIT,
              period: apigateway.Period[PUBLISHED_API_QUOTA_PERIOD],
            }
          : undefined,
    },
    deploymentStage: PUBLISHED_API_DEPLOYMENT_STAGE,
    corsOptions: {
      allowOrigins: PUBLISHED_API_ALLOWED_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      allowCredentials: true,
    },
  }
);
