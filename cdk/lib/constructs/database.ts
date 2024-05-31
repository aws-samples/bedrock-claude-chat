import { CfnOutput, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption,
  StreamViewType,
} from "aws-cdk-lib/aws-dynamodb";
import { AccountPrincipal, Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface DatabaseProps {
  pointInTimeRecovery?: boolean;
}

export class Database extends Construct {
  readonly table: Table;
  readonly tableAccessRole: Role;
  readonly websocketSessionTable: Table;

  constructor(scope: Construct, id: string, props?: DatabaseProps) {
    super(scope, id);

    const table = new Table(this, "ConversationTable", {
      // PK: UserId
      partitionKey: { name: "PK", type: AttributeType.STRING },
      // SK: ConversationId | BotId
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      stream: StreamViewType.NEW_IMAGE,
      pointInTimeRecovery: props?.pointInTimeRecovery,
      encryption: TableEncryption.AWS_MANAGED,
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
      // For now we project all attributes to keep future compatibility
    });
    table.addLocalSecondaryIndex({
      // Used to fetch all bots for a user. Sorted by bot used time
      indexName: "LastBotUsedIndex",
      sortKey: { name: "LastBotUsed", type: AttributeType.NUMBER },
      // TODO: add `nonKeyAttributes` for efficiency
      // For now we project all attributes to keep future compatibility
    });

    const tableAccessRole = new Role(this, "TableAccessRole", {
      assumedBy: new AccountPrincipal(Stack.of(this).account),
    });
    table.grantReadWriteData(tableAccessRole);

    // Websocket session table.
    // This table is used to concatenate user input exceeding 32KB which is the limit of API Gateway.
    const websocketSessionTable = new Table(this, "WebsocketSessionTable", {
      partitionKey: { name: "ConnectionId", type: AttributeType.STRING },
      sortKey: { name: "MessagePartId", type: AttributeType.NUMBER },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      timeToLiveAttribute: "expire",
    });

    this.table = table;
    this.tableAccessRole = tableAccessRole;
    this.websocketSessionTable = websocketSessionTable;

    new CfnOutput(this, "ConversationTableName", {
      value: table.tableName,
    });
  }
}
