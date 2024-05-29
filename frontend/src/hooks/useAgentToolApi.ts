import { AgentTool } from '../@types/agent';
import useHttp from './useHttp';

export const useAgentApi = () => {
  const http = useHttp();
  return {
    availableTools: () =>
      http.getOnce<AgentTool[]>(`/bot/new/agent/available-tools`),
  };
};
