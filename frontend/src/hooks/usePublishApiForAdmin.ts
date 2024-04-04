import useAdminApi from './useAdminApi';

const usePublishApiForAdmin = () => {
  const { listBotApis } = useAdminApi();
  const { data: botApis, isLoading } = listBotApis({});

  return {
    botApis: botApis?.bots ?? [],
    isLoading,
  };
};

export default usePublishApiForAdmin;
