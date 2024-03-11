import { CfnOutput, SecretValue, Duration, aws_cognito } from "aws-cdk-lib";
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolIdentityProviderGoogle,
} from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

export interface AuthProps {
  origin: string;
}

export class Auth extends Construct {
  readonly userPool: UserPool;
  readonly client: UserPoolClient;
  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);

    const providers: [] = this.node.tryGetContext("identifyProviders");
    const supportedIndetityProviders = [
      ...providers,
      { service: "cognito" },
    ].map(({ service }) => {
      switch (service) {
        case "google":
          return aws_cognito.UserPoolClientIdentityProvider.GOOGLE;
        case "facebook":
          return aws_cognito.UserPoolClientIdentityProvider.FACEBOOK;
        case "amazon":
          return aws_cognito.UserPoolClientIdentityProvider.AMAZON;
        case "apple":
          return aws_cognito.UserPoolClientIdentityProvider.APPLE;
        case "cognito":
          return aws_cognito.UserPoolClientIdentityProvider.COGNITO;
        default:
          return aws_cognito.UserPoolClientIdentityProvider.COGNITO;
      }
    });

    const userPool = new UserPool(this, "UserPool", {
      passwordPolicy: {
        requireUppercase: true,
        requireSymbols: true,
        requireDigits: true,
        minLength: 8,
      },
      selfSignUpEnabled: true,
      signInAliases: {
        username: false,
        email: true,
      },
    });

    const userPoolDomainPrefixKey: string = this.node.tryGetContext(
      "userPoolDomainPrefix"
    );

    // unused, but required for Google auth
    userPool.addDomain("UserPool", {
      cognitoDomain: {
        domainPrefix: userPoolDomainPrefixKey,
      },
    });

    const clientProps = (() => {
      const defaultProps = {
        idTokenValidity: Duration.days(1),
        authFlows: {
          userPassword: true,
          userSrp: true,
        },
      };
      if (providers.length == 0) return defaultProps;
      return {
        ...defaultProps,
        oAuth: {
          callbackUrls: [props.origin],
          logoutUrls: [props.origin],
        },
        supportedIdentityProviders: [...supportedIndetityProviders],
      };
    })();

    const client = userPool.addClient(`Client`, clientProps);

    const googleAuthSecretName: string = this.node.tryGetContext(
      "googleAuthSecretName"
    );
    const googleProviderClientId: string = this.node.tryGetContext(
      "googleProviderClientId"
    );

    // unused, but required for Google auth
    const googleProvider = new UserPoolIdentityProviderGoogle(
      this,
      "GoogleProvider",
      {
        userPool: userPool,
        clientId: SecretValue.secretsManager(googleProviderClientId, {
          jsonField: "clientId",
        }).unsafeUnwrap(),
        clientSecretValue: SecretValue.secretsManager(googleAuthSecretName, {
          jsonField: "clientSecret",
        }),
        scopes: ["openid", "email"],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
        },
      }
    );

    this.client = client;
    this.userPool = userPool;

    // unused, but required for Google auth
    client.node.addDependency(googleProvider);

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: client.userPoolClientId });
  }
}
