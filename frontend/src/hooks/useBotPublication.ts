import useBotPublicationApi from './useBotPublicationApi';

const useBotPublication = (botId: string) => {
  const { getBotPublication } = useBotPublicationApi();

  const { data, isLoading, error, mutate } = getBotPublication(botId);

  return {
    botPublication: data,
    isLoading,
    error,
    mutate,
  };
};

export default useBotPublication;
