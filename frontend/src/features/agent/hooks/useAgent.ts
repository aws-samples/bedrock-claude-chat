import { useEffect, useState } from 'react';
import { useAgentApi } from './useAgentToolApi';
import { AgentTool } from '../types';

export const useAgent = () => {
  const api = useAgentApi();
  const [availableTools, setAvailableTools] = useState<AgentTool[]>();
  const getAvailableTools = async () => await api.availableTools();

  useEffect(() => {
    getAvailableTools().then((res) => setAvailableTools(() => res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    availableTools,
  };
};
