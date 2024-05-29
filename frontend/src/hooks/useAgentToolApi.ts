import { AgentTool } from '../@types/bot';
import useHttp from './useHttp';

export const useAgentApi = () => {
  const http = useHttp();
  return {
    availableTools: () =>
      http.getOnce<AgentTool[]>(`/bot/new/agent/available-tools`),
  };
};
