import { RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { AccountPrincipal, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface DatabaseProps {}

export class Database extends Construct {
  readonly table: Table;
  readonly tableAccessRole: Role;

  constructor(scope: Construct, id: string, props?: DatabaseProps) {
    super(scope, id);

    const table = new Table(this, "ConversationTable", {
      // PK: UserId
      partitionKey: { name: "PK", type: AttributeType.STRING },
      // SK: ConversationId | BotId
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    table.addGlobalSecondaryIndex({
      // Used to fetch conversation or bot by id
      indexName: "SKIndex",
      partitionKey: { name: "SK", type: AttributeType.STRING },
    });
    table.addGlobalSecondaryIndex({
      // Used to fetch public bots
      indexName: "PublicBotIdIndex",
      partitionKey: { name: "PublicBotId", type: AttributeType.STRING },
      // TODO: add `nonKeyAttributes` for efficiency
    });
    table.addLocalSecondaryIndex({
      // Used to fetch all bots for a user. Sorted by bot used time
      indexName: "LastBotUsedIndex",
      sortKey: { name: "LastBotUsed", type: AttributeType.NUMBER },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ["Title", "CreateTime", "LastBotUsed", "OwnerUserId"],
    });

    const tableAccessRole = new Role(this, "TableAccessRole", {
      assumedBy: new AccountPrincipal(Stack.of(this).account),
    });
    table.grantReadWriteData(tableAccessRole);

    this.table = table;
    this.tableAccessRole = tableAccessRole;
  }
}
