import * as cdk from "aws-cdk-lib";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

interface FrontendWafStackProps extends StackProps {
  readonly allowedIpV4AddressRanges: string[];
  readonly allowedIpV6AddressRanges: string[];
}

/**
 * Frontend WAF
 */
export class FrontendWafStack extends Stack {
  /**
   * Web ACL ARN
   */
  public readonly webAclArn: CfnOutput;

  constructor(scope: Construct, id: string, props: FrontendWafStackProps) {
    super(scope, id, props);

    // create Ipset for ACL
    const ipV4SetReferenceStatement = new wafv2.CfnIPSet(
      this,
      "FrontendIpV4Set",
      {
        ipAddressVersion: "IPV4",
        scope: "CLOUDFRONT",
        addresses: props.allowedIpV4AddressRanges,
      }
    );
    const ipV6SetReferenceStatement = new wafv2.CfnIPSet(
      this,
      "FrontendIpV6Set",
      {
        ipAddressVersion: "IPV6",
        scope: "CLOUDFRONT",
        addresses: props.allowedIpV6AddressRanges,
      }
    );

    const webAcl = new wafv2.CfnWebACL(this, "WebAcl", {
      defaultAction: { block: {} },
      name: "FrontendWebAcl",
      scope: "CLOUDFRONT",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "FrontendWebAcl",
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          priority: 0,
          name: "FrontendWebAclIpV4RuleSet",
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "FrontendWebAcl",
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: { arn: ipV4SetReferenceStatement.attrArn },
          },
        },
        {
          priority: 1,
          name: "FrontendWebAclIpV6RuleSet",
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "FrontendWebAcl",
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: { arn: ipV6SetReferenceStatement.attrArn },
          },
        },
      ],
    });

    this.webAclArn = new cdk.CfnOutput(this, "WebAclId", {
      value: webAcl.attrArn,
    });
  }
}
