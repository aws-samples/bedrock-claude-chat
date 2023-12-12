const { Client } = require("pg");

const setUp = async (dbConfig) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("Connected to the database.");

    // Create pgvector table and index
    // Ref: https://github.com/pgvector/pgvector
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    await client.query("DROP TABLE IF EXISTS items;");
    // NOTE: Titan embedding dimension is 1536
    // Ref: https://aws.amazon.com/bedrock/titan/
    await client.query(`CREATE TABLE IF NOT EXISTS items(
                         id CHAR(26) primary key,
                         botid CHAR(26),
                         content text,
                         source text,
                         embedding vector(1536));`);
    await client.query(`CREATE INDEX ON items 
                         USING ivfflat (embedding vector_l2_ops) WITH (lists = 5000);`);
    await client.query(`CREATE INDEX ON items (botid);`);
    await client.query("VACUUM ANALYZE items;");

    console.log("SQL execution successful.");
  } catch (err) {
    console.error("Error executing SQL: ", err.stack);
    throw err;
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
};

const updateStatus = async (event, status, reason, physicalResourceId) => {
  const body = JSON.stringify({
    Status: status,
    Reason: reason,
    PhysicalResourceId: physicalResourceId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho: false,
    Data: {},
  });

  const res = await fetch(event.ResponseURL, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": "",
      "Content-Length": body.length.toString(),
    },
  });

  console.log(res);
  console.log(await res.text());
};

exports.handler = async (event, context) => {
  console.log(`Received event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Received context: ${JSON.stringify(context, null, 2)}`);

  const dbConfig = event.ResourceProperties.dbConfig;
  console.log(`Received dbConfig: ${JSON.stringify(dbConfig, null, 2)}`);

  const dbClusterIdentifier = event.ResourceProperties.dbClusterIdentifier;

  try {
    switch (event.RequestType) {
      case "Create":
        await setUp(dbConfig);
        await updateStatus(
          event,
          "SUCCESS",
          "Setup succeeded",
          dbClusterIdentifier
        );
        break;
      case "Update":
      case "Delete":
        await updateStatus(event, "SUCCESS", "", dbClusterIdentifier);
    }
  } catch (error) {
    console.log(error);
    if (event.PhysicalResourceId) {
      await updateStatus(
        event,
        "FAILED",
        error.message,
        event.PhysicalResourceId
      );
    } else {
      await updateStatus(event, "FAILED", error.message, dbClusterIdentifier);
    }
  }
};
