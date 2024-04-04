import useAdminApi from './useAdminApi';
import useBotPublication from './useBotPublication';
import useBotPublicationApi from './useBotPublicationApi';

const useBotApiSettingsForAdmin = (botId: string) => {
  const { getPublicBot } = useAdminApi();
  const { data: bot, isLoading: isLoadingBot } = getPublicBot(botId);

  const {
    botPublication,
    isLoading: isLoadingBotPublication,
    mutate: mutateBotPublication,
  } = useBotPublication(botId);

  const { deleteBotPublication } = useBotPublicationApi();

  return {
    bot,
    isLoadingBot,
    botPublication,
    isLoadingBotPublication,
    mutateBotPublication,
    deleteBotPublication: () => {
      return deleteBotPublication(botId);
    },
  };
};

export default useBotApiSettingsForAdmin;
