import axios from 'axios';
import {
  GetBotSummaryResponse,
  GetBotsRequest,
  GetBotsResponse,
  GetMyBotResponse,
  GetPresignedUrlResponse,
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
    },
    getMyBot: (botId: string) => {
      return http.getOnce<GetMyBotResponse>(`bot/private/${botId}`);
    },
    getBotSummary: (botId: string) => {
      return http.getOnce<GetBotSummaryResponse>(`bot/summary/${botId}`);
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
    getPresignedUrl: (botId: string, filename: string) => {
      return http.getOnce<GetPresignedUrlResponse>(
        `bot/${botId}/presigned-url`,
        {
          filename,
        }
      );
    },
    uploadFile: (presignedUrl: string, file: File) => {
      // presignedURL contains credential.
      return axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (e) => {
          console.log(e.progress, e.estimated, e.total, e.bytes);
        },
      });
    },
    deleteUploadedFile: (botId: string, filename: string) => {
      return http.delete(`bot/${botId}/uploaded-file`, {
        filename,
      });
    },
  };
};

export default useBotApi;
