import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { RemovalPolicy, Stack } from "aws-cdk-lib";
import * as glue from "@aws-cdk/aws-glue-alpha";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as python from "@aws-cdk/aws-lambda-python-alpha";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { aws_glue } from "aws-cdk-lib";
import { Database } from "./database";
import * as iam from "aws-cdk-lib/aws-iam";

export interface UsageAnalysisProps {
  sourceDatabase: Database;
}

export class UsageAnalysis extends Construct {
  constructor(scope: Construct, id: string, props: UsageAnalysisProps) {
    super(scope, id);

    const GLUE_DATABASE_NAME = `${Stack.of(
      this
    ).stackName.toLowerCase()}_usage_analysis`;
    const DDB_EXPORT_TABLE_NAME = "ddb_export";

    const ddbBucket = new s3.Bucket(this, "DdbBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      autoDeleteObjects: true,
    });

    const database = new glue.Database(this, "Database", {
      databaseName: GLUE_DATABASE_NAME,
    });

    const imageSchemaType = glue.Schema.struct([
      {
        name: "CreateTime",
        type: glue.Schema.struct([{ name: "N", type: glue.Schema.STRING }]),
      },
      {
        name: "LastMessageId",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "MessageMap",
        type: glue.Schema.STRING,
      },
      {
        name: "PK",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "SK",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "Title",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "BotId",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "Description",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "Instruction",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "IsPinned",
        type: glue.Schema.struct([{ name: "BOOL", type: glue.Schema.BOOLEAN }]),
      },
      {
        name: "Knowledge",
        type: glue.Schema.struct([
          {
            name: "M",
            type: glue.Schema.map(
              glue.Schema.STRING,
              glue.Schema.array(glue.Schema.STRING)
            ),
          },
        ]),
      },
      {
        name: "LastBotUsed",
        type: glue.Schema.struct([{ name: "N", type: glue.Schema.STRING }]),
      },
      {
        name: "LastExecId",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "SyncStatus",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
      {
        name: "SyncStatusReason",
        type: glue.Schema.struct([{ name: "S", type: glue.Schema.STRING }]),
      },
    ]);

    const ddbExportTable = new glue.S3Table(this, "DdbExportTable", {
      database,
      bucket: ddbBucket,
      tableName: DDB_EXPORT_TABLE_NAME,
      partitionKeys: [
        {
          name: "datehour",
          type: glue.Schema.STRING,
        },
      ],
      columns: [
        {
          name: "Metadata",
          type: glue.Schema.struct([
            {
              name: "WriteTimestampMicros",
              type: glue.Schema.struct([
                { name: "N", type: glue.Schema.STRING },
              ]),
            },
          ]),
        },
        {
          name: "Keys",
          type: glue.Schema.struct([
            {
              name: "PK",
              type: glue.Schema.struct([
                { name: "S", type: glue.Schema.STRING },
              ]),
            },
            {
              name: "SK",
              type: glue.Schema.struct([
                { name: "S", type: glue.Schema.STRING },
              ]),
            },
          ]),
        },
        {
          name: "OldImage",
          type: imageSchemaType,
        },
        {
          name: "NewImage",
          type: imageSchemaType,
        },
      ],
      dataFormat: glue.DataFormat.JSON,
    });
    // Add partition projection using escape hatch
    // Ref: https://docs.aws.amazon.com/cdk/v2/guide/cfn_layer.html
    const cfnDdbExportTable = ddbExportTable.node
      .defaultChild as aws_glue.CfnTable;
    cfnDdbExportTable.addPropertyOverride("TableInput.Parameters", {
      has_encrypted_data: false,
      "projection.enabled": true,
      "projection.datehour.type": "date",
      // NOTE: To account for timezones that are ahead of UTC, specify a far future date instead of `NOW` for the end of the range.
      "projection.datehour.range": "2023/01/01/00,2123/01/01/00",
      "projection.datehour.format": "yyyy/MM/dd/HH",
      "projection.datehour.interval": 1,
      "projection.datehour.interval.unit": "HOURS",
      "storage.location.template":
        `s3://${ddbBucket.bucketName}/` + "${datehour}/AWSDynamoDB/data/",
    });

    const exportHandler = new python.PythonFunction(this, "ExportHandler", {
      entry: path.join(__dirname, "../../../backend/usage_analysis/"),
      runtime: Runtime.PYTHON_3_11,
      environment: {
        BUCKET_NAME: ddbBucket.bucketName,
        TABLE_ARN: props.sourceDatabase.table.tableArn,
      },
    });
    exportHandler.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:ExportTableToPointInTime"],
        resources: [props.sourceDatabase.table.tableArn],
      })
    );
    ddbBucket.grantReadWrite(exportHandler);

    new events.Rule(this, "ScheduleRule", {
      schedule: events.Schedule.cron({ minute: "5" }),
      targets: [new targets.LambdaFunction(exportHandler)],
    });
  }
}
