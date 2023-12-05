import { ulid } from 'ulid';
import { RegisterBotRequest, UpdateBotRequest } from '../@types/bot';
import useBotApi from './useBotApi';
import { produce } from 'immer';

const useBot = () => {
  const api = useBotApi();

  const { data: myBots, mutate: mutateMyBots } = api.bots({
    kind: 'private',
  });

  const { data: starredBots } = api.bots({
    kind: 'mixed',
    pinned: true,
  });

  const { data: recentlyUsedBots } = api.bots({
    kind: 'mixed',
    limit: 30,
  });

  return {
    myBots,
    starredBots,
    recentlyUsedUnsterredBots: recentlyUsedBots?.filter((bot) => !bot.isPinned),
    recentlyUsedSharedBots: recentlyUsedBots?.filter((bot) => !bot.owned),
    getBot: async (botId: string) => {
      return (await api.getBot(botId)).data;
    },
    registerBot: (params: Omit<RegisterBotRequest, 'id'>) => {
      const id = ulid();
      mutateMyBots(
        produce(myBots, (draft) => {
          draft?.unshift({
            id,
            title: params.title,
            description: params.description ?? '',
            available: true,
            createTime: new Date(),
            lastUsedTime: new Date(),
            isPinned: false,
            isPublic: false,
            owned: true,
          });
        }),
        {
          revalidate: false,
        }
      );
      return api
        .registerBot({
          id,
          ...params,
        })
        .finally(() => {
          mutateMyBots();
        });
    },
    updateBot: (botId: string, params: UpdateBotRequest) => {
      mutateMyBots(
        produce(myBots, (draft) => {
          const idx = myBots?.findIndex((bot) => bot.id === botId) ?? -1;
          if (draft) {
            draft[idx].title = params.title;
            draft[idx].description = params.description ?? '';
          }
        }),
        {
          revalidate: false,
        }
      );

      return api.updateBot(botId, params).finally(() => {
        mutateMyBots();
      });
    },
    updateBotSharing: (botId: string, isShareing: boolean) => {
      mutateMyBots(
        produce(myBots, (draft) => {
          const idx = myBots?.findIndex((bot) => bot.id === botId) ?? -1;
          if (draft) {
            draft[idx].isPublic = isShareing;
          }
        }),
        {
          revalidate: false,
        }
      );

      return api
        .updateBotVisibility(botId, {
          toPublic: isShareing,
        })
        .finally(() => {
          mutateMyBots();
        });
    },
    updateBotPinning: (botId: string, isPinned: boolean) => {
      return api.updateBotPinned(botId, {
        pinned: isPinned,
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
