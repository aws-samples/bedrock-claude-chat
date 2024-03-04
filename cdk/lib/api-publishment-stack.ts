import * as cdk from "aws-cdk-lib";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {
  DockerImageCode,
  DockerImageFunction,
  IFunction,
} from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { DbConfig } from "./constructs/embedding";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export interface VpcConfig {
  vpcId: string;
  availabilityZones: string[];
  publicSubnetIds: string[];
  // publicSubnetRouteTableIds: string[];
  privateSubnetIds: string[];
  // privateSubnetRouteTableIds: string[];
  isolatedSubnetIds: string[];
  // isolatedSubnetRouteTableIds: string[];
}
interface ApiPublishmentStackProps extends StackProps {
  readonly bedrockRegion: string;
  // readonly vpc: IVpc;
  // readonly database: ITable;
  // readonly dbConfig: DbConfig;
  // readonly tableAccessRole: iam.IRole;
  // readonly vpcId: string;
  readonly vpcConfig: VpcConfig;
  // vpcAvailabilityZones: string[];
  // vpcPublicSubnetIds: string[];
  // vpcPrivateSubnetIds: string[];
  // vpcIsolatedSubnetIds: string[];
  dbConfigHostname: string;
  dbConfigPort: number;
  dbConfigSecretArn: string;
  dbSecurityGroupId: string;
  readonly conversationTableName: string;
  readonly tableAccessRoleArn: string;
  readonly webAclArn: string;
  readonly usagePlan: apigateway.UsagePlanProps;
  readonly deploymentStage?: string;
  readonly corsOptions?: apigateway.CorsOptions;
}

export class ApiPublishmentStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiPublishmentStackProps) {
    super(scope, id, props);

    const dbSecret = secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "DbSecret",
      props.dbConfigSecretArn
    );

    const deploymentStage = props.deploymentStage ?? "dev";
    // const vpc = ec2.Vpc.fromLookup(this, "VPC", { vpcId: props.vpcName });
    // const vpc = ec2.Vpc.fromLookup(this, "VPC", {
    //   vpcId: cdk.Fn.importValue("VpcId"),
    // });
    const vpc = ec2.Vpc.fromVpcAttributes(this, "Vpc", props.vpcConfig);
    // const vpc = ec2.Vpc.fromVpcAttributes(this, "Vpc", {
    //   vpcId: props.vpcId,
    //   availabilityZones: props.vpcAvailabilityZones,
    //   publicSubnetIds: props.vpcPublicSubnetIds,
    //   privateSubnetIds: props.vpcPrivateSubnetIds,
    //   isolatedSubnetIds: [],
    // });

    const handlerRole = new iam.Role(this, "HandlerRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    handlerRole.addToPolicy(
      // Assume the table access role for row-level access control.
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [props.tableAccessRoleArn],
      })
    );
    handlerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:*"],
        resources: ["*"],
      })
    );
    handlerRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaVPCAccessExecutionRole"
      )
    );

    const handler = new DockerImageFunction(this, "Handler", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../backend"),
        {
          platform: Platform.LINUX_AMD64,
          file: "Dockerfile",
        }
      ),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      // vpcSubnets: ec2.Subnet.fromSubnetId
      memorySize: 1024,
      timeout: cdk.Duration.minutes(15),
      environment: {
        PUBLISHED_API_ID: id.replace("ApiPublishmentStack", ""),
        TABLE_NAME: props.conversationTableName,
        CORS_ALLOW_ORIGINS: (props.corsOptions?.allowOrigins ?? ["*"]).join(
          ","
        ),
        ACCOUNT: Stack.of(this).account,
        REGION: Stack.of(this).region,
        BEDROCK_REGION: props.bedrockRegion,
        TABLE_ACCESS_ROLE_ARN: props.tableAccessRoleArn,
        DB_NAME: dbSecret
          .secretValueFromJson("dbname")
          .unsafeUnwrap()
          .toString(),
        DB_HOST: props.dbConfigHostname,
        DB_USER: dbSecret
          .secretValueFromJson("username")
          .unsafeUnwrap()
          .toString(),
        DB_PASSWORD: dbSecret
          .secretValueFromJson("password")
          .unsafeUnwrap()
          .toString(),
        DB_PORT: cdk.Token.asString(props.dbConfigPort),
      },
      role: handlerRole,
    });

    // Allow the handler to access the pgvector.
    const dbSg = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "DbSecurityGroup",
      props.dbSecurityGroupId
    );
    dbSg.connections.allowFrom(handler, ec2.Port.tcp(props.dbConfigPort));

    const api = new apigateway.LambdaRestApi(this, "Api", {
      restApiName: id,
      handler,
      proxy: true,
      deployOptions: {
        stageName: deploymentStage,
      },
      defaultMethodOptions: { apiKeyRequired: true },
      defaultCorsPreflightOptions: props.corsOptions,
    });

    const apiKey = api.addApiKey("ApiKey", {
      description: "Default api key (Auto generated by CDK)",
    });
    const usagePlan = api.addUsagePlan("UsagePlan", {
      ...props.usagePlan,
    });
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });

    const association = new wafv2.CfnWebACLAssociation(
      this,
      "WebAclAssociation",
      {
        resourceArn: `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`,
        webAclArn: props.webAclArn,
      }
    );
    association.addDependency(api.node.defaultChild as cdk.CfnResource);

    new CfnOutput(this, "ApiId", {
      value: api.restApiId,
    });
    new CfnOutput(this, "ApiName", {
      value: api.restApiName,
    });
    new CfnOutput(this, "ApiUsagePlanId", {
      value: usagePlan.usagePlanId,
    });
    new CfnOutput(this, "AllowedOrigins", {
      value: props.corsOptions?.allowOrigins?.join(",") ?? "*",
    });
    new CfnOutput(this, "DeploymentStage", {
      value: deploymentStage,
    });
  }
}
