import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolIdentityProviderGoogle,
  CfnUserPoolGroup,
} from "aws-cdk-lib/aws-cognito";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

import { Construct } from "constructs";
import { Idp } from "../utils/identityProvider";

export interface AuthProps {
  readonly origin: string;
  readonly userPoolDomainPrefixKey: string;
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
      selfSignUpEnabled: false,
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
            const secret = secretsmanager.Secret.fromSecretNameV2(
              this,
              "Secret",
              provider.secretName
            );

            const clientId = secret
              .secretValueFromJson("clientId")
              .unsafeUnwrap()
              .toString();
            const clientSecret = secret.secretValueFromJson("clientSecret");

            const googleProvider = new UserPoolIdentityProviderGoogle(
              this,
              "GoogleProvider",
              {
                userPool,
                clientId: clientId,
                clientSecretValue: clientSecret,
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
          domainPrefix: props.userPoolDomainPrefixKey,
        },
      });
    }

    const adminGroup = new CfnUserPoolGroup(this, "AdminGroup", {
      groupName: "Admin",
      userPoolId: userPool.userPoolId,
    });

    const publishAllowedGroup = new CfnUserPoolGroup(
      this,
      "PublishAllowedGroup",
      {
        groupName: "PublishAllowed",
        userPoolId: userPool.userPoolId,
      }
    );

    this.client = client;
    this.userPool = userPool;

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: client.userPoolClientId });
    if (props.idp.isExist())
      new CfnOutput(this, "ApprovedRedirectURI", {
        value: `https://${props.userPoolDomainPrefixKey}.auth.${
          Stack.of(userPool).region
        }.amazoncognito.com/oauth2/idpresponse`,
      });
  }
}
