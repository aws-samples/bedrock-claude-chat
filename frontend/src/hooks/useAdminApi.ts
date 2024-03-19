import {
  ListBotApisRequest,
  ListBotApisResponse,
  ListPublicBotsRequest,
  ListPublicBotsResponse,
} from '../@types/api-publication';
import useHttp from './useHttp';

const useAdminApi = () => {
  const http = useHttp();

  return {
    listBotApis: (req: ListBotApisRequest) => {
      return http.get<ListBotApisResponse>(['/admin/published-bots', req]);
    },
    listPublicBots: (req: ListPublicBotsRequest) => {
      return http.get<ListPublicBotsResponse>(['/admin/public-bots', req]);
    },
  };
};

export default useAdminApi;
