import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as s3 from "aws-cdk-lib/aws-s3";
import { IgnoreMode, RemovalPolicy } from "aws-cdk-lib";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { NagSuppressions } from "cdk-nag";

export interface ApiPublishCodebuildProps {
  readonly dbSecret: secretsmanager.ISecret;
  readonly accessLogBucket?: s3.Bucket;
}

export class ApiPublishCodebuild extends Construct {
  public readonly project: codebuild.Project;
  constructor(scope: Construct, id: string, props: ApiPublishCodebuildProps) {
    super(scope, id);

    const sourceBucket = new s3.Bucket(this, "ApiPublishCodebuildBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
      serverAccessLogsBucket: props.accessLogBucket,
      serverAccessLogsPrefix: "ApiPublishCodebuildBucket",
    });

    new s3deploy.BucketDeployment(this, "PublishApiSourceDeploy", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../../../"), {
          ignoreMode: IgnoreMode.GIT,
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.venv/**",
            "**/__pycache__/**",
            "**/cdk.out/**",
            "**/.vscode/**",
            "**/.DS_Store/**",
            "**/.git/**",
            "**/.github/**",
            "**/.mypy_cache/**",
          ],
        }),
      ],
      destinationBucket: sourceBucket,
    });

    const project = new codebuild.Project(this, "Project", {
      source: codebuild.Source.s3({
        bucket: sourceBucket,
        path: "",
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
      },
      environmentVariables: {
        // Need to be overridden when invoke the project
        // PUBLISHED_API_THROTTLE_RATE_LIMIT: { value: undefined },
        // PUBLISHED_API_THROTTLE_BURST_LIMIT: { value: undefined },
        // PUBLISHED_API_QUOTA_LIMIT: { value: undefined },
        // PUBLISHED_API_QUOTA_PERIOD: { value: undefined },
        PUBLISHED_API_DEPLOYMENT_STAGE: { value: "api" },
        PUBLISHED_API_ID: { value: "xy1234" },
        PUBLISHED_API_ALLOWED_ORIGINS: { value: '["*"]' },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "18",
            },
            commands: ["npm install -g aws-cdk"],
            "on-failure": "ABORT",
          },
          build: {
            commands: [
              "cd cdk",
              "npm ci",
              // Replace cdk's entrypoint. This is a workaround to avoid the issue that cdk synthesize all stacks.
              "sed -i 's|bin/bedrock-chat.ts|bin/api-publish.ts|' cdk.json",
              `cdk deploy --require-approval never ApiPublishmentStack$PUBLISHED_API_ID \\
         -c publishedApiThrottleRateLimit=$PUBLISHED_API_THROTTLE_RATE_LIMIT \\
         -c publishedApiThrottleBurstLimit=$PUBLISHED_API_THROTTLE_BURST_LIMIT \\
         -c publishedApiQuotaLimit=$PUBLISHED_API_QUOTA_LIMIT \\
         -c publishedApiQuotaPeriod=$PUBLISHED_API_QUOTA_PERIOD \\
         -c publishedApiDeploymentStage=$PUBLISHED_API_DEPLOYMENT_STAGE \\
         -c publishedApiId=$PUBLISHED_API_ID \\
         -c publishedApiAllowedOrigins=$PUBLISHED_API_ALLOWED_ORIGINS`,
            ],
          },
        },
      }),
    });
    sourceBucket.grantRead(project.role!);
    props.dbSecret.grantRead(project.role!);

    // Allow `cdk deploy`
    project.role!.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: ["arn:aws:iam::*:role/cdk-*"],
      })
    );

    NagSuppressions.addResourceSuppressions(project, [
      {
        id: "AwsPrototyping-CodeBuildProjectKMSEncryptedArtifacts",
        reason:
          "default: The AWS-managed CMK for Amazon Simple Storage Service (Amazon S3) is used.",
      },
      {
        id: "AwsPrototyping-CodeBuildProjectPrivilegedModeDisabled",
        reason: "for runnning on the docker daemon on the docker container",
      },
    ]);

    this.project = project;
  }
}
