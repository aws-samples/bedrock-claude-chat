import useBotPublicationApi from './useBotPublicationApi';

const useBotPublicationForAdmin = (botId: string, ownerUserId: string) => {
  const { getBotPublication, deleteBotPublication } = useBotPublicationApi();

  const { data, isLoading } = getBotPublication(botId, {
    ownerUserId,
  });

  return {
    botPublication: data,
    isLoading,
    deleteBotPublication: () => {
      return deleteBotPublication(botId, {
        ownerUserId,
      });
    },
  };
};

export default useBotPublicationForAdmin;
