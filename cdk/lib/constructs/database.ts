import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface DatabaseProps {}

export class Database extends Construct {
  readonly table: Table;
  constructor(scope: Construct, id: string, props?: DatabaseProps) {
    super(scope, id);

    const table = new Table(this, "ConversationTable", {
      partitionKey: { name: "UserId", type: AttributeType.STRING },
      sortKey: { name: "ConversationId", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    table.addGlobalSecondaryIndex({
      indexName: "ConversationIdIndex",
      partitionKey: { name: "ConversationId", type: AttributeType.STRING },
    });

    this.table = table;
  }
}
