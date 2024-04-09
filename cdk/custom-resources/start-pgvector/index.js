const AWS = require("aws-sdk");
const rds = new AWS.RDS();

exports.handler = async () => {
  const instanceId = process.env.RDS_INSTANCE_ID;

  try {
    const startData = await rds
      .startDBInstance({ DBInstanceIdentifier: instanceId })
      .promise();
    console.log(`RDS instance ${instanceId} started successfully.`, startData);
  } catch (err) {
    console.error(`Error starting RDS instance ${instanceId}:`, err);
    throw err;
  }
};
