import { ulid } from 'ulid';
import { RegisterBotRequest, UpdateBotRequest } from '../@types/bot';
import useBotApi from './useBotApi';
import { produce } from 'immer';

const useBot = () => {
  const api = useBotApi();

  const { data: myBots, mutate: mutateMyBots } = api.bots({
    kind: 'private',
  });

  const { data: starredBots, mutate: mutateStarredBots } = api.bots({
    kind: 'mixed',
    pinned: true,
  });

  const { data: recentlyUsedBots, mutate: mutateRecentlyUsedBots } = api.bots({
    kind: 'mixed',
    limit: 30,
  });

  return {
    myBots,
    starredBots: starredBots?.filter((bot) => bot.available),
    recentlyUsedUnsterredBots: recentlyUsedBots?.filter(
      (bot) => !bot.isPinned && bot.available
    ),
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
          const idx = draft?.findIndex((bot) => bot.id === botId) ?? -1;
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
    updateMyBotStarred: (botId: string, isStarred: boolean) => {
      const idx = myBots?.findIndex((bot) => bot.id === botId) ?? -1;
      mutateMyBots(
        produce(myBots, (draft) => {
          if (draft) {
            draft[idx].isPinned = isStarred;
          }
        }),
        {
          revalidate: false,
        }
      );
      mutateStarredBots(
        produce(starredBots, (draft) => {
          if (myBots && isStarred) {
            draft?.unshift({
              ...myBots[idx],
            });
          } else if (!isStarred) {
            const idxStarred =
              draft?.findIndex((bot) => bot.id === botId) ?? -1;
            draft?.splice(idxStarred, 1);
          }
        })
      );

      return api
        .updateBotPinned(botId, {
          pinned: isStarred,
        })
        .finally(() => {
          mutateMyBots();
          mutateStarredBots();
        });
    },
    updateSharedBotStarred: (botId: string, isStarred: boolean) => {
      const idx = recentlyUsedBots?.findIndex((bot) => bot.id === botId) ?? -1;
      mutateRecentlyUsedBots(
        produce(recentlyUsedBots, (draft) => {
          if (draft) {
            draft[idx].isPinned = isStarred;
          }
        }),
        {
          revalidate: false,
        }
      );

      mutateStarredBots(
        produce(starredBots, (draft) => {
          if (recentlyUsedBots && isStarred) {
            draft?.unshift({
              ...recentlyUsedBots[idx],
            });
          } else if (!isStarred) {
            const idxStarred =
              draft?.findIndex((bot) => bot.id === botId) ?? -1;
            draft?.splice(idxStarred, 1);
          }
        })
      );
      return api
        .updateBotPinned(botId, {
          pinned: isStarred,
        })
        .finally(() => {
          mutateRecentlyUsedBots();
          mutateStarredBots();
        });
    },
    deleteMyBot: (botId: string) => {
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
    deleteRecentlyUsedBot: (botId: string) => {
      const idx = recentlyUsedBots?.findIndex((bot) => bot.id === botId) ?? -1;
      mutateRecentlyUsedBots(
        produce(recentlyUsedBots, (draft) => {
          draft?.splice(idx, 1);
        }),
        {
          revalidate: false,
        }
      );
      return api.deleteBot(botId).finally(() => {
        mutateRecentlyUsedBots();
      });
    },
  };
};

export default useBot;
