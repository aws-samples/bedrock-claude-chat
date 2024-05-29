import { useAgentApi } from './useAgentToolApi';

export const useAgent = () => {
  const api = useAgentApi();

  return {
    getAvailableTools: async () => await api.availableTools(),
  };
};
