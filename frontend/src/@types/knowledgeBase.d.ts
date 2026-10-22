export type KnowledgeBaseListItem = {
  knowledgeBaseId: string;
  name: string;
  description: string | null;
  status: string;
};

export type ListKnowledgeBasesResponse = {
  knowledgeBases: KnowledgeBaseListItem[];
};
