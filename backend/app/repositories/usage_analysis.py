import asyncio
import logging
import os
import re
import time
from datetime import date, timedelta

import boto3
from app.repositories.custom_bot import find_public_bots_by_ids
from app.repositories.models.usage_analysis import BotUsage

USAGE_ANALYSIS_DATABASE = os.environ.get(
    "USAGE_ANALYSIS_DATABASE", "bedrockchatstack_usage_analysis"
)
USAGE_ANALYSIS_TABLE = os.environ.get("USAGE_ANALYSIS_TABLE", "ddb_export")
USAGE_ANALYSIS_WORKGROUP = os.environ.get(
    "USAGE_ANALYSIS_WORKGROUP", "bedrockchatstack_wg"
)
USAGE_ANALYSIS_OUTPUT_LOCATION = os.environ.get(
    "USAGE_ANALYSIS_OUTPUT_LOCATION", "s3://bedrockchatstack-athena-results"
)
QUERY_LIMIT = 1000


logger = logging.getLogger(__name__)
athena = boto3.client("athena")


async def run_athena_query(
    query: str,
    database: str,
    workgroup: str,
    output_location: str,
    query_limit: int = QUERY_LIMIT,
):
    """Run athena query."""
    query_execution = athena.start_query_execution(
        QueryString=query,
        QueryExecutionContext={"Database": database},
        WorkGroup=workgroup,
        ResultConfiguration={
            # TODO
            "OutputLocation": output_location,
        },
    )
    execution_id = query_execution["QueryExecutionId"]
    logger.debug(f"query_execution_id: {execution_id}")

    # Wait until query completed
    while True:
        query_execution = athena.get_query_execution(QueryExecutionId=execution_id)
        status = query_execution["QueryExecution"]["Status"]["State"]
        logger.debug(f"status: {status}")
        if status == "SUCCEEDED":
            break
        elif status == "FAILED":
            reason = query_execution["QueryExecution"]["Status"]["StateChangeReason"]
            logger.error(f"query failed.")
            raise Exception(reason)
        else:
            await asyncio.sleep(1)

    # Get query results
    results = athena.get_query_results(
        QueryExecutionId=execution_id, MaxResults=query_limit
    )
    return results


async def find_bots_sorted_by_price(
    limit: int = 20,
    from_: str | None = None,
    to_: str | None = None,
) -> list[BotUsage]:
    """Find bots sorted by price. This is intended to be used by admin.
    - start: start date of the period to be analyzed. The format is `YYYYMMDDHH`.
    - end: end date of the period to be analyzed. The format is `YYYYMMDDHH`.
    """
    assert 1 <= limit <= 1000, "Limit must be between 1 and 1000."

    assert (from_ and to_) or (
        not from_ and not to_
    ), "Both from_ and to_ must be specified or omitted."

    if from_ is not None and to_ is not None:
        from_str = re.sub(r"(\d{4})(\d{2})(\d{2})(\d{2})", r"\1/\2/\3/\4", from_)  # type: ignore
        to_str = re.sub(r"(\d{4})(\d{2})(\d{2})(\d{2})", r"\1/\2/\3/\4", to_)  # type: ignore
    else:
        today = date.today()
        from_str = today.strftime("%Y/%m/%d/00")
        to_str = today.strftime("%Y/%m/%d/23")

    # TODO: avoid duplication of conversation. apply most latest conversation
    query = f"""
    WITH PreAggregatedData AS (
    SELECT 
        newimage.BotId.S AS BotId,
        json_extract_scalar(json_parse(json_extract_scalar(newimage.messagemap, '$.s')), '$.system.model') AS ModelId,
        newimage.TotalPrice.N AS TotalPrice
    FROM
        {USAGE_ANALYSIS_DATABASE}.{USAGE_ANALYSIS_TABLE}
    WHERE
        datehour BETWEEN '{from_str}' AND '{to_str}'
        AND Keys.SK.S LIKE CONCAT(Keys.PK.S, '#CONV#%')
    )

    SELECT
        BotId,
        SUM(TotalPrice) AS TotalPrice
    FROM
        PreAggregatedData
    GROUP BY
        BotId
    ORDER BY
        TotalPrice DESC
    LIMIT {limit};
    """

    print(query)
    response = await run_athena_query(
        query,
        USAGE_ANALYSIS_DATABASE,
        USAGE_ANALYSIS_WORKGROUP,
        USAGE_ANALYSIS_OUTPUT_LOCATION,
    )
    # TODO: remove
    # print(response)
    # print(response["ResultSet"]["Rows"][1:])
    rows = response["ResultSet"]["Rows"][1:]

    # Fetch bot meta data from dynamodb
    bots = await find_public_bots_by_ids(
        bot_ids=[item["Data"][0]["VarCharValue"] for item in rows]
    )
    bots_dict = {bot.id: bot for bot in bots}

    # Join bot meta data and usage data
    bot_usage = []
    for row in rows:
        bot_id = row["Data"][0]["VarCharValue"]
        total_price = float(row["Data"][1].get("VarCharValue", 0))

        bot = bots_dict.get(bot_id)

        if bot:
            bot_usage.append(
                BotUsage(
                    id=bot_id,
                    title=bot.title,
                    description=bot.description,
                    published_api_stack_name=bot.published_api_stack_name,
                    published_api_datetime=bot.published_api_datetime,
                    owner_user_id=bot.owner_user_id,
                    total_price=total_price,
                )
            )

    return bot_usage
