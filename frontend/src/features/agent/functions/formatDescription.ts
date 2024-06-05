import { TFunction } from 'i18next';
import { AgentTool } from '../types';

// Please add a corresponding case branch for the Tool Name in the following function when the AgentTool returned from the backend is updated.
export const formatDescription = (tool: AgentTool, t: TFunction) => {
  switch (tool.name) {
    case 'get_weather':
      return `${t(`agent.tools.get_weather.name`)}:${t(
        `agent.tools.get_weather.description`
      )}`;
    case 'sql_db_query':
      return `${t(`agent.tools.sql_db_query.name`)}:${t(
        `agent.tools.sql_db_query.description`
      )}`;
    case 'sql_db_schema':
      return `${t(`agent.tools.sql_db_schema.name`)}:${t(
        `agent.tools.sql_db_schema.description`
      )}`;
    case 'sql_db_list_tables':
      return `${t(`agent.tools.sql_db_list_tables.name`)}:${t(
        `agent.tools.sql_db_list_tables.description`
      )}`;
    case 'sql_db_query_checker':
      return `${t(`agent.tools.sql_db_query_checker.name`)}:${t(
        `agent.tools.sql_db_query_checker.description`
      )}`;
    case 'internet_search':
      return `${t(`agent.tools.internet_search.name`)}:${t(
        `agent.tools.internet_search.desciription`
      )}`;
    default:
      return `${tool.name}:${tool.description}`;
  }
};
