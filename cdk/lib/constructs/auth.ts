import { CfnOutput, SecretValue, Duration } from "aws-cdk-lib";
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolIdentityProviderGoogle,
} from "aws-cdk-lib/aws-cognito";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

import { Construct } from "constructs";
import { Idp } from "../bedrock-chat-stack";

export interface AuthProps {
  readonly origin: string;
  readonly uuid: string;
  readonly idp: Idp;
}

export class Auth extends Construct {
  readonly userPool: UserPool;
  readonly client: UserPoolClient;
  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);
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

    const clientProps = (() => {
      const defaultProps = {
        idTokenValidity: Duration.days(1),
        authFlows: {
          userPassword: true,
          userSrp: true,
        },
      };
      if (!props.idp.isExist()) return defaultProps;
      return {
        ...defaultProps,
        oAuth: {
          callbackUrls: [props.origin],
          logoutUrls: [props.origin],
        },
        supportedIdentityProviders: [
          ...props.idp.getSupportedIndetityProviders(),
        ],
      };
    })();

    const client = userPool.addClient(`Client`, clientProps);

    if (props.idp.isExist()) {
      for (const provider of props.idp.getProviders()) {
        switch (provider.service) {
          case "google": {
            const oidcSecretClient = secretsmanager.Secret.fromSecretNameV2(
              this,
              "GoogleClientId",
              provider.clientId
            );
            const oidcSecret = secretsmanager.Secret.fromSecretNameV2(
              this,
              "GoogleSecret",
              provider.clientSecret
            );
            const googleProvider = new UserPoolIdentityProviderGoogle(
              this,
              "GoogleProvider",
              {
                userPool,
                clientId: oidcSecretClient.secretValue
                  .unsafeUnwrap()
                  .toString(),
                clientSecretValue: oidcSecret.secretValue,
                scopes: ["openid", "email"],
                attributeMapping: {
                  email: ProviderAttribute.GOOGLE_EMAIL,
                },
              }
            );
            client.node.addDependency(googleProvider);
          }
          // set other providers
          default:
            continue;
        }
      }
      userPool.addDomain("UserPool", {
        cognitoDomain: {
          domainPrefix: props.uuid,
        },
      });
    }

    this.client = client;
    this.userPool = userPool;

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: client.userPoolClientId });
  }
}
