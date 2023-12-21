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
};

export type BotKnowledge = {
  sourceUrls: string[];
  sitemapUrls: string[];
  filenames: string[];
};

export type BotSyncStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export type BotMetaWithAvailable = BotMeta & {
  available: boolean;
};

export type BotDetails = BotMeta & {
  instruction: string;
  knowledge: BotKnowledge;
  syncStatus: BotSyncStatus;
  syncStatusReason: string;
};

export type RegisterBotRequest = {
  id: string;
  title: string;
  instruction: string;
  description?: string;
  knowledge?: BotKnowledge;
};

export type RegisterBotResponse = BotDetails;

export type UpdateBotRequest = {
  title: string;
  instruction: string;
  description?: string;
  knowledge?: BotKnowledge;
};

export type UpdateBotResponse = {
  id: string;
  title: string;
  instruction: string;
  description: string;
  knowledge?: BotKnowledge;
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

export type GetBotsResponse = BotMetaWithAvailable[];

export type GetMyBotResponse = BotDetails;

export type GetBotSummaryResponse = BotMeta;
