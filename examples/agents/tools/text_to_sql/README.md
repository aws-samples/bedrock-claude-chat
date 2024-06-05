# Text-to-SQL tool

## Overview

The Text-to-SQL tool is designed to simplify the interaction with SQL databases by leveraging the capabilities of large language models (LLMs). This tool set allows users to query SQL databases, retrieve schema information, and check the correctness of SQL queries using natural language prompts. It consists of several components, each serving a specific function to enhance the querying experience:

- **QuerySQLDataBaseTool**: Executes detailed and correct SQL queries against the database and returns the results. If the query is incorrect, it provides error messages for further refinement.

- **InfoSQLDatabaseTool**: Retrieves schema information and sample rows for specified tables. This is useful for understanding the structure and content of the database tables.

- **ListSQLDatabaseTool**: Lists the names of all tables in the database. This helps in identifying the available tables for querying.

- **QuerySQLCheckerTool**: Uses an LLM to check the correctness of SQL queries before execution. This ensures that the queries are accurate and reduces the likelihood of errors during execution.

The tool is built to support PostgreSQL databases and utilizes the pg8000 adapter for database interactions.

**Note that current implementation refer the same aurora database as pgvector provisioned by the Bedrock Claude Chat.**

## How to enable this tool

- Make a directory named like `backend/app/agents/tools/text_to_sql`.
- Move `prompt.py, tool.py` under the directory created.
- Open `backend/app/agents/utils.py` and modify like:

```py
from app.agents.langchain import BedrockLLM
from app.agents.tools.base import BaseTool
from app.agents.tools.internet_search import internet_search_tool
+ from app.agents.tools.text_to_sql.tool import get_sql_tools


def get_available_tools() -> list[BaseTool]:
    tools: list[BaseTool] = []
    tools.append(internet_search_tool)
+    llm = BedrockLLM.from_model(model="claude-v3-haiku")
+    sql_tools = get_sql_tools(llm=llm)
+    tools.extend(sql_tools)

    return tools
```

- Run cdk deploy.
