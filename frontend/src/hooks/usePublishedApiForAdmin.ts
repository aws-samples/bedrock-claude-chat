import usePublicBotsForAdmin from './usePublicBotsForAdmin';

const usePublishedApiForAdmin = () => {
  const { publicBots } = usePublicBotsForAdmin({});

  return {
    publishedApis: publicBots ?? [],
  };
};

export default usePublishedApiForAdmin;
