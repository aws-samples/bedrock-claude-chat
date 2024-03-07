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
    userPool.addDomain("UserPool", {
      cognitoDomain: {
        domainPrefix: userPoolDomainPrefixKey,
      },
    });

    const client = userPool.addClient(`Client`, {
      idTokenValidity: Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        callbackUrls: [props.origin],
        logoutUrls: [props.origin],
      },
      supportedIdentityProviders: [
        aws_cognito.UserPoolClientIdentityProvider.GOOGLE,
        aws_cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    const googleProvider = new UserPoolIdentityProviderGoogle(
      this,
      "GoogleProvider",
      {
        userPool: userPool,
        clientId: SecretValue.secretsManager("GoogleProviderClientId", {
          jsonField: "clientId",
        }).unsafeUnwrap(),
        clientSecretValue: SecretValue.secretsManager("GoogleAuthSecret", {
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

    client.node.addDependency(googleProvider);

    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: client.userPoolClientId });
  }
}
