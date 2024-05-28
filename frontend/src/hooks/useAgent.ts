import { useAgentApi } from './useAgentToolApi';

export const useAgent = () => {
  const api = useAgentApi();

  return {
    getTools: async () => await api.tools(),
  };
};
