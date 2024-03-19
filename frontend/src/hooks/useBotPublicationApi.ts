import useHttp from './useHttp';
import {
  CreateBotPublicationApiKeyRequest,
  CreateBotPublicationApiKeyResponse,
  DeleteBotPublicationApiKeyResponse,
  DeleteBotPublicationRequest,
  DeleteBotPublicationResponse,
  GetBotPublicationApiKeyResponse,
  GetBotPublicationRequest,
  GetBotPublicationRespose,
  PublishBotRequest,
  PublishBotResponse,
} from '../@types/api-publication';

const useBotPublicationApi = () => {
  const http = useHttp();

  return {
    getBotPublication: (botId?: string, req?: GetBotPublicationRequest) => {
      return http.get<GetBotPublicationRespose>(
        botId ? [`/bot/${botId}/publication`, req] : null,
        {
          errorRetryCount: 0,
        }
      );
    },
    publishBot: (botId: string, req: PublishBotRequest) => {
      return http.post<PublishBotResponse, PublishBotRequest>(
        `/bot/${botId}/publication`,
        req
      );
    },
    deleteBotPublication: (
      botId: string,
      req?: DeleteBotPublicationRequest
    ) => {
      return http.delete<DeleteBotPublicationResponse>(
        `/bot/${botId}/publication`,
        req
      );
    },
    getBotPublicationApiKey: (botId?: string, apiKeyId?: string) => {
      return http.get<GetBotPublicationApiKeyResponse>(
        botId && apiKeyId
          ? `/bot/${botId}/publication/api-key/${apiKeyId}`
          : null
      );
    },
    deleteBotPublicationApiKey: (botId: string, apiKeyId: string) => {
      return http.delete<DeleteBotPublicationApiKeyResponse>(
        `/bot/${botId}/publication/api-key/${apiKeyId}`
      );
    },
    createBotPublicationApiKey: (
      botId: string,
      params: CreateBotPublicationApiKeyRequest
    ) => {
      return http.post<CreateBotPublicationApiKeyResponse>(
        `/bot/${botId}/publication/api-key`,
        params
      );
    },
  };
};

export default useBotPublicationApi;
