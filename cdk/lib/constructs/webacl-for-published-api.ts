import { Construct } from "constructs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { CfnOutput } from "aws-cdk-lib";

export interface WebAclForPublishedApiProps {
  readonly allowedIpV4AddressRanges: string[];
  readonly allowedIpV6AddressRanges: string[];
}

export class WebAclForPublishedApi extends Construct {
  public readonly webAclArn: string;
  constructor(scope: Construct, id: string, props: WebAclForPublishedApiProps) {
    super(scope, id);

    const ipV4SetReferenceStatement = new wafv2.CfnIPSet(this, "IpV4Set", {
      ipAddressVersion: "IPV4",
      scope: "REGIONAL",
      addresses: props.allowedIpV4AddressRanges,
    });
    const ipV6SetReferenceStatement = new wafv2.CfnIPSet(this, "IpV6Set", {
      ipAddressVersion: "IPV6",
      scope: "REGIONAL",
      addresses: props.allowedIpV6AddressRanges,
    });
    const webAcl = new wafv2.CfnWebACL(this, "WebAcl", {
      defaultAction: { block: {} },
      name: `ApiWebAcl-${id}`,
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "WebAcl",
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          priority: 0,
          name: "WebAclIpV4RuleSet",
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "PublishedApiWebAcl",
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: { arn: ipV4SetReferenceStatement.attrArn },
          },
        },
        {
          priority: 1,
          name: "WebAclIpV6RuleSet",
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "PublishedApiWebAcl",
            sampledRequestsEnabled: true,
          },
          statement: {
            ipSetReferenceStatement: { arn: ipV6SetReferenceStatement.attrArn },
          },
        },
      ],
    });

    new CfnOutput(this, "WebAclArn", {
      value: webAcl.attrArn,
    });

    this.webAclArn = webAcl.attrArn;
  }
}
