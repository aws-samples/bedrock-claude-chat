import { ulid } from 'ulid';
import { RegisterBotRequest } from '../@types/bot';
import useBotApi from './useBotApi';
import { produce } from 'immer';

const useBot = () => {
  const api = useBotApi();

  const { data: myBots, mutate: mutateMyBots } = api.bots({
    kind: 'private',
  });

  const { data: mixedBots } = api.bots({
    kind: 'mixed',
    limit: 10,
  });

  return {
    myBots,
    mixedBots,
    registerBot: (params: Omit<RegisterBotRequest, 'id'>) => {
      return api.registerBot({
        id: ulid(),
        ...params,
      });
    },
    updateBotSharing: (botId: string, isShareing: boolean) => {
      return api.updateBotVisibility(botId, {
        toPublic: isShareing,
      });
    },
    deleteBot: (botId: string) => {
      const idx = myBots?.findIndex((bot) => bot.id === botId) ?? -1;
      mutateMyBots(
        produce(myBots, (draft) => {
          draft?.splice(idx, 1);
        }),
        {
          revalidate: false,
        }
      );
      return api.deleteBot(botId).finally(() => {
        mutateMyBots();
      });
    },
  };
};

export default useBot;
