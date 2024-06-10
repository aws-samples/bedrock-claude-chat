"""Tools for interacting with a SQL database."""

import json
import logging
from typing import Any, Dict, Iterable, Optional, Sequence, Type, Union

from app.agents.tools.base import BaseTool
from app.agents.tools.text_to_sql.prompt import QUERY_CHECKER
from app.utils import query_postgres
from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, root_validator
from langchain_core.runnables import Runnable

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_sql_tools(llm: BaseLanguageModel) -> list[BaseTool]:
    """Get the tools in the toolkit."""
    db = SQLDatabase()
    list_sql_database_tool = ListSQLDatabaseTool(db=db)
    info_sql_database_tool_description = (
        "Input to this tool is a comma-separated list of tables, output is the "
        "schema and sample rows for those tables. "
        "Be sure that the tables actually exist by calling "
        f"{list_sql_database_tool.name} first! "
        "Example Input: table1, table2, table3"
    )
    info_sql_database_tool = InfoSQLDatabaseTool(
        db=db, description=info_sql_database_tool_description
    )
    query_sql_database_tool_description = (
        "Input to this tool is a detailed and correct SQL query, output is a "
        "result from the database. If the query is not correct, an error message "
        "will be returned. If an error is returned, rewrite the query, check the "
        "query, and try again. If you encounter an issue with Unknown column "
        f"'xxxx' in 'field list', use {info_sql_database_tool.name} "
        "to query the correct table fields."
    )
    query_sql_database_tool = QuerySQLDataBaseTool(
        db=db, description=query_sql_database_tool_description
    )
    query_sql_checker_tool_description = (
        "Use this tool to double check if your query is correct before executing "
        "it. Always use this tool before executing a query with "
        f"{query_sql_database_tool.name}!"
    )
    query_sql_checker_tool = QuerySQLCheckerTool(
        db=db, llm=llm, description=query_sql_checker_tool_description
    )
    return [
        query_sql_database_tool,
        info_sql_database_tool,
        list_sql_database_tool,
        query_sql_checker_tool,
    ]


class SQLDatabase:
    """Database class for interacting with a SQL database.
    Reference: https://github.com/langchain-ai/langchain/blob/38c297a0256d35bc64ea8c652786daa0e34b860d/libs/community/langchain_community/utilities/sql_database.py

    Note: this is for PostgreSQL only. SqlAlchemy supports other databases as well,
    but the well-known adapter psycogp2 license is copyleft (LGPL), so we use pg8000 instead.
    https://pypi.org/project/psycopg2/
    """

    NUMBER_OF_SAMPLE_ROWS = 3

    def __init__(
        self,
        schema: Optional[str] = None,
        ignore_tables: Optional[list[str]] = None,
        include_tables: Optional[list[str]] = None,
        view_support: bool = False,
    ):
        self._schema = schema
        if include_tables and ignore_tables:
            raise ValueError("Cannot specify both include_tables and ignore_tables")

        self._ignore_tables = set(ignore_tables) if ignore_tables else set()
        self._include_tables = set(include_tables) if include_tables else set()
        self._view_support = view_support

    def get_usable_table_names(self) -> Iterable[str]:
        """Get names of tables available."""
        if self._include_tables:
            return sorted(self._include_tables)

        QUERY_TO_LIST = ""
        if self._view_support:
            QUERY_TO_LIST = """SELECT table_name FROM information_schema.tables
WHERE table_schema = %s AND table_type IN ('BASE TABLE', 'VIEW')
            """
        else:
            QUERY_TO_LIST = """SELECT table_name FROM information_schema.tables
WHERE table_schema = %s AND table_type = 'BASE TABLE'
            """
        logger.debug(f"QUERY_TO_LIST: {QUERY_TO_LIST}")

        res = query_postgres(
            QUERY_TO_LIST, include_columns=False, params=(self._schema or "public",)
        )
        logger.debug(f"Query result: {res}")
        table_names = [row[0] for row in res]
        logger.debug(f"Table names: {table_names}")

        if self._ignore_tables:
            table_names = [
                table_name
                for table_name in table_names
                if table_name not in self._ignore_tables
            ]

        return sorted(table_names)

    def get_table_info(self, table_names: Optional[list[str]] = None) -> str:
        """Get information about specified tables.

        Follows best practices as specified in: Rajkumar et al, 2022
        (https://arxiv.org/abs/2204.00498)

        If `sample_rows_in_table_info`, the specified number of sample rows will be
        appended to each table description. This can increase performance as
        demonstrated in the paper.
        """
        all_table_names = self.get_usable_table_names()
        if table_names is not None:
            missing_tables = set(table_names).difference(all_table_names)
            if missing_tables:
                raise ValueError(f"table_names {missing_tables} not found in database")
            all_table_names = table_names

        QUERY_TO_TABLE_INFO = """SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = %s
"""
        tables = []
        for table_name in all_table_names:
            res_table_info = query_postgres(
                QUERY_TO_TABLE_INFO, include_columns=False, params=(table_name,)
            )
            table_info = f"CREATE TABLE {table_name} (\n"
            for row in res_table_info:
                column_name, data_type = row
                table_info += f"  {column_name} {data_type},\n"
            table_info = table_info.rstrip(",\n") + "\n);"

            # Add sample rows
            table_info += "\n\n/*"
            res_sample_rows = query_postgres(
                f"SELECT * FROM {table_name} LIMIT {self.NUMBER_OF_SAMPLE_ROWS}",
                include_columns=True,
            )
            columns_str = "\t".join(res_sample_rows[0])
            sample_rows_str = "\n".join(
                [
                    "\t".join([str(cell)[:100] for cell in row])
                    for row in res_sample_rows[1:]
                ]
            )
            table_info += (
                f"{self.NUMBER_OF_SAMPLE_ROWS} rows from {table_name} table:\n"
                f"{columns_str}\n"
                f"{sample_rows_str}\n"
            )
            table_info += "*/"
            tables.append(table_info)

        tables.sort()
        final_str = "\n\n".join(tables)
        return final_str

    def run(
        self,
        query: str,
    ) -> Union[str, Sequence[Dict[str, Any]]]:
        """Execute a SQL command and return a string representing the results.

        If the statement returns rows, a string of the results is returned.
        If the statement returns no rows, an empty string is returned.
        """
        INCLUDE_COLUMNS = True
        try:
            # Parse the JSON query
            query_params = json.loads(query)
            query = query_params.get("query")
        except json.JSONDecodeError:
            pass

        logger.debug(f"Running query: {query}")

        results = query_postgres(query, include_columns=INCLUDE_COLUMNS)
        logger.debug(f"Results: {results}")
        if bool(results[1]):  # Note that the first row is the column names
            return str(results)
        return "No results found."

    def run_no_throw(self, query: str) -> Union[str, Sequence[Dict[str, Any]]]:
        """Execute a query and return the results or an error message."""
        try:
            return self.run(query)
        except Exception as e:
            return f"Error: {e}"

    def get_table_info_no_throw(self, table_names: list[str]) -> str:
        """Get the schema for a list of tables."""
        try:
            return self.get_table_info(table_names)
        except ValueError as e:
            """Format the error message"""
            return f"Error: {e}"


