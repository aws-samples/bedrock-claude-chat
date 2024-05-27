import { CfnOutput, Duration, Stack } from "aws-cdk-lib";
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolOperation,
  UserPoolIdentityProviderGoogle,
  CfnUserPoolGroup,
  UserPoolIdentityProviderOidc,
} from "aws-cdk-lib/aws-cognito";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Construct } from "constructs";
import * as path from "path";
import { Idp, TIdentityProvider } from "../utils/identity-provider";

export interface AuthProps {
  readonly origin: string;
  readonly userPoolDomainPrefixKey: string;
  readonly idp: Idp;
  readonly allowedSignUpEmailDomains: string[];
  readonly selfSignUpEnabled: boolean;
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
      // Disable id selfSignUpEnabled is given as false or if selfSignUpEnabled is true and idp is provided
      selfSignUpEnabled: props.selfSignUpEnabled && !props.idp.isExist(),
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
        // Currently only Google and custom OIDC are supported
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
              name: provider.serviceName,
              userPool,
              clientId,
              clientSecret: clientSecret.unsafeUnwrap().toString(),
              issuerUrl,
              attributeMapping: {
                // This is an example of mapping the email attribute.
                // Replace this with the actual idp attribute key.
                email: ProviderAttribute.other("EMAIL"),
              },
              scopes: ["openid", "email"],
            }
          );
          client.node.addDependency(oidcProvider);
          break;
        }
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

    if (props.allowedSignUpEmailDomains.length >= 1) {
      const checkEmailDomainFunction = new PythonFunction(
        this,
        "CheckEmailDomain",
        {
          runtime: Runtime.PYTHON_3_12,
          index: "check_email_domain.py",
          entry: path.join(
            __dirname,
            "../../../backend/auth/check_email_domain"
          ),
          timeout: Duration.minutes(1),
          environment: {
            ALLOWED_SIGN_UP_EMAIL_DOMAINS_STR: JSON.stringify(
              props.allowedSignUpEmailDomains
            ),
          },
        }
      );

      userPool.addTrigger(
        UserPoolOperation.PRE_SIGN_UP,
        checkEmailDomainFunction
      );
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
