import useHttp from './useHttp';

export const useAgentApi = () => {
  const http = useHttp();
  return {
    tools: () => http.getOnce<any>(`/bot/new/agent/available-tools`),
  };
};