class BaseSQLDatabaseTool(BaseModel):
    """Base tool for interacting with a SQL database."""

    db: SQLDatabase = Field(exclude=True)

    class Config(BaseTool.Config):
        pass


class _QuerySQLDataBaseToolInput(BaseModel):
    query: str = Field(
        ...,
        # description="A detailed and correct SQL query.",
        description="""A detailed and correct SQL query. Column names should ALWAYS be enclosed in double quote like "COLUMN".
<GOOD-example>
SELECT "column" FROM "manufacturing_specs" WHERE "condition" = 'value';
</GOOD-example>
<BAD-example>
SELECT column FROM manufacturing_specs WHERE condition = 'value';
</BAD-example>
""",
    )


class QuerySQLDataBaseTool(BaseSQLDatabaseTool, BaseTool):
    """Tool for querying a SQL database."""

    name: str = "sql_db_query"
    description: str = """
    Execute a SQL query against the database and get back the result..
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.
    """
    args_schema: Type[BaseModel] = _QuerySQLDataBaseToolInput

    def _run(
        self,
        query: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> Union[str, Sequence[Dict[str, Any]]]:
        """Execute the query, return the results or an error message."""
        return self.db.run_no_throw(query)


class _InfoSQLDatabaseToolInput(BaseModel):
    table_names: str = Field(
        ...,
        description=(
            "A comma-separated list of the table names for which to return the schema. "
            "Example input: 'table1, table2, table3'"
        ),
    )


class InfoSQLDatabaseTool(BaseSQLDatabaseTool, BaseTool):
    """Tool for getting metadata about a SQL database."""

    name: str = "sql_db_schema"
    description: str = "Get the schema and sample rows for the specified SQL tables."
    args_schema: Type[BaseModel] = _InfoSQLDatabaseToolInput

    def _run(
        self,
        table_names: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Get the schema for tables in a comma-separated list."""
        return self.db.get_table_info_no_throw(
            [t.strip() for t in table_names.split(",")]
        )


class _ListSQLDataBaseToolInput(BaseModel):
    tool_input: str = Field("", description="An empty string")


class ListSQLDatabaseTool(BaseSQLDatabaseTool, BaseTool):
    """Tool for getting tables names."""

    name: str = "sql_db_list_tables"
    description: str = (
        "Input is an empty string, output is a comma-separated list of tables in the database."
    )

    args_schema: Type[BaseModel] = _ListSQLDataBaseToolInput

    def _run(
        self,
        tool_input: str = "",
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Get a comma-separated list of table names."""
        return ", ".join(self.db.get_usable_table_names())


class _QuerySQLCheckerToolInput(BaseModel):
    query: str = Field(..., description="A detailed and SQL query to be checked.")


class QuerySQLCheckerTool(BaseSQLDatabaseTool, BaseTool):
    """Use an LLM to check if a query is correct.
    Adapted from https://www.patterns.app/blog/2023/01/18/crunchbot-sql-analyst-gpt/"""

    template: str = QUERY_CHECKER
    llm: BaseLanguageModel
    llm_chain: Runnable = Field(init=False)
    name: str = "sql_db_query_checker"
    description: str = """
    Use this tool to double check if your query is correct before executing it.
    Always use this tool before executing a query with sql_db_query!
    """
    args_schema: Type[BaseModel] = _QuerySQLCheckerToolInput

    @root_validator(pre=True)
    def initialize_llm_chain(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if "llm_chain" not in values:
            prompt = PromptTemplate(
                template=QUERY_CHECKER, input_variables=["dialect", "query"]
            )
            llm = values.get("llm")
            values["llm_chain"] = prompt | llm  # type: ignore

        return values

    def _run(
        self,
        query: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Use the LLM to check the query."""
        return self.llm_chain.invoke({"dialect": "PostgreSQL", "query": query})

    async def _arun(
        self,
        query: str,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
    ) -> str:
        return await self.llm_chain.ainvoke({"dialect": "PostgreSQL", "query": query})
