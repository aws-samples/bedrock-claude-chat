import * as cdk from "aws-cdk-lib";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";
import { Template } from "aws-cdk-lib/assertions";

describe("Fine-grained Assertions Test", () => {
  const app = new cdk.App();
  test("Identity Provider Generation", () => {
    const hasGoogleProviderStack = new BedrockChatStack(
      app,
      "IdentityProviderGenerateStack",
      {
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
      }
    );
    const hasGoogleProviderTemplate = Template.fromStack(
      hasGoogleProviderStack
    ).toJSON();

    // hasGoogleProviderTemplate.resourceCountIs("AWS::SecretsManager::Secret", 1);

    // hasGoogleProviderTemplate.hasResourceProperties("AWS::Cognito::UserPool", {
    //   // WIP
    // });
    // hasGoogleProviderTemplate.hasResourceProperties(
    //   "AWS::Cognito::UserPoolClient",
    //   {
    //     // WIP
    //   }
    // );
    // hasGoogleProviderTemplate.hasResourceProperties(
    //   "AWS::Cognito::UserPoolIdentityProvider",
    //   {
    //     ProviderName: "Google",
    //     ProviderType: "Google",
    //   }
    // );
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

    // template.resourceCountIs("AWS::SecretsManager::Secret", 0);

    // template.hasResourceProperties("AWS::Cognito::UserPool", {
    //   // WIP
    // });
    // template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
    //   // WIP
    // });
    // template.resourceCountIs("AWS::Cognito::UserPoolIdentityProvider", 0);
  });
});
