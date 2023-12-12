import { Construct } from "constructs";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as path from "path";
import { Duration } from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

export interface DbConfig {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
}

export interface EmbeddingProps {
  readonly vpc: ec2.IVpc;
  readonly database: ITable;
  readonly dbConfig: DbConfig;
  readonly bedrockRegion: string;
}

export class Embedding extends Construct {
  readonly handler: lambda.IFunction;
  constructor(scope: Construct, id: string, props: EmbeddingProps) {
    super(scope, id);

    const queue = new sqs.Queue(this, "Queue", {
      // Ref: https://aws.amazon.com/jp/blogs/compute/implementing-aws-well-architected-best-practices-for-amazon-sqs-part-2/#:~:text=It%20is%20recommended%20to%20keep,messages%20if%20the%20invocation%20fails.
      visibilityTimeout: Duration.minutes(15 * 6),
    });

    // Currently use Lambda for embedding, which can excess 15 minutes timeout.
    // For large dataset, we need to use another option such as ECS Fargate.
    const handler = new DockerImageFunction(this, "Handler", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../../backend"),
        {
          platform: Platform.LINUX_AMD64,
          file: "embedding.Dockerfile",
        }
      ),
      timeout: Duration.minutes(15),
      memorySize: 2048,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      environment: {
        BEDROCK_REGION: props.bedrockRegion,
        DB_HOST: props.dbConfig.host,
        DB_PORT: props.dbConfig.port.toString(),
        DB_USER: props.dbConfig.username,
        DB_PASSWORD: props.dbConfig.password,
        DB_NAME: props.dbConfig.database,
      },
    });
    handler.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["bedrock:*"],
        resources: ["*"],
      })
    );
    queue.grantConsumeMessages(handler);
    props.database.grantReadWriteData(handler);

    new lambda.EventSourceMapping(this, "EventSource", {
      target: handler,
      eventSourceArn: queue.queueArn,
      // TODO
      batchSize: 1,
    });

    this.handler = handler;
  }
}
