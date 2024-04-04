import { produce } from 'immer';
import useConversationApi from './useConversationApi';

const useConversation = () => {
  const conversationApi = useConversationApi();

  const { data: conversations } = conversationApi.getConversations();
  const mutate = conversationApi.mutateConversations;

  return {
    conversations,
    syncConversations: () => {
      return mutate(conversations);
    },
    getTitle: (conversationId: string) => {
      return (
        conversations?.find((c) => c.id === conversationId)?.title ?? 'New Chat'
      );
    },
    getBotId: (conversationId: string) => {
      return conversations?.find((c) => c.id === conversationId)?.botId ?? null;
    },
    deleteConversation: (conversationId: string) => {
      return mutate(async (current) => {
        await conversationApi.deleteConversation(conversationId);

        return produce(current, (draft) => {
          const index = draft?.findIndex((c) => c.id === conversationId) ?? -1;
          if (index > -1) {
            draft?.splice(index, 1);
          }
        });
      });
    },
    clearConversations: () => {
      return mutate(async () => {
        await conversationApi.clearConversations();
        return [];
      });
    },
    updateTitle: (conversationId: string, title: string) => {
      return mutate(async (current) => {
        await conversationApi.updateTitle(conversationId, title);

        return produce(current, (draft) => {
          const index = draft?.findIndex((c) => c.id === conversationId) ?? -1;
          if (index > -1) {
            draft?.splice(index, 1, {
              ...draft![index],
              title: title,
            });
          }
        });
      });
    },
  };
};

export default useConversation;
