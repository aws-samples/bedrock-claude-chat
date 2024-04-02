import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolIdentityProviderGoogle,
  UserPoolIdentityProviderSaml,
  UserPoolIdentityProviderSamlMetadata,
  UserPoolClientIdentityProvider,
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

    const providers: (UserPoolIdentityProviderGoogle | UserPoolIdentityProviderSaml)[] = [];

    if (props.idp.isExist()) {
      for (const provider of props.idp.getProviders()) {
        switch (provider.service) {
          case "okta": {
            const secret = secretsmanager.Secret.fromSecretNameV2(
              this,
              "OktaSecret",
              provider.secretName
            );

            const metadataUrl = secret.secretValueFromJson("metadataUrl").toString();
            if (!metadataUrl) {
              throw new Error("Metadata URL is required for OKTA SAML provider");
            }

            const oktaProvider = new UserPoolIdentityProviderSaml(this, "OktaProvider", {
              userPool: userPool,
              attributeMapping: {
                email: ProviderAttribute.other("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"),
              },
              metadata: UserPoolIdentityProviderSamlMetadata.url(metadataUrl),
            });

            providers.push(oktaProvider);
          }
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

            providers.push(googleProvider);
          }
          // set other providers
          default:
            continue;
        }
      }

      const client = userPool.addClient(`Client`, {
        ...clientProps,
        supportedIdentityProviders: [
          ...props.idp.getSupportedIndetityProviders(),
          ...providers
            .filter((provider) => provider instanceof UserPoolIdentityProviderSaml)
            .map((provider) => UserPoolClientIdentityProvider.custom(provider.providerName)),
        ],
      });

      for (const provider of providers) {
        client.node.addDependency(provider);
      }

      userPool.addDomain("UserPool", {
        cognitoDomain: {
          domainPrefix: props.userPoolDomainPrefixKey,
        },
      });
      this.client = client;
    } else {
      this.client = userPool.addClient(`Client`, clientProps);
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

    this.userPool = userPool;

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: this.client.userPoolClientId });
    if (props.idp.isExist())
      new CfnOutput(this, "ApprovedRedirectURI", {
        value: `https://${props.userPoolDomainPrefixKey}.auth.${Stack.of(userPool).region
          }.amazoncognito.com/oauth2/idpresponse`,
      });
  }
}
