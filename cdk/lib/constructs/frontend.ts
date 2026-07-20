import { Construct } from "constructs";
import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  IBucket,
} from "aws-cdk-lib/aws-s3";
import {
  CachePolicy,
  Distribution,
  ViewerProtocolPolicy,
  GeoRestriction,
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { NodejsBuild } from "@cdklabs/deploy-time-build";
import { Auth } from "./auth";
import { Idp } from "../utils/identity-provider";
import { NagSuppressions } from "cdk-nag";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export interface FrontendProps {
  readonly webAclId?: string;
  readonly accessLogBucket?: IBucket;
  readonly enableIpV6: boolean;
  /** 
   * Alternative domain name for CloudFront distribution (e.g., chat.example.com)
   * If provided, CloudFront will be accessible via this domain
   */
  readonly alternateDomainName?: string;
  /**
   * Route53 hosted zone ID where the alternate domain records will be created
   * Required if alternateDomainName is provided
   */
  readonly hostedZoneId?: string;
  /**
   * List of allowed countries for the CloudFront distribution, specified as ISO 3166-1 alpha-2 codes (e.g., "US", "CA").
   * If empty, all countries will be allowed.
   */
  readonly allowedCountries?: string[];
}

export class Frontend extends Construct {
  readonly cloudFrontWebDistribution: Distribution;
  readonly assetBucket: Bucket;
  private readonly certificate?: acm.ICertificate;
  private readonly hostedZone?: route53.IHostedZone;
  /** Alternate domain name for the CloudFront distribution */
  private readonly alternateDomainName?: string;
  private readonly allowedCountries: string[];

  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id);

    this.alternateDomainName = props.alternateDomainName;
    // Initialize allowedCountries from props (default to empty list meaning no geo restriction)
    this.allowedCountries = props.allowedCountries ?? [];

    const assetBucket = new Bucket(this, "AssetBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: props.accessLogBucket,
      serverAccessLogsPrefix: "AssetBucket",
    });

    if (props.alternateDomainName && props.hostedZoneId) {
      this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: props.hostedZoneId,
        zoneName: this.getDomainZoneName(props.alternateDomainName),
      });

      this.certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
        domainName: props.alternateDomainName,
        hostedZone: this.hostedZone,
        region: 'us-east-1',
        validation: acm.CertificateValidation.fromDns(this.hostedZone),
      });
    }

    const distribution = new Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(assetBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
      },
      // Apply geo restriction allowlist only when countries are provided
      ...(this.allowedCountries.length
        ? { geoRestriction: GeoRestriction.allowlist(...this.allowedCountries) }
        : {}),
      ...(this.alternateDomainName && this.certificate ? {
        domainNames: [this.alternateDomainName],
        certificate: this.certificate,
      } : {}),
      errorResponses: [
        {
          httpStatus: 404,
          ttl: Duration.seconds(0),
          responseHttpStatus: 200,
          responsePagePath: "/",
        },
        {
          httpStatus: 403,
          ttl: Duration.seconds(0),
          responseHttpStatus: 200,
          responsePagePath: "/",
        },
      ],
      ...(!this.shouldSkipAccessLogging() && {
        logBucket: props.accessLogBucket,
        logFilePrefix: "Frontend/",
      }),
      ...(props.webAclId ? { webAclId: props.webAclId } : {}),
      enableIpv6: props.enableIpV6,
    });

    if (this.alternateDomainName && this.hostedZone) {
      new route53.ARecord(this, 'AliasRecord', {
        zone: this.hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
        recordName: this.alternateDomainName,
      });

      if (props.enableIpV6) {
        new route53.AaaaRecord(this, 'AaaaRecord', {
          zone: this.hostedZone,
          target: route53.RecordTarget.fromAlias(
            new targets.CloudFrontTarget(distribution)
          ),
          recordName: this.alternateDomainName,
        });
      }
    }

    NagSuppressions.addResourceSuppressions(distribution, [
      {
        id: "AwsPrototyping-CloudFrontDistributionGeoRestrictions",
        reason: "this asset is being used all over the world",
      },
    ]);

    this.assetBucket = assetBucket;
    this.cloudFrontWebDistribution = distribution;

    if (this.alternateDomainName) {
      new CfnOutput(this, 'AlternateDomain', {
        value: this.alternateDomainName,
        description: 'Alternate domain name for the CloudFront distribution',
      });
    }
    if (this.certificate) {
      new CfnOutput(this, 'CertificateArn', {
        value: this.certificate.certificateArn,
        description: 'ARN of the ACM certificate',
      });
    }
  }

  /**
   * Extracts the parent domain from a full domain name
   * e.g., 'chat.example.com' -> 'example.com'
   */
  private getDomainZoneName(domainName: string): string {
    const parts = domainName.split('.');
    if (parts.length <= 2) return domainName;
    return parts.slice(-2).join('.');
  }

  getOrigin(): string {
    if (this.alternateDomainName) {
      return `https://${this.alternateDomainName}`;
    }
    return `https://${this.cloudFrontWebDistribution.distributionDomainName}`;
  }

  buildViteApp({
    backendApiEndpoint,
    webSocketApiEndpoint,
    userPoolDomainPrefix,
    auth,
    idp,
  }: {
    backendApiEndpoint: string;
    webSocketApiEndpoint: string;
    userPoolDomainPrefix: string;
    auth: Auth;
    idp: Idp;
  }) {
    const region = Stack.of(auth.userPool).region;
    const cognitoDomain = `${userPoolDomainPrefix}.auth.${region}.amazoncognito.com`;
    const buildEnvProps = (() => {
      const defaultProps = {
        VITE_APP_API_ENDPOINT: backendApiEndpoint,
        VITE_APP_WS_ENDPOINT: webSocketApiEndpoint,
        VITE_APP_USER_POOL_ID: auth.userPool.userPoolId,
        VITE_APP_USER_POOL_CLIENT_ID: auth.client.userPoolClientId,
        VITE_APP_REGION: region,
        VITE_APP_USE_STREAMING: "true",
      };

      if (!idp.isExist()) return defaultProps;

      const oAuthProps = {
        VITE_APP_REDIRECT_SIGNIN_URL: this.getOrigin(),
        VITE_APP_REDIRECT_SIGNOUT_URL: this.getOrigin(),
        VITE_APP_COGNITO_DOMAIN: cognitoDomain,
        VITE_APP_SOCIAL_PROVIDERS: idp.getSocialProviders(),
        VITE_APP_CUSTOM_PROVIDER_ENABLED: idp
          .checkCustomProviderEnabled()
          .toString(),
        VITE_APP_CUSTOM_PROVIDER_NAME: idp.getCustomProviderName(),
      };
      return { ...defaultProps, ...oAuthProps };
    })();

    new NodejsBuild(this, "ReactBuild", {
      assets: [
        {
          path: "../frontend",
          exclude: [
            "node_modules",
            "dist",
            "dev-dist",
            ".env",
            ".env.local",
            "../cdk/**/*",
            "../backend/**/*",
            "../example/**/*",
            "../docs/**/*",
            "../.github/**/*",
          ],
          commands: ["npm ci"],
        },
      ],
      buildCommands: ["npm run build"],
      buildEnvironment: buildEnvProps,
      destinationBucket: this.assetBucket,
      distribution: this.cloudFrontWebDistribution,
      outputSourceDirectory: "dist",
      nodejsVersion: 22,
    });

    if (idp.isExist()) {
      new CfnOutput(this, "CognitoDomain", { value: cognitoDomain });
      new CfnOutput(this, "SocialProviders", {
        value: idp.getSocialProviders(),
      });
    }
  }

  /**
   * CloudFront does not support access log delivery in the following regions
   * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html#access-logs-choosing-s3-bucket
   */
  private shouldSkipAccessLogging(): boolean {
    const skipLoggingRegions = [
      "af-south-1",
      "ap-east-1",
      "ap-south-2",
      "ap-southeast-3",
      "ap-southeast-4",
      "ca-west-1",
      "eu-south-1",
      "eu-south-2",
      "eu-central-2",
      "il-central-1",
      "me-central-1",
    ];
    return skipLoggingRegions.includes(Stack.of(this).region);
  }
}
