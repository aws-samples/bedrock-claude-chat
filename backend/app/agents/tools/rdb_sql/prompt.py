QUERY_CHECKER = """
{query}
Double check the {dialect} query above for common mistakes with rules:
<rules>
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins
- Column name ALWAYS enclosed in double quotes
</rules>

Remember, the column name should ALWAYS be enclosed in quotes like `COLUMN`.

<BAD-example>
- SELECT * FROM table WHERE column = value;
- SELECT * FROM table WHERE column = 'value';
</BAD-example>

<GOOD-example>
- SELECT * FROM table WHERE "column" = 'value';
</GOOD-example>

If there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.

Output the final SQL query only.

SQL Query: """
