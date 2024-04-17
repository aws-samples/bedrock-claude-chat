import { MutatorCallback, useSWRConfig } from 'swr';
import {
  Conversation,
  ConversationMeta,
  GetRelatedDocumentsRequest,
  GetRelatedDocumentsResponse,
  PostMessageRequest,
  PostMessageResponse,
} from '../@types/conversation';
import useHttp from './useHttp';

const useConversationApi = () => {
  const http = useHttp();
  const { mutate } = useSWRConfig();

  const updateTitle = (conversationId: string, title: string) => {
    return http.patch(`conversation/${conversationId}/title`, {
      newTitle: title,
    });
  };

  return {
    getConversations: () => {
      return http.get<ConversationMeta[]>('conversations', {
        keepPreviousData: true,
      });
    },
    getConversation: (conversationId?: string) => {
      return http.get<Conversation>(
        !conversationId ? null : `conversation/${conversationId}`,
        {
          keepPreviousData: true,
        }
      );
    },
    postMessage: (input: PostMessageRequest) => {
      return http.post<PostMessageResponse>('conversation', {
        ...input,
      });
    },
    getRelatedDocuments: (input: GetRelatedDocumentsRequest) => {
      return http.post<GetRelatedDocumentsResponse>(
        'conversation/related-documents',
        {
          ...input,
        }
      );
    },
    deleteConversation: (conversationId: string) => {
      return http.delete(`conversation/${conversationId}`);
    },
    clearConversations: () => {
      return http.delete('conversations');
    },
    updateTitle,
    updateTitleWithGeneratedTitle: async (conversationId: string) => {
      const res = await http.getOnce<{
        title: string;
      }>(`conversation/${conversationId}/proposed-title`);
      return updateTitle(conversationId, res.data.title);
    },
    mutateConversations: (
      conversations?:
        | ConversationMeta[]
        | Promise<ConversationMeta[]>
        | MutatorCallback<ConversationMeta[]>,
      options?: Parameters<typeof mutate>[2]
    ) => {
      return mutate('conversations', conversations, options);
    },
  };
};

export default useConversationApi;
