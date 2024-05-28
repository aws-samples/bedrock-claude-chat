export type BotKind = 'private' | 'mixed';

export type BotMeta = {
  id: string;
  title: string;
  description: string;
  createTime: Date;
  lastUsedTime: Date;
  isPublic: boolean;
  isPinned: boolean;
  owned: boolean;
  syncStatus: BotSyncStatus;
};

export type BotKnowledge = {
  sourceUrls: string[];
  // Sitemap cannot be used yet.
  sitemapUrls: string[];
  filenames: string[];
};

export type EmdeddingParams = {
  chunkSize: number;
  chunkOverlap: number;
  enablePartitionPdf: boolean;
};

export type BotKnowledgeDiff = {
  sourceUrls: string[];
  // Sitemap cannot be used yet.
  sitemapUrls: string[];
  addedFilenames: string[];
  deletedFilenames: string[];
  unchangedFilenames: string[];
};

export type BotSyncStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export type BotListItem = BotMeta & {
  available: boolean;
};

export type GenerationParams = {
  maxTokens: number;
  topK: number;
  topP: number;
  temperature: number;
  stopSequences: string[];
}

export type SearchParams = {
  maxResults: number;
}

export type BotDetails = BotMeta & {
  instruction: string;
  embeddingParams: EmdeddingParams;
  generationParams: GenerationParams;
  searchParams: SearchParams;
  knowledge: BotKnowledge;
  syncStatusReason: string;
  displayRetrievedChunks: boolean;
};

export type BotSummary = BotMeta & {
  hasKnowledge: boolean;
};

export type BotFile = {
  filename: string;
  status: 'UPLOADING' | 'UPLOADED' | 'ERROR';
  errorMessage?: string;
  progress?: number;
};

export type RegisterBotRequest = {
  id: string;
  title: string;
  instruction: string;
  description?: string;
  embeddingParams?: EmdeddingParams;
  generationParams?: GenerationParams;
  searchParams?: SearchParams;
  knowledge?: BotKnowledge;
  displayRetrievedChunks: boolean;
};

export type RegisterBotResponse = BotDetails;

export type UpdateBotRequest = {
  title: string;
  instruction: string;
  description?: string;
  embeddingParams?: EmdeddingParams;
  generationParams?: BotGenerationConfig;
  searchParams?: SearchParams;
  knowledge?: BotKnowledgeDiff;
  displayRetrievedChunks: boolean;
};

export type UpdateBotResponse = {
  id: string;
  title: string;
  instruction: string;
  description: string;
  embeddingParams: EmdeddingParams;
  generationParams: GenerationParams;
  searchParams: SearchParams;
  knowledge?: BotKnowledge;
  displayRetrievedChunks: boolean;
};

export type UpdateBotPinnedRequest = {
  pinned: boolean;
};

export type UpdateBotPinnedResponse = null;

export type UpdateBotVisibilityRequest = {
  toPublic: boolean;
};

export type UpdateBotVisibilityResponse = null;

export type GetBotsRequest =
  | {
      kind: 'private';
      limit?: number;
    }
  | {
      kind: 'mixed';
      limit: number;
    }
  | {
      kind: 'mixed';
      pinned: boolean;
    };

export type GetBotsResponse = BotListItem[];

export type GetMyBotResponse = BotDetails;

export type GetBotSummaryResponse = BotSummary;

export type GetPublicBotResponse = BotDetails;

export type GetPresignedUrlResponse = {
  url: string;
};
