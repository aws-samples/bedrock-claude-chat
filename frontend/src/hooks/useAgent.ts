import { useEffect, useState } from 'react';
import { AgentTool } from '../@types/agent';
import { useAgentApi } from './useAgentToolApi';

export const useAgent = () => {
  const api = useAgentApi();
  const [availableTools, setAvailableTools] = useState<AgentTool[]>();
  const getAvailableTools = async () => await api.availableTools();

  useEffect(() => {
    getAvailableTools().then((res) => setAvailableTools(() => res.data));
  }, []);

  return {
    availableTools,
  };
};
