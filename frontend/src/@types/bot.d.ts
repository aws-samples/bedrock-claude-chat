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

export type RegisterBotRequest = {
  id: string;
  title: string;
  instruction: string;
  description?: string;
};

export type RegisterBotResponse = {
  id: string;
  title: string;
  instruction: string;
  description: string;
  createTime: Date;
  lastUsedTime: Date;
  isPublic: boolean;
  isPinned: boolean;
  owned: boolean;
};

export type UpdateBotRequest = {
  title: string;
  instruction: string;
  description?: string;
};

export type UpdateBotResponse = {
  id: string;
  title: string;
  instruction: string;
  description: string;
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
      pinned: number;
    };

export type GetBotsResponse = (BotMeta & {
  available: boolean;
})[];

export type GetBotResponse = BotMeta & {
  instruction: string;
};
