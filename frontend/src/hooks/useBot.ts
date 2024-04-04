import { RegisterBotRequest, UpdateBotRequest } from '../@types/bot';
import useBotApi from './useBotApi';
import { produce } from 'immer';

const useBot = (shouldAutoRefreshMyBots?: boolean) => {
  const api = useBotApi();

  const { data: myBots, mutate: mutateMyBots } = api.bots(
    {
      kind: 'private',
    },
    shouldAutoRefreshMyBots
      ? (data) => {
          if (!data) {
            return 0;
          }
          const index = data.findIndex(
            (bot) => bot.syncStatus === 'QUEUED' || bot.syncStatus === 'RUNNING'
          );
          return index > -1 ? 5000 : 0;
        }
      : undefined
  );

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
    getMyBot: async (botId: string) => {
      return (await api.getOnceMyBot(botId)).data;
    },
    registerBot: (params: RegisterBotRequest) => {
      mutateMyBots(
        produce(myBots, (draft) => {
          draft?.unshift({
            id: params.id,
            title: params.title,
            description: params.description ?? '',
            available: true,
            createTime: new Date(),
            lastUsedTime: new Date(),
            isPinned: false,
            isPublic: false,
            owned: true,
            syncStatus: 'QUEUED',
          });
        }),
        {
          revalidate: false,
        }
      );
      return api.registerBot(params).finally(() => {
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
      const idxMybots = myBots?.findIndex((bot) => bot.id === botId) ?? -1;
      mutateMyBots(
        produce(myBots, (draft) => {
          if (draft) {
            draft[idxMybots].isPinned = isStarred;
          }
        }),
        {
          revalidate: false,
        }
      );

      mutateRecentlyUsedBots(
        produce(recentlyUsedBots, (draft) => {
          const idx = draft?.findIndex((bot) => bot.id === botId) ?? -1;
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
              ...myBots[idxMybots],
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
          mutateRecentlyUsedBots();
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
    uploadFile: (
      botId: string,
      file: File,
      onProgress?: (progress: number) => void
    ) => {
      return api.getPresignedUrl(botId, file).then(({ data }) => {
        data.url;
        return api.uploadFile(data.url, file, onProgress);
      });
    },
    deleteUploadedFile: (botId: string, filename: string) => {
      return api.deleteUploadedFile(botId, filename);
    },
  };
};

export default useBot;
