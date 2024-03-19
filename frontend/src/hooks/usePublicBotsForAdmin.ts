import { ListPublicBotsRequest } from '../@types/api-publication';
import useAdminApi from './useAdminApi';

const usePublicBotsForAdmin = (params: ListPublicBotsRequest) => {
  const { listPublicBots } = useAdminApi();

  const { data, isLoading, mutate } = listPublicBots(params);

  return {
    publicBots: data,
    isLoading,
    mutate,
  };
};

export default usePublicBotsForAdmin;
