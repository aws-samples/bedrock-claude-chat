import { Tool } from '../@types/agent';
import useHttp from './useHttp';

export const useAgentApi = () => {
  const http = useHttp();
  return {
    tools: () => http.getOnce<Tool[]>(`/bot/new/agent/available-tools`),
  };
};
