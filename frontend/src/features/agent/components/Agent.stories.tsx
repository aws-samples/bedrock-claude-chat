import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { AvailableTools } from './AvailableTools';
import { AgentTool } from '../types';
import ToolCard from './ToolCard';
import AgentToolList from './AgentToolList';
export default {} satisfies Meta;

export const Tools = () => {
  const availableTools: AgentTool[] = [
    {
      toolType: "plain",
      name: 'get_weather',
      description: '',
    },
    {
      toolType: "plain",
      name: 'sql_db_query',
      description: '',
    },
    {
      toolType: "plain",
      name: 'sql_db_schema',
      description: '',
    },
    {
      toolType: "plain",
      name: 'sql_db_list_tables',
      description: '',
    },
    {
      toolType: "plain",
      name: 'sql_db_query_checker',
      description: '',
    },
    {
      toolType: "internet",
      name: 'internet_search',
      description: '',
      searchEngine: 'duckduckgo',
    },
    {
      toolType: "plain",
      name: 'knowledge_base_tool',
      description: '',
    },
  ];
  const [tools, setTools] = useState<AgentTool[]>([]);
  return (
    <AvailableTools
      availableTools={availableTools}
      tools={tools}
      setTools={setTools}
    />
  );
};

export const ToolCardRunning = () => (
  <ToolCard
    toolUseId="tool1_tcr"
    name="internet_search"
    status="running"
    input={{ country: 'jp-jp', query: '東京 天気', time_limit: 'd' }}
  />
);

export const ToolCardSuccess = () => (
  <ToolCard
    toolUseId="tool2_tcs"
    name="Database Query"
    status="success"
    input={{ query: 'SELECT * FROM table' }}
    resultContents={[{
      text: 'some data',
    }]}
  />
);

export const ToolCardError = () => (
  <ToolCard
    toolUseId="tool3_tce"
    name="API Call"
    status="error"
    input={{ query: 'SELECT * FROM table' }}
  />
);

export const ToolListRunning = () => {
  return <AgentToolList
    messageId="message_tlr"
    tools={{
      tools: {
        tool1_tlr: {
          name: 'internet_search',
          status: 'running',
          input: { country: 'jp-jp', query: '東京 天気', time_limit: 'd' },
        },
        tool2_tlr: {
          name: 'database_query',
          status: 'success',
          input: { query: 'SELECT * FROM table' },
          // Pass the content as stringified JSON
          resultContents: [{
            text: '{"result": "success", "data": "some data"}',
          }],
        },
        tool3_tlr: {
          name: 'API Call',
          status: 'running',
          input: { country: 'jp-jp', query: '東京 天気', time_limit: 'd' },
        },
      },
    }}
  />;
};

export const ToolList = () => {
  return <AgentToolList
    messageId="message_tl"
    tools={{
      reasoning: 'ユーザーは東京の天気を知りたがっています。internet_searchツールを利用して東京の天気を調べてみましょう。',
      thought: '東京の天気について以下のことがわかりました。\n- search result 1[^tool1_tl@0]\n- search result 2[^tool1_tl@1]\n- search result 3[^tool1_tl@2]',
      tools: {
        tool1_tl: {
          name: 'internet_search',
          status: 'success',
          input: { country: 'jp-jp', query: '東京 天気', time_limit: 'd' },
          resultContents: [
            {
              text: "search result 1",
            },
            {
              text: "search result 2",
            },
            {
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            },
          ],
        },
        tool2_tl: {
          name: 'database_query',
          status: 'success',
          input: { query: 'SELECT * FROM table' },
          // Pass the content as stringified JSON
          resultContents: [{
            text: '{"result": "success", "data": "some data"}',
          }],
        },
        tool3_tl: {
          name: 'API Call',
          status: 'error',
          input: { country: 'jp-jp', query: '東京 天気', time_limit: 'd' },
          // Pass the content as simple string
          resultContents: [{
            text: 'Error! Connection Timeout',
          }],
        },
      },
    }}
    relatedDocuments={[
      {
        content: {
          text: 'search result 1',
        },
        sourceId: 'tool1_tl@0',
        sourceName: 'internet_search',
      },
      {
        content: {
          text: 'search result 2',
        },
        sourceId: 'tool1_tl@1',
        sourceName: 'internet_search',
      },
      {
        content: {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        },
        sourceId: 'tool1_tl@2',
        sourceName: 'internet_search',
      },
    ]}
  />;
};
