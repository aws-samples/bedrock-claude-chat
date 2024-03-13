import {
  BotPublicationQuota,
  BotPublicationThrottle,
} from '../@types/api-publication';
import useBotApi from './useBotApi';
import useBotPublication from './useBotPublication';
import useBotPublicationApi from './useBotPublicationApi';

const useBotApiSettings = (botId: string) => {
  const { getMyBot, updateBotVisibility } = useBotApi();
  const {
    data: myBot,
    isLoading: isLoadingMyBot,
    mutate: mutateMyBot,
  } = getMyBot(botId);
  const { botPublication, isLoading: isLoadingBotPublication } =
    useBotPublication(botId);

  const { publishBot } = useBotPublicationApi();

  return {
    myBot,
    isLoadingMyBot,
    botPublication,
    isLoadingBotPublication,
    shareBot: () => {
      return updateBotVisibility(botId, {
        toPublic: true,
      }).then(() => {
        return mutateMyBot();
      });
    },
    publishBot: (params: {
      quota?: BotPublicationQuota;
      throttle?: BotPublicationThrottle;
      allowedOrigins: string[];
    }) => {
      return publishBot(botId, {
        stage: 'api',
        ...params,
      });
    },
  };
};

export default useBotApiSettings;
