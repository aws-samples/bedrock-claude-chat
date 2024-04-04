import useBotPublicationApi from './useBotPublicationApi';

const useBotApiKey = (botId: string, apiKey: string) => {
  const { getBotPublicationApiKey, deleteBotPublicationApiKey } =
    useBotPublicationApi();

  const { data, isLoading } = getBotPublicationApiKey(botId, apiKey);

  return {
    botApiKey: data,
    isLoading,
    deleteBotApiKey: () => {
      return deleteBotPublicationApiKey(botId, apiKey);
    },
  };
};

export default useBotApiKey;
