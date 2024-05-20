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
import { useTranslation } from 'react-i18next';
import '../i18n';


const useConversationApi = () => {
  const http = useHttp();
  const { mutate } = useSWRConfig();


  const { i18n } = useTranslation();
  const currentLanguage = i18n.language

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
    updateTitleWithGeneratedTitle: async (conversationId: string, language: string = "en") => {
      
      language = currentLanguage.toLowerCase();

      const res = await http.getOnce<{
        title: string;
      }>(`conversation/${conversationId}/proposed-title/${language}`);
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
