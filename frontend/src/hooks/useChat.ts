import { useCallback, useEffect, useMemo } from 'react';
import useConversationApi from './useConversationApi';
import { produce } from 'immer';
import { MessageContent, PostMessageRequest } from '../@types/conversation';
import useConversation from './useConversation';

import { create } from 'zustand';
import usePostMessageStreaming from './usePostMessageStreaming';
import useSnackbar from './useSnackbar';
import { useNavigate } from 'react-router-dom';
import { ulid } from 'ulid';

type ChatStateType = {
  [id: string]: MessageContent[];
};
const USE_STREAMING: boolean = import.meta.env.VITE_APP_USE_STREAMING === 'true'

const useChatState = create<{
  conversationId: string;
  setConversationId: (s: string) => void;
  postingMessage: boolean;
  setPostingMessage: (b: boolean) => void;
  chats: ChatStateType;
  setMessages: (id: string, messages: MessageContent[]) => void;
  pushMessage: (id: string, message: MessageContent) => void;
  removeLatestMessage: (id: string) => void;
  editLastMessage: (id: string, content: string) => void;
  getMessages: (id: string) => MessageContent[];
  isGeneratedTitle: boolean;
  setIsGeneratedTitle: (b: boolean) => void;
  hasError: boolean;
  setHasError: (b: boolean) => void;
}>((set, get) => {
  return {
    conversationId: '',
    setConversationId: (s) => {
      set((state) => {
        // 会話IDが変わったらエラー状態を初期化
        const hasError = state.conversationId !== s ? false : state.hasError;

        return {
          conversationId: s,
          hasError,
        };
      });
    },
    postingMessage: false,
    setPostingMessage: (b) => {
      set(() => ({
        postingMessage: b,
      }));
    },
    chats: {},
    setMessages: (id: string, messages: MessageContent[]) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          if (draft[id]) {
            draft[id].splice(0, draft[id].length, ...messages);
          } else {
            draft[id] = [...messages];
          }
        }),
      }));
    },
    pushMessage: (id: string, message: MessageContent) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          if (draft[id]) {
            draft[id].push(message);
          } else {
            draft[id] = [message];
          }
        }),
      }));
    },
    editLastMessage: (id: string, content: string) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          const idx = draft[id].length - 1;
          if (idx >= 0) {
            draft[id][idx].content.body = content;
          }
        }),
      }));
    },
    removeLatestMessage: (id: string) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          if (draft[id]) {
            draft[id].pop();
          }
        }),
      }));
    },
    getMessages: (id: string) => {
      return get().chats[id] ? get().chats[id] : [];
    },
    isGeneratedTitle: false,
    setIsGeneratedTitle: (b: boolean) => {
      set(() => ({
        isGeneratedTitle: b,
      }));
    },
    hasError: false,
    setHasError: (b: boolean) => {
      set(() => ({
        hasError: b,
      }));
    },
  };
});

const useChat = () => {
  const {
    chats,
    conversationId,
    setConversationId,
    postingMessage,
    setPostingMessage,
    setMessages,
    pushMessage,
    editLastMessage,
    removeLatestMessage,
    getMessages,
    isGeneratedTitle,
    setIsGeneratedTitle,
    hasError,
    setHasError,
  } = useChatState();
  const { open: openSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const { post: postStreaming } = usePostMessageStreaming();

  const conversationApi = useConversationApi();
  const {
    data,
    mutate,
    isLoading: loadingConversation,
    error,
  } = conversationApi.getConversation(conversationId);
  const { syncConversations } = useConversation();

  const messages = useMemo(() => {
    return chats[conversationId] ?? [];
  }, [conversationId, chats]);

  const newChat = useCallback(() => {
    setConversationId('');
    setMessages('', []);
    setHasError(false);
  }, [setConversationId, setHasError, setMessages]);

  // エラー処理
  useEffect(() => {
    if (error?.response?.status === 404) {
      openSnackbar(
        '指定のチャットは存在しないため、新規チャット画面を表示しました。'
      );
      navigate('');
      newChat();
    } else if (error) {
      openSnackbar(error?.message ?? '');
    }
  }, [error, navigate, newChat, openSnackbar]);

  useEffect(() => {
    if (conversationId && data?.id === conversationId) {
      setMessages(conversationId, data ? data.messages : []);
    }
  }, [conversationId, data, setMessages]);

  useEffect(() => {
    setIsGeneratedTitle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const postChat = (content: string) => {
    const isNewChat = conversationId ? false : true;
    const newConversationId = ulid();

    const messageContent: MessageContent = {
      content: {
        body: content,
        contentType: 'text',
      },
      model: 'claude',
      role: 'user',
    };
    const input: PostMessageRequest = {
      conversationId: isNewChat ? newConversationId : conversationId,
      message: messageContent,
      stream: true,
    };
    const createNewConversation = () => {
        setConversationId(newConversationId);
        setMessages(newConversationId, getMessages(''));

        conversationApi
          .updateTitleWithGeneratedTitle(newConversationId)
          .finally(() => {
            syncConversations().then(() => {
              setIsGeneratedTitle(true);
            });
          });
        }

    setPostingMessage(true);
    setHasError(false);

    pushMessage(conversationId ?? '', messageContent);
    pushMessage(conversationId ?? '', {
      role: 'assistant',
      content: {
        contentType: 'text',
        body: '',
      },
      model: 'claude',
    });
    const postPromise: Promise<void> = new Promise((resolve) => {
      if (USE_STREAMING) {
        postStreaming(input, (c: string) => {
          editLastMessage(conversationId ?? '', c);
        }).then(() => {
          resolve();
        });
      } else {
        conversationApi.postMessage(input)
      .then((res) => {
        editLastMessage(conversationId ?? '', res.data.message.content.body);
        resolve();
      })
    }})
    postPromise
    .then(() => {
      // 新規チャットの場合の処理
      if (isNewChat) {
        createNewConversation();
      } else {
        mutate();
      }
    })
    .catch((e) => {
      console.error(e);
      setHasError(true);
      removeLatestMessage(isNewChat ? newConversationId : conversationId);
    })
    .finally(() => {
      setPostingMessage(false);
    });
  };

  return {
    hasError,
    setConversationId,
    conversationId,
    loadingConversation,
    postingMessage,
    isGeneratedTitle,
    setIsGeneratedTitle,
    newChat,
    messages,
    postChat,

    // エラーのリトライ
    retryPostChat: () => {
      if (messages.length === 0) {
        return;
      }
      // エラー発生時の最新のメッセージはユーザ入力
      const content = messages[messages.length - 1].content.body;
      removeLatestMessage(conversationId);

      postChat(content);
    },
  };
};

export default useChat;
