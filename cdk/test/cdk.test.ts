import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";

describe("SnapshotTest", () => {
  const app = new cdk.App();

  const hasGoogleProviderStack = new BedrockChatStack(app, "MyTestStack", {
    bedrockRegion: "us-east-1",
    crossRegionReferences: true,
    webAclId: "",
    enableUsageAnalysis: true,
    identityProviders: [
      {
        secretName: "MyTestSecret",
        service: "google",
      },
    ],
    userPoolDomainPrefix: "test-domain",
    publishedApiAllowedIpV4AddressRanges: [""],
    publishedApiAllowedIpV6AddressRanges: [""],
  });

  const planeStack = new BedrockChatStack(app, "MyTestStack", {
    bedrockRegion: "us-east-1",
    crossRegionReferences: true,
    webAclId: "",
    enableUsageAnalysis: true,
    identityProviders: [],
    userPoolDomainPrefix: "",
    publishedApiAllowedIpV4AddressRanges: [""],
    publishedApiAllowedIpV6AddressRanges: [""],
  });

  const hasGooglePRoviderTemplate = Template.fromStack(
    hasGoogleProviderStack
  ).toJSON();
  const planeTemplate = Template.fromStack(planeStack).toJSON();

  expect(hasGooglePRoviderTemplate).toMatchSnapshot();
  expect(planeTemplate).toMatchSnapshot();
});

describe("Fine-grained Assertions Test", () => {
  const app = new cdk.App();
});
