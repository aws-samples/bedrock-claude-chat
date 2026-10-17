import React from 'react';
import ToolCard from './ToolCard';
import ReasoningCard from '../../reasoning/components/ReasoningCard';
import ChatMessageMarkdown from '../../../components/ChatMessageMarkdown';
import { AgentToolsProps } from '../types';
import { useTranslation } from 'react-i18next';
import { PiCircleNotchBold } from 'react-icons/pi';
import { RelatedDocument } from '../../../@types/conversation';

type AgentToolListProps = {
  messageId: string;
  tools: AgentToolsProps;
  relatedDocuments?: RelatedDocument[];
};

const AgentToolList: React.FC<AgentToolListProps> = ({messageId, tools, relatedDocuments}) => {
  const { t } = useTranslation();
  const isRunning = (
    Object.keys(tools.tools).length === 0 ||
    Object.values(tools.tools).some(tool => tool.status === 'running')
  );
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col rounded-sm border border-gray bg-aws-paper-light dark:bg-aws-paper-dark text-aws-font-color-light/80 dark:text-aws-font-color-dark/80">
      {tools.reasoning && (
        // ReasoningCard for ReasoningContent in thinkingLog of assistant message.
        <ReasoningCard
          content={tools.reasoning}
          className="border-b border-gray"
        />
      )}

      {(isRunning || tools.thought) && (
        <div className="flex items-center border-b border-gray p-2 last:border-b-0">
          {isRunning && <PiCircleNotchBold className="mr-2 animate-spin" />}
          {tools.thought ? (
            <ChatMessageMarkdown
              messageId={messageId}
              relatedDocuments={relatedDocuments}
            >
              {tools.thought}
            </ChatMessageMarkdown>
          ) : t('agent.progress.label')}
        </div>
      )}

      {Object.entries(tools.tools).map(([toolUseId, toolUse]) => (
        <ToolCard
          className=" border-b border-gray last:border-b-0"
          key={toolUseId}
          toolUseId={toolUseId}
          name={toolUse.name}
          status={toolUse.status}
          input={toolUse.input}
          resultContents={toolUse.resultContents}
          relatedDocuments={toolUse.relatedDocuments}
        />
      ))}
    </div>
  );
};

export default AgentToolList;
