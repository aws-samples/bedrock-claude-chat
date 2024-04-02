import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolIdentityProviderGoogle,
  CfnUserPoolGroup,
  UserPoolIdentityProviderOidc,
} from "aws-cdk-lib/aws-cognito";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

import { Construct } from "constructs";
import { Idp, TIdentityProvider } from "../utils/identityProvider";

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
      // Disable if identity providers are configured
      selfSignUpEnabled: !props.idp.isExist(),
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

    const configureProvider = (
      provider: TIdentityProvider,
      userPool: UserPool,
      client: UserPoolClient
    ) => {
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

      switch (provider.service) {
        case "google": {
          const googleProvider = new UserPoolIdentityProviderGoogle(
            this,
            "GoogleProvider",
            {
              userPool,
              clientId,
              clientSecretValue: clientSecret,
              scopes: ["openid", "email"],
              attributeMapping: {
                email: ProviderAttribute.GOOGLE_EMAIL,
                // Add more attribute mappings as needed
              },
            }
          );

          client.node.addDependency(googleProvider);
          break;
        }
        case "oidc": {
          const issuerUrl = secret
            .secretValueFromJson("issuerUrl")
            .unsafeUnwrap()
            .toString();

          const oidcProvider = new UserPoolIdentityProviderOidc(
            this,
            "OidcProvider",
            {
              userPool,
              clientId,
              clientSecret: clientSecret.unsafeUnwrap().toString(),
              issuerUrl,
              attributeMapping: {
                email: ProviderAttribute.other("email"),
                // Add more attribute mappings as needed
              },
              scopes: ["openid", "email"],
              // Configure other optional properties as needed
            }
          );

          client.node.addDependency(oidcProvider);
          break;
        }
        default:
          throw new Error(`Unsupported identity provider: ${provider.service}`);
      }
    };

    if (props.idp.isExist()) {
      for (const provider of props.idp.getProviders()) {
        configureProvider(provider, userPool, client);
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
