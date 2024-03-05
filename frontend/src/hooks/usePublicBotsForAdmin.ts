import { ListPublicBotsRequest } from '../@types/api-publication';
import useBotPublicationApi from './useBotPublicationApi';

const usePublicBotsForAdmin = (params: ListPublicBotsRequest) => {
  const { listPublicBots } = useBotPublicationApi();

  const { data, isLoading, mutate } = listPublicBots(params);

  return {
    publicBots: data,
    isLoading,
    mutate,
  };
};

export default usePublicBotsForAdmin;
