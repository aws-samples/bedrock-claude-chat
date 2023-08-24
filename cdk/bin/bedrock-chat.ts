#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";

const app = new cdk.App();

const BEDROCK_REGION = app.node.tryGetContext("bedrockRegion");
const BEDROCK_ENDPOINT_URL = app.node.tryGetContext("bedrockEndpointUrl");

new BedrockChatStack(app, `BedrockChatStack`, {
  bedrockRegion: BEDROCK_REGION,
  bedrockEndpointUrl: BEDROCK_ENDPOINT_URL,
});
