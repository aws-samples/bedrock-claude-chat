import { AvailableTool } from '../@types/agent';
import useHttp from './useHttp';

export const useAgentApi = () => {
  const http = useHttp();
  return {
    availableTools: () =>
      http.getOnce<AvailableTool[]>(`/bot/new/agent/available-tools`),
  };
};
