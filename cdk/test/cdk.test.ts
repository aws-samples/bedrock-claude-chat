import * as cdk from "aws-cdk-lib";
import { BedrockChatStack } from "../lib/bedrock-chat-stack";
import { Template } from "aws-cdk-lib/assertions";

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
        dbEncryption: false,
        publishedApiAllowedIpV4AddressRanges: [""],
        publishedApiAllowedIpV6AddressRanges: [""],
        rdsSchedules: {
          stop: {},
          restored: {},
        },
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

  test("Custom OIDC Provider Generation", () => {
    const app = new cdk.App();
    const domainPrefix = "test-domain";
    const hasOidcProviderStack = new BedrockChatStack(
      app,
      "OidcProviderGenerateStack",
      {
        bedrockRegion: "us-east-1",
        crossRegionReferences: true,
        webAclId: "",
        enableUsageAnalysis: true,
        identityProviders: [
          {
            secretName: "MyOidcTestSecret",
            service: "oidc",
            serviceName: "MyOidcProvider",
          },
        ],
        userPoolDomainPrefix: domainPrefix,
        dbEncryption: false,
        publishedApiAllowedIpV4AddressRanges: [""],
        publishedApiAllowedIpV6AddressRanges: [""],
        rdsSchedules: {
          stop: {},
          restored: {},
        },
      }
    );
    const hasOidcProviderTemplate = Template.fromStack(hasOidcProviderStack);

    hasOidcProviderTemplate.hasResourceProperties(
      "AWS::Cognito::UserPoolDomain",
      {
        Domain: domainPrefix,
      }
    );

    hasOidcProviderTemplate.hasResourceProperties(
      "AWS::Cognito::UserPoolClient",
      {
        SupportedIdentityProviders: ["MyOidcProvider", "COGNITO"],
      }
    );
    hasOidcProviderTemplate.hasResourceProperties(
      "AWS::Cognito::UserPoolIdentityProvider",
      {
        ProviderType: "OIDC",
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
      dbEncryption: false,
      publishedApiAllowedIpV4AddressRanges: [""],
      publishedApiAllowedIpV6AddressRanges: [""],
      rdsSchedules: {
        stop: {},
        restored: {},
      },
    });
    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::Cognito::UserPoolIdentityProvider", 0);
  });
});

describe("Scheduler Test", () => {
  test("has schedules", () => {
    const app = new cdk.App();
    const hasScheduleStack = new BedrockChatStack(app, "HasSchedulesStack", {
      bedrockRegion: "us-east-1",
      crossRegionReferences: true,
      webAclId: "",
      enableUsageAnalysis: true,
      identityProviders: [],
      userPoolDomainPrefix: "",
      dbEncryption: false,
      publishedApiAllowedIpV4AddressRanges: [""],
      publishedApiAllowedIpV6AddressRanges: [""],
      rdsSchedules: {
        stop: {
          minute: "00",
          hour: "22",
          day: "*",
          month: "*",
          year: "*",
        },
        restored: {
          minute: "00",
          hour: "7",
          day: "*",
          month: "*",
          year: "*",
        },
      },
    });
    const template = Template.fromStack(hasScheduleStack);
    template.hasResourceProperties("AWS::Scheduler::Schedule", {
      ScheduleExpression: "cron(00 22 * * ? *)",
    });

    template.hasResourceProperties("AWS::Scheduler::Schedule", {
      ScheduleExpression: "cron(00 7 * * ? *)",
    });
  });
  test("has'nt schedules", () => {
    const app = new cdk.App();
    const defaultStack = new BedrockChatStack(app, "DefaultStack", {
      bedrockRegion: "us-east-1",
      crossRegionReferences: true,
      webAclId: "",
      enableUsageAnalysis: true,
      identityProviders: [],
      userPoolDomainPrefix: "",
      dbEncryption: false,
      publishedApiAllowedIpV4AddressRanges: [""],
      publishedApiAllowedIpV6AddressRanges: [""],
      rdsSchedules: {
        stop: {},
        restored: {},
      },
    });
    const template = Template.fromStack(defaultStack);
    template.resourceCountIs("AWS::Events::Rule", 1);
  });
});
