import { CfnOutput, RemovalPolicy, StackProps, aws_cognito } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  HttpMethods,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { Auth } from "./constructs/auth";
import { Api } from "./constructs/api";
import { Database } from "./constructs/database";
import { Frontend } from "./constructs/frontend";
import { WebSocket } from "./constructs/websocket";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Embedding } from "./constructs/embedding";
import { VectorStore } from "./constructs/vectorstore";
import { UsageAnalysis } from "./constructs/usage-analysis";
import { randomUUID } from "crypto";
import { Effect, pipe } from "effect";

export interface BedrockChatStackProps extends StackProps {
  readonly bedrockRegion: string;
  readonly webAclId: string;
  readonly enableUsageAnalysis: boolean;
}

export class BedrockChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BedrockChatStackProps) {
    super(scope, id, {
      description: "Bedrock Chat Stack (uksb-1tupboc46)",
      ...props,
    });

    const vpc = new ec2.Vpc(this, "VPC", {});
    const vectorStore = new VectorStore(this, "VectorStore", {
      vpc: vpc,
    });
    const idp = identifyProvider(this);
    const userPoolDomainPrefixKey: string = this.node.tryGetContext(
      "userPoolDomainPrefix"
    );
    const dbConfig = {
      host: vectorStore.cluster.clusterEndpoint.hostname,
      username: vectorStore.secret
        .secretValueFromJson("username")
        .unsafeUnwrap()
        .toString(),
      password: vectorStore.secret
        .secretValueFromJson("password")
        .unsafeUnwrap()
        .toString(),
      port: vectorStore.cluster.clusterEndpoint.port,
      database: vectorStore.secret
        .secretValueFromJson("dbname")
        .unsafeUnwrap()
        .toString(),
    };

    const accessLogBucket = new Bucket(this, "AccessLogBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const documentBucket = new Bucket(this, "DocumentBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const frontend = new Frontend(this, "Frontend", {
      accessLogBucket,
      webAclId: props.webAclId,
    });

    const auth = new Auth(this, "Auth", {
      origin: frontend.getOrigin(),
      userPoolDomainPrefixKey,
      idp,
    });
    const database = new Database(this, "Database", {
      // Enable PITR to export data to s3 if usage analysis is enabled
      pointInTimeRecovery: props.enableUsageAnalysis,
    });

    const backendApi = new Api(this, "BackendApi", {
      vpc,
      database: database.table,
      auth,
      bedrockRegion: props.bedrockRegion,
      tableAccessRole: database.tableAccessRole,
      dbConfig,
      documentBucket,
    });
    documentBucket.grantReadWrite(backendApi.handler);

    // For streaming response
    const websocket = new WebSocket(this, "WebSocket", {
      vpc,
      dbConfig,
      database: database.table,
      tableAccessRole: database.tableAccessRole,
      websocketSessionTable: database.websocketSessionTable,
      auth,
      bedrockRegion: props.bedrockRegion,
    });

    frontend.buildViteApp({
      backendApiEndpoint: backendApi.api.apiEndpoint,
      webSocketApiEndpoint: websocket.apiEndpoint,
      userPoolDomainPrefixKey,
      auth,
      idp,
    });

    documentBucket.addCorsRule({
      allowedMethods: [HttpMethods.PUT],
      allowedOrigins: [frontend.getOrigin(), "http://localhost:5173"],
      allowedHeaders: ["*"],
      maxAge: 3000,
    });

    const embedding = new Embedding(this, "Embedding", {
      vpc,
      bedrockRegion: props.bedrockRegion,
      database: database.table,
      dbConfig,
      tableAccessRole: database.tableAccessRole,
      documentBucket,
    });
    documentBucket.grantRead(embedding.container.taskDefinition.taskRole);

    vectorStore.allowFrom(embedding.taskSecurityGroup);
    vectorStore.allowFrom(embedding.removalHandler);
    vectorStore.allowFrom(backendApi.handler);
    vectorStore.allowFrom(websocket.handler);

    if (props.enableUsageAnalysis) {
      new UsageAnalysis(this, "UsageAnalysis", {
        sourceDatabase: database,
      });
    }

    new CfnOutput(this, "DocumentBucketName", {
      value: documentBucket.bucketName,
    });
    new CfnOutput(this, "FrontendURL", {
      value: frontend.getOrigin(),
    });
  }
}

export type Idp = ReturnType<typeof identifyProvider>;

const identifyProvider = (construct: Construct) => {
  const providers: TProvider[] =
    construct.node.tryGetContext("identifyProviders");

  const isExist = () => providers.length > 0;

  const getProviders = (): TProvider[] => {
    const program = pipe(
      providers,
      isIdpAsArray,
      Effect.flatMap(validateProviders)
    );
    const result = Effect.match(program, {
      onSuccess: (providers) => providers,
      onFailure: (error: Errors) => {
        if (error.type === "NotFoundIdpArray") return [] as TProvider[];
        if (error.type === "InvalidSocialProvider")
          throw new Error("InvalidSocialProvider");
        return error;
      },
    });
    return Effect.runSync(result);
  };

  const getSupportedIndetityProviders = () => {
    return [...getProviders(), { service: "cognito" }].map(({ service }) => {
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
          throw new Error(`Invalid identity provider: ${service}`);
      }
    });
  };

  const getSocialProviders = () =>
    getProviders()
      .map(({ service }) => service)
      .join(",");

  return {
    isExist,
    getProviders,
    getSupportedIndetityProviders,
    getSocialProviders,
  };
};

type TProvider = {
  service: string;
  clientId: string;
  clientSecret: string;
};

const validateProviders = (providers: TProvider[]) =>
  Effect.all(providers.map(validateSocialProvider));

const validateSocialProvider = (
  provider: TProvider
):
  | Effect.Effect<never, InvalidSocialProvider, never>
  | Effect.Effect<TProvider, never, never> =>
  !["google", "facebook", "amazon", "apple"].includes(provider.service)
    ? Effect.fail({
        type: "InvalidSocialProvider",
      })
    : Effect.succeed(provider);

const isIdpAsArray = (
  providers: TProvider[]
):
  | Effect.Effect<TProvider[], never, never>
  | Effect.Effect<never, NotFoundIdpArray, never> =>
  Array.isArray(providers)
    ? Effect.succeed(providers as TProvider[])
    : Effect.fail({ type: "NotFoundIdpArray" });

type NotFoundIdpArray = {
  type: "NotFoundIdpArray";
};

type InvalidSocialProvider = {
  type: "InvalidSocialProvider";
};
type Errors = NotFoundIdpArray | InvalidSocialProvider;
