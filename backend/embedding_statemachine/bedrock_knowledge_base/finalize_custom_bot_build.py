import os
from typing import List, TypedDict

import boto3
from app.repositories.custom_bot import (
    find_bot_by_id,
    update_knowledge_base_id,
    update_guardrails_params,
)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION")

cfn = boto3.client(
    service_name="cloudformation",
    region_name=BEDROCK_REGION,
)


class BotFilesDiff(TypedDict):
    OwnerUserId: str
    BotId: str
    Added: list[str]
    Unchanged: list[str]
    Deleted: list[str]


class DataSource(TypedDict):
    KnowledgeBaseId: str
    DataSourceId: str
    FilesDiffs: list[BotFilesDiff]


def handler(event, context):
    """Finalize custom bot build by retrieving CloudFormation outputs and setting up data sources.

    This handler processes both:
    - Dedicated bots: Retrieves new KB/Guardrails from BrChatKbStack{botId} CloudFormation outputs
    - Shared bots with file diffs: Inherits shared KB DataSources from previous flow

    All bots proceed to ingestion processing with their respective DataSources.
    """
    user_id = event["OwnerUserId"]
    bot_id = event["BotId"]

    bot_files_diffs: list[BotFilesDiff] = []

    files_diff_from_event = event.get("FilesDiff")
    if files_diff_from_event:
        bot_files_diffs.append(
            {
                "OwnerUserId": user_id,
                "BotId": bot_id,
                "Added": files_diff_from_event["Added"],
                "Unchanged": files_diff_from_event["Unchanged"],
                "Deleted": files_diff_from_event["Deleted"],
            }
        )

    data_sources: list[DataSource] = []

    data_sources_from_event = event.get("DataSources")
    if data_sources_from_event:
        data_sources.extend(
            {
                "KnowledgeBaseId": data_source["KnowledgeBaseId"],
                "DataSourceId": data_source["DataSourceId"],
                "FilesDiffs": bot_files_diffs,
            }
            for data_source in data_sources_from_event
        )

    # Note: stack naming rule is defined on:
    # cdk/bin/bedrock-custom-bot.ts
    stack_name = f"BrChatKbStack{bot_id}"

    response = cfn.describe_stacks(StackName=stack_name)
    outputs = response["Stacks"][0].get("Outputs")
    if not outputs:
        raise ValueError(f"No outputs found in CloudFormation stack '{stack_name}'")

    stack_outputs = dict(
        (output["OutputKey"], output["OutputValue"])
        for output in outputs
        if "OutputKey" in output and "OutputValue" in output
    )

    # Update `knowledge_base_id` of the bot using dedicated Knowledge Base.
    knowledge_base_id = stack_outputs.get("KnowledgeBaseId")
    if knowledge_base_id:
        data_source_ids: List[str] = [
            value
            for key, value in stack_outputs.items()
            if key.startswith(f"DataSource")
        ]
        data_sources.extend(
            {
                "KnowledgeBaseId": knowledge_base_id,
                "DataSourceId": data_source_id,
                "FilesDiffs": bot_files_diffs,
            }
            for data_source_id in data_source_ids
        )
        update_knowledge_base_id(user_id, bot_id, knowledge_base_id, data_source_ids)

    # Shared-KB bots updated outside the SharedKnowledgeBases flow carry no
    # DataSources in the event, and their per-bot stack exposes no
    # KnowledgeBaseId output, so their file diffs would silently never be
    # ingested. Fall back to the Knowledge Base already recorded on the bot.
    if not data_sources and bot_files_diffs:
        knowledge_base = find_bot_by_id(bot_id).bedrock_knowledge_base
        if (
            knowledge_base
            and knowledge_base.knowledge_base_id
            and knowledge_base.data_source_ids
        ):
            data_sources.extend(
                {
                    "KnowledgeBaseId": knowledge_base.knowledge_base_id,
                    "DataSourceId": data_source_id,
                    "FilesDiffs": bot_files_diffs,
                }
                for data_source_id in knowledge_base.data_source_ids
            )

    # Update `guardrail_arn` of the bot using dedicated Guardrail.
    guardrail_arn = stack_outputs.get("GuardrailArn")
    guardrail_version = stack_outputs.get("GuardrailVersion")
    if guardrail_arn and guardrail_version:
        update_guardrails_params(user_id, bot_id, guardrail_arn, guardrail_version)

    return {
        "OwnerUserId": user_id,
        "BotId": bot_id,
        "DataSources": data_sources,
        **(
            {
                "Lock": event["Lock"],
            }
            if "Lock" in event
            else {}
        ),
    }
