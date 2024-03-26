import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";

describe("Snapshot Test", () => {
  const app = new cdk.App();
  test("Identity Provider Generation", () => {});
  test("default stack", () => {});
});

describe("Fine-grained Assertions Test", () => {
  const app = new cdk.App();
});

describe("Error handling", () => {
  test("Invalid service name", () => {});
  test("Lack of userPoolPrefix definition during Identity Provider generation");
});
