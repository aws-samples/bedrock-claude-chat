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
    bots: (
      req: GetBotsRequest,
      refreshIntervalFunction?: (data?: GetBotsResponse) => number
    ) => {
      return http.get<GetBotsResponse>(['bot', req], {
        refreshInterval: refreshIntervalFunction,
      });
    },
    getOnceMyBot: (botId: string) => {
      return http.getOnce<GetMyBotResponse>(`bot/private/${botId}`);
    },
    getMyBot: (botId?: string) => {
      return http.get<GetMyBotResponse>(botId ? `bot/private/${botId}` : null);
    },
    botSummary: (botId?: string) => {
      return http.get<GetBotSummaryResponse>(
        botId ? `bot/summary/${botId}` : null,
        {
          refreshInterval: (data?: GetBotSummaryResponse) => {
            if (
              data?.syncStatus === 'QUEUED' ||
              data?.syncStatus === 'RUNNING'
            ) {
              return 5000;
            }
            return 0;
          },
        }
      );
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
    getPresignedUrl: (botId: string, file: File) => {
      return http.getOnce<GetPresignedUrlResponse>(
        `bot/${botId}/presigned-url`,
        {
          filename: file.name,
          contentType: file.type,
        }
      );
    },
    uploadFile: (
      presignedUrl: string,
      file: File,
      onProgress?: (progress: number) => void
    ) => {
      // presignedURL contains credential.
      return axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (e) => {
          onProgress ? onProgress(Math.floor((e.progress ?? 0) * 100)) : null;
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
