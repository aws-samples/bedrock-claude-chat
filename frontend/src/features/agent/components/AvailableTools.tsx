import { useTranslation } from 'react-i18next';
import { AgentTool } from '../types';
import Toggle from '../../../components/Toggle';
import { Dispatch, useCallback } from 'react';
import { TFunction } from 'i18next';

type Props = {
  availableTools: AgentTool[] | undefined;
  tools: AgentTool[];
  setTools: Dispatch<React.SetStateAction<AgentTool[]>>;
};
export const AvailableTools = ({ availableTools, tools, setTools }: Props) => {
  const { t } = useTranslation();
  const handleChangeTool = useCallback(
    (tool: AgentTool) => () => {
      setTools((preTools) =>
        tools?.map(({ name }) => name).includes(tool.name)
          ? [...preTools.filter(({ name }) => name != tool.name)]
          : [...preTools, tool]
      );
    },
    [tools, setTools]
  );

  return (
    <>
      <div className="flex items-center gap-1">
        <div className="text-lg font-bold">{t('bot.label.agent')}</div>
      </div>

      <div className="text-sm text-aws-font-color/50">
        {t('bot.help.agent.overview')}
      </div>

      {availableTools?.map((tool) => (
        <div key={tool.name} className="flex items-center">
          <Toggle
            value={!!tools?.map(({ name }) => name).includes(tool.name)}
            onChange={handleChangeTool(tool)}
          />
          <div className="whitespace-pre-wrap text-sm text-aws-font-color/50">
            {getToolName(tool, t)}
          </div>
        </div>
      ))}
    </>
  );
};

const getToolName = (tool: AgentTool, t: TFunction) => {
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
    default:
      `${tool.name}:${tool.description}`;
  }
};
