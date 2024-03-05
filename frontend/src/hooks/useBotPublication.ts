import { PublishBotRequest } from '../@types/api-publication';
import useBotPublicationApi from './useBotPublicationApi';

const useBotPublication = (botId: string) => {
  const {
    getBotPublication,
    deleteBotPublication,
    publishBot,
    createBotPublicationApiKey,
  } = useBotPublicationApi();

  const { data, isLoading } = getBotPublication(botId);

  return {
    botPublication: data,
    isLoading,
    deleteBotPublication: () => {
      return deleteBotPublication(botId);
    },
    publishBot: (params: PublishBotRequest) => {
      return publishBot(botId, params);
    },
    createApiKey: () => {
      return createBotPublicationApiKey(botId);
    },
  };
};

export default useBotPublication;
