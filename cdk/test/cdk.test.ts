import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";

describe("Snapshot Test", () => {
  const app = new cdk.App();
  test("Identity Provider Generation", () => {
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
    const hasGooglePRoviderTemplate = Template.fromStack(
      hasGoogleProviderStack
    ).toJSON();
    expect(hasGooglePRoviderTemplate).toMatchSnapshot();
  });

  test("default stack", () => {
    const stack = new BedrockChatStack(app, "MyTestStack", {
      bedrockRegion: "us-east-1",
      crossRegionReferences: true,
      webAclId: "",
      enableUsageAnalysis: true,
      identityProviders: [],
      userPoolDomainPrefix: "",
      publishedApiAllowedIpV4AddressRanges: [""],
      publishedApiAllowedIpV6AddressRanges: [""],
    });
    const template = Template.fromStack(stack).toJSON();
    expect(template).toMatchSnapshot();
  });
});

describe("Fine-grained Assertions Test", () => {
  const app = new cdk.App();
});

describe("Error handling", () => {
  const app = new cdk.App();

  test("Invalid service name", () => {
    const invalidProviderStack = new BedrockChatStack(app, "MyTestStack", {
      bedrockRegion: "us-east-1",
      crossRegionReferences: true,
      webAclId: "",
      enableUsageAnalysis: true,
      identityProviders: [
        {
          secretName: "MyTestSecret",
          service: "openai",
        },
      ],
      userPoolDomainPrefix: "test-domain",
      publishedApiAllowedIpV4AddressRanges: [""],
      publishedApiAllowedIpV6AddressRanges: [""],
    });

    // expect
  });
  test("Lack of userPoolPrefix definition during Identity Provider generation", () => {
    const invalidProviderStack = new BedrockChatStack(app, "MyTestStack", {
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
      userPoolDomainPrefix: "",
      publishedApiAllowedIpV4AddressRanges: [""],
      publishedApiAllowedIpV6AddressRanges: [""],
    });
    // expect
  });
});
