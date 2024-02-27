import { CfnOutput, Duration } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  CfnUserPoolGroup,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export interface AuthProps {}

export class Auth extends Construct {
  readonly userPool: UserPool;
  readonly client: UserPoolClient;
  constructor(scope: Construct, id: string, props?: AuthProps) {
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

    const client = userPool.addClient(`Client`, {
      idTokenValidity: Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

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
  }
}
