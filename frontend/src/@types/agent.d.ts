export type AgentTool = {
  name: string;
  description: string;
};
export type Agent = {
  tools: AgentTool;
};
