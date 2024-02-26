#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";
import { FrontendWafStack } from "../lib/frontend-waf-stack";
import { ApiPublishmentStack } from "../lib/api-publishment-stack";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

const app = new cdk.App();

const BEDROCK_REGION = app.node.tryGetContext("bedrockRegion");

// Allowed IP address ranges for this app itself
const ALLOWED_IP_V4_ADDRESS_RANGES: string[] = app.node.tryGetContext(
  "allowedIpV4AddressRanges"
);
const ALLOWED_IP_V6_ADDRESS_RANGES: string[] = app.node.tryGetContext(
  "allowedIpV6AddressRanges"
);

// Allowed IP address ranges for the published API
const PUBLISHED_API_ALLOWED_IP_V4_ADDRESS_RANGES: string[] =
  app.node.tryGetContext("publishedApiAllowedIpV4AddressRanges");
const PUBLISHED_API_ALLOWED_IP_V6_ADDRESS_RANGES: string[] =
  app.node.tryGetContext("publishedApiAllowedIpV6AddressRanges");

const ENABLE_USAGE_ANALYSIS: boolean = app.node.tryGetContext(
  "enableUsageAnalysis"
);

// Usage plan for the published API
const PUBLISHED_API_THROTTLE_RATE_LIMIT: string = app.node.tryGetContext(
  "publishedApiThrottleRateLimit"
);
const PUBLISHED_API_THROTTLE_BURST_LIMIT: string = app.node.tryGetContext(
  "publishedApiThrottleBurstLimit"
);
const PUBLISHED_API_QUOTA_LIMIT: string = app.node.tryGetContext(
  "publishedApiQuotaLimit"
);
const PUBLISHED_API_QUOTA_PERIOD: "DAY" | "WEEK" | "MONTH" =
  app.node.tryGetContext("publishedApiQuotaPeriod");
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
// WAF for frontend
// 2023/9: Currently, the WAF for CloudFront needs to be created in the North America region (us-east-1), so the stacks are separated
// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html
const waf = new FrontendWafStack(app, `FrontendWafStack`, {
  env: {
    region: "us-east-1",
  },
  allowedIpV4AddressRanges: ALLOWED_IP_V4_ADDRESS_RANGES,
  allowedIpV6AddressRanges: ALLOWED_IP_V6_ADDRESS_RANGES,
});

const chat = new BedrockChatStack(app, `BedrockChatStack`, {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
  },
  crossRegionReferences: true,
  bedrockRegion: BEDROCK_REGION,
  webAclId: waf.webAclArn.value,
  enableUsageAnalysis: ENABLE_USAGE_ANALYSIS,
});
chat.addDependency(waf);

// NOTE: Do not change the stack id naming rule.
new ApiPublishmentStack(app, `ApiPublishmentStack${PUBLISHED_API_ID}`, {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
  },
  bedrockRegion: BEDROCK_REGION,
  // vpc: ec2.Vpc.fromLookup(app, "VPC", { isDefault: true }),
  allowedIpV4AddressRanges: PUBLISHED_API_ALLOWED_IP_V4_ADDRESS_RANGES,
  allowedIpV6AddressRanges: PUBLISHED_API_ALLOWED_IP_V6_ADDRESS_RANGES,
  usagePlan: {
    throttle: {
      rateLimit: Number(PUBLISHED_API_THROTTLE_RATE_LIMIT),
      burstLimit: Number(PUBLISHED_API_THROTTLE_BURST_LIMIT),
    },
    quota: {
      limit: Number(PUBLISHED_API_QUOTA_LIMIT),
      period: apigateway.Period[PUBLISHED_API_QUOTA_PERIOD],
    },
  },
  deploymentStage: PUBLISHED_API_DEPLOYMENT_STAGE,
  corsOptions: {
    allowOrigins: PUBLISHED_API_ALLOWED_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
    allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
    allowCredentials: true,
  },
});
