export type QuotaPeriod = 'DAY' | 'WEEK' | 'MONTH';

export type BotPublicationQuota = {
  limit: number | null;
  offset: number | null;
  period: QuotaPeriod | null;
};

export type BotPublicationThrottle = {
  rateLimit: number | null;
  burstLimit: number | null;
};

export type ListPublicBotsRequest = {
  limit?: number;
  start?: string;
  end?: string;
};

export type ListPublicBotsResponse = {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  publishedDatetime: Date;
  ownerUserId: string;
  totalPrice: number;
}[];

export type PublishBotRequest = {
  stage?: string;
  quota: BotPublicationQuota;
  throttle: BotPublicationThrottle;
  allowedOrigins: string[];
};

export type PublishBotResponse = null;

export type GetBotPublicationRequest = {
  ownerUserId?: string;
};

export type GetBotPublicationRespose = {
  stage: string;
  quota: BotPublicationQuota;
  throttle: BotPublicationThrottle;
  allowedOrigins: string[];
  cfnStatus: string;
  codebuildId: string;
  codebuildStatus: string;
  endpoint: string;
  apiKeyIds: string[];
};

export type DeleteBotPublicationRequest = {
  ownerUserId?: string;
};

export type DeleteBotPublicationResponse = null;

export type GetBotPublicationApiKeyResponse = {
  id: string;
  value: string;
  enabled: boolean;
  createdDate: Date;
};

export type DeleteBotPublicationApiKeyResponse = null;

export type CreateBotPublicationApiKeyResponse = {
  id: string;
  value: string;
  enabled: boolean;
  createdDate: Date;
};
