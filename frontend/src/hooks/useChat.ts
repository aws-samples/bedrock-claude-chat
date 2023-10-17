import { useCallback, useEffect, useMemo } from 'react';
import useConversationApi from './useConversationApi';
import { produce } from 'immer';
import {
  MessageContent,
  MessageContentWithChildren,
  MessageMap,
  PostMessageRequest,
} from '../@types/conversation';
import useConversation from './useConversation';
import { create } from 'zustand';
import usePostMessageStreaming from './usePostMessageStreaming';
import useSnackbar from './useSnackbar';
import { useNavigate } from 'react-router-dom';
import { ulid } from 'ulid';
import { convertMessageMapToArray } from '../utils/MessageUtils';

type ChatStateType = {
  [id: string]: MessageMap;
};

const NEW_MESSAGE_ID = {
  USER: 'new-message',
  ASSISTANT: 'new-message-assistant',
};

const useChatState = create<{
  conversationId: string;
  setConversationId: (s: string) => void;
  postingMessage: boolean;
  setPostingMessage: (b: boolean) => void;
  chats: ChatStateType;
  setMessages: (id: string, messageMap: MessageMap) => void;
  copyMessages: (fromId: string, toId: string) => void;
  pushMessage: (
    id: string,
    parentMessageId: string | null,
    currentMessageId: string,
    content: MessageContent
  ) => void;
  removeMessage: (id: string, messageId: string) => void;
  editMessage: (id: string, messageId: string, content: string) => void;
  getMessages: (
    id: string,
    currentMessageId: string
  ) => MessageContentWithChildren[];
  currentMessageId: string;
  setCurrentMessageId: (s: string) => void;
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
    setMessages: (id: string, messageMap: MessageMap) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          draft[id] = messageMap;
        }),
      }));
    },
    copyMessages: (fromId: string, toId: string) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          draft[toId] = JSON.parse(JSON.stringify(draft[fromId]));
        }),
      }));
    },
    pushMessage: (
      id: string,
      parentMessageId: string | null,
      currentMessageId: string,
      content: MessageContent
    ) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          if (draft[id] && parentMessageId) {
            draft[id][parentMessageId] = {
              ...draft[id][parentMessageId],
              children: [
                ...draft[id][parentMessageId].children,
                currentMessageId,
              ],
            };
            draft[id][currentMessageId] = {
              ...content,
              parent: parentMessageId,
              children: [],
            };
          } else {
            draft[id] = {
              [currentMessageId]: {
                ...content,
                children: [],
                parent: null,
              },
            };
          }
        }),
      }));
    },
    editMessage: (id: string, messageId: string, content: string) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          draft[id][messageId].content.body = content;
        }),
      }));
    },
    removeMessage: (id: string, messageId: string) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          const childrenIds = [...draft[id][messageId].children];
          while (childrenIds.length > 0) {
            const targetId = childrenIds.pop()!;
            childrenIds.push(...draft[id][targetId].children);
            delete draft[id][targetId];
          }

          Object.keys(draft[id]).forEach((key) => {
            const idx = draft[id][key].children.findIndex(
              (c) => c === messageId
            );
            if (idx > -1) {
              draft[id][key].children.splice(idx, 1);
            }
          });
          delete draft[id][messageId];
        }),
      }));
    },
    getMessages: (id: string, currentMessageId: string) => {
      return convertMessageMapToArray(get().chats[id] ?? {}, currentMessageId);
    },
    currentMessageId: '',
    setCurrentMessageId: (s: string) => {
      set(() => ({
        currentMessageId: s,
      }));
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
    editMessage,
    copyMessages,
    removeMessage,
    getMessages,
    currentMessageId,
    setCurrentMessageId,
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
    return getMessages(conversationId, currentMessageId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, chats, currentMessageId]);

  const newChat = useCallback(() => {
    setConversationId('');
    setMessages('', {});
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
      setMessages(conversationId, data.messageMap);
      setCurrentMessageId(data.lastMessageId);
    }
  }, [conversationId, data, setCurrentMessageId, setMessages]);

  useEffect(() => {
    setIsGeneratedTitle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // 画面に即時反映させるために、Stateを更新する処理
  const pushNewMessage = (
    parentMessageId: string | null,
    messageContent: MessageContent
  ) => {
    pushMessage(
      conversationId ?? '',
      parentMessageId,
      NEW_MESSAGE_ID.USER,
      messageContent
    );
    pushMessage(
      conversationId ?? '',
      NEW_MESSAGE_ID.USER,
      NEW_MESSAGE_ID.ASSISTANT,
      {
        role: 'assistant',
        content: {
          contentType: 'text',
          body: '',
        },
        model: 'claude',
      }
    );
  };

  const postChat = (content: string) => {
    const isNewChat = conversationId ? false : true;
    const newConversationId = ulid();

    // エラーリトライ時に同期が間に合わないため、Stateを直接参照
    const tmpMessages = convertMessageMapToArray(
      useChatState.getState().chats[conversationId] ?? {},
      currentMessageId
    );

    const parentMessageId = isNewChat
      ? null
      : tmpMessages[tmpMessages.length - 1].id;
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
      message: {
        ...messageContent,
        parentMessageId: parentMessageId,
      },
      stream: true,
    };

    setPostingMessage(true);
    setHasError(false);

    // 画面に即時反映するために、Stateを更新する
    pushNewMessage(parentMessageId, messageContent);

    postStreaming(input, (c: string) => {
      editMessage(conversationId ?? '', NEW_MESSAGE_ID.ASSISTANT, c);
    })
      .then(() => {
        // 新規チャットの場合の処理
        if (isNewChat) {
          setConversationId(newConversationId);
          // 画面のチラつき防止のために、Stateをコピーする
          copyMessages('', newConversationId);

          conversationApi
            .updateTitleWithGeneratedTitle(newConversationId)
            .finally(() => {
              syncConversations().then(() => {
                setIsGeneratedTitle(true);
              });
            });
        } else {
          mutate();
        }
      })
      .catch((e) => {
        console.error(e);
        setHasError(true);
        removeMessage(
          isNewChat ? newConversationId : conversationId,
          NEW_MESSAGE_ID.ASSISTANT
        );
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
    postingMessage: postingMessage || loadingConversation,
    isGeneratedTitle,
    setIsGeneratedTitle,
    newChat,
    messages,
    setCurrentMessageId,
    postChat,

    // 最新の回答を再生成
    regenerate: (content?: string) => {
      const parentMessage = produce(messages[messages.length - 2], (draft) => {
        if (content) {
          draft.content.body = content;
        }
      });

      const input: PostMessageRequest = {
        conversationId: conversationId,
        message: {
          ...parentMessage,
          parentMessageId: parentMessage.parent,
        },
        stream: true,
      };

      setPostingMessage(true);
      setHasError(false);

      // 画面に即時反映するために、Stateを更新する
      pushNewMessage(parentMessage.parent, parentMessage);

      setCurrentMessageId(NEW_MESSAGE_ID.ASSISTANT);

      postStreaming(input, (c: string) => {
        editMessage(conversationId, NEW_MESSAGE_ID.ASSISTANT, c);
      })
        .then(() => {
          mutate();
        })
        .catch((e) => {
          console.error(e);
          setHasError(true);
          setCurrentMessageId(NEW_MESSAGE_ID.USER);
          removeMessage(conversationId, NEW_MESSAGE_ID.ASSISTANT);
        })
        .finally(() => {
          setPostingMessage(false);
        });
    },

    // エラーのリトライ
    retryPostChat: () => {
      if (messages.length === 0) {
        return;
      }
      // FIXME: 推論履歴がある場合の処理
      // エラー発生時の最新のメッセージはユーザ入力
      const lastMessage = messages[messages.length - 1];
      removeMessage(conversationId, lastMessage.id);
      postChat(lastMessage.content.body);
    },
  };
};

export default useChat;
