import * as cdk from "aws-cdk-lib";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";
import { Match, Template } from "aws-cdk-lib/assertions";
import { has } from "effect/HashSet";

describe("Fine-grained Assertions Test", () => {
  test("Identity Provider Generation", () => {
    const app = new cdk.App();
    const domainPrefix = "test-domain";

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
        userPoolDomainPrefix: domainPrefix,
        publishedApiAllowedIpV4AddressRanges: [""],
        publishedApiAllowedIpV6AddressRanges: [""],
      }
    );
    const hasGoogleProviderTemplate = Template.fromStack(
      hasGoogleProviderStack
    );

    hasGoogleProviderTemplate.hasResourceProperties(
      "AWS::Cognito::UserPoolDomain",
      {
        Domain: domainPrefix,
      }
    );

    hasGoogleProviderTemplate.hasResource("AWS::Cognito::UserPoolClient", {
      DependsOn: ["AuthGoogleProviderA3A93E63"],
    });
    hasGoogleProviderTemplate.hasResourceProperties(
      "AWS::Cognito::UserPoolClient",
      {
        SupportedIdentityProviders: ["Google", "COGNITO"],
      }
    );
    hasGoogleProviderTemplate.hasResourceProperties(
      "AWS::Cognito::UserPoolIdentityProvider",
      {
        ProviderName: "Google",
        ProviderType: "Google",
      }
    );
  });

  test("default stack", () => {
    const app = new cdk.App();

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
    const template = Template.fromStack(stack);

    // template.hasResourceProperties("AWS::Cognito::UserPool", {
    //   // WIP
    // });
    // template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
    //   // WIP
    // });
    template.resourceCountIs("AWS::Cognito::UserPoolIdentityProvider", 0);
  });
});
