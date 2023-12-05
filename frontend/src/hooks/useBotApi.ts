import {
  GetBotResponse,
  GetBotsRequest,
  GetBotsResponse,
  RegisterBotRequest,
  RegisterBotResponse,
  UpdateBotPinnedRequest,
  UpdateBotPinnedResponse,
  UpdateBotRequest,
  UpdateBotResponse,
  UpdateBotVisibilityRequest,
  UpdateBotVisibilityResponse,
} from '../@types/bot';
import useHttp from './useHttp';

const useBotApi = () => {
  const http = useHttp();

  return {
    bots: (req: GetBotsRequest) => {
      return http.get<GetBotsResponse>(['bot', req]);
      // return http.get<GetBotsResponse>('bot');
    },
    getBot: (botId: string) => {
      return http.getOnce<GetBotResponse>(`bot/${botId}`);
    },
    registerBot: (params: RegisterBotRequest) => {
      return http.post<RegisterBotResponse>('bot', params);
    },
    updateBot: (botId: string, params: UpdateBotRequest) => {
      return http.patch<UpdateBotResponse>(`bot/${botId}`, params);
    },
    updateBotPinned: (botId: string, params: UpdateBotPinnedRequest) => {
      return http.patch<UpdateBotPinnedResponse>(`bot/${botId}/pinned`, params);
    },
    updateBotVisibility: (
      botId: string,
      params: UpdateBotVisibilityRequest
    ) => {
      return http.patch<UpdateBotVisibilityResponse>(
        `bot/${botId}/visibility`,
        params
      );
    },
    deleteBot: (botId: string) => {
      return http.delete(`bot/${botId}`);
    },
  };
};

export default useBotApi;
