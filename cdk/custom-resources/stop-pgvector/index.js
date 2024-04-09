const AWS = require("aws-sdk");
const rds = new AWS.RDS();

exports.handler = async () => {
  const instanceId = process.env.RDS_INSTANCE_ID;

  try {
    const stopData = await rds
      .stopDBInstance({ DBInstanceIdentifier: instanceId })
      .promise();
    console.log(`RDS instance ${instanceId} stopped successfully.`, stopData);
  } catch (err) {
    console.error(`Error stopping RDS instance ${instanceId}:`, err);
    throw err;
  }
};
