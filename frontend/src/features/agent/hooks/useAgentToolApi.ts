import useHttp from '../../../hooks/useHttp';
import { AgentTool } from '../types';

export const useAgentApi = () => {
  const http = useHttp();
  return {
    availableTools: () =>
      http.getOnce<AgentTool[]>(`/bot/new/agent/available-tools`),
  };
};
