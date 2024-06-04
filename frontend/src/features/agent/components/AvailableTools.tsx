import { useTranslation } from 'react-i18next';
import { AgentTool } from '../types';
import Toggle from '../../../components/Toggle';
import { Dispatch, useCallback } from 'react';
import { formatDescription } from '../functions/formatDescription';
import Help from '../../../components/Help';
import Skeleton from '../../../components/Skeleton';

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
        <div className="text-lg font-bold">{t('agent.label')}</div>
        <Help direction="right" message={t('agent.hint')} />
      </div>

      <div className="text-sm text-aws-font-color/50">
        {t('agent.help.overview')}
      </div>
      {availableTools === undefined && <Skeleton className="h-12 w-full" />}

      {availableTools?.map((tool) => (
        <div key={tool.name} className="flex items-center">
          <Toggle
            value={!!tools?.map(({ name }) => name).includes(tool.name)}
            onChange={handleChangeTool(tool)}
          />
          <div className="whitespace-pre-wrap text-sm text-aws-font-color/50">
            {formatDescription(tool, t)}
          </div>
        </div>
      ))}
    </>
  );
};
