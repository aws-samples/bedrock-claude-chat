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
  const {
    botPublication,
    isLoading: isLoadingBotPublication,
    error,
  } = useBotPublication(botId);

  const { publishBot } = useBotPublicationApi();

  return {
    myBot,
    isLoadingMyBot,
    botPublication,
    isLoadingBotPublication,
    isUnpublishedBot: (
      (error?.response?.data['errors'][0] as string) ?? ''
    ).includes('is not published'),
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
      const { quota, throttle, allowedOrigins } = params;
      return publishBot(botId, {
        stage: 'api',
        allowedOrigins,
        quota: {
          limit: quota?.limit ?? null,
          offset: quota?.offset ?? null,
          period: quota?.period ?? null,
        },
        throttle: {
          burstLimit: throttle?.burstLimit ?? null,
          rateLimit: throttle?.rateLimit ?? null,
        },
      });
    },
  };
};

export default useBotApiSettings;
