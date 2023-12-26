import { useCallback, useEffect, useMemo } from 'react';
import useConversationApi from './useConversationApi';
import { produce } from 'immer';
import {
  MessageContent,
  MessageContentWithChildren,
  MessageMap,
  Model,
  PostMessageRequest,
} from '../@types/conversation';
import useConversation from './useConversation';
import { create } from 'zustand';
import usePostMessageStreaming from './usePostMessageStreaming';
import useSnackbar from './useSnackbar';
import { useNavigate } from 'react-router-dom';
import { ulid } from 'ulid';
import { convertMessageMapToArray } from '../utils/MessageUtils';
import { useTranslation } from 'react-i18next';

type ChatStateType = {
  [id: string]: MessageMap;
};

type BotInputType = {
  botId: string;
  hasKnowledge: boolean;
};

const NEW_MESSAGE_ID = {
  USER: 'new-message',
  ASSISTANT: 'new-message-assistant',
};
const USE_STREAMING: boolean =
  import.meta.env.VITE_APP_USE_STREAMING === 'true';

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
  getPostedModel: () => Model;
}>((set, get) => {
  return {
    conversationId: '',
    setConversationId: (s) => {
      set(() => {
        return {
          conversationId: s,
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
          // 追加対象が子ノードの場合は親ノードに参照情報を追加
          if (draft[id] && parentMessageId && parentMessageId !== 'system') {
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

          // childrenに設定されているノードも全て削除
          while (childrenIds.length > 0) {
            const targetId = childrenIds.pop()!;
            childrenIds.push(...draft[id][targetId].children);
            delete draft[id][targetId];
          }

          // 削除対象のノードを他ノードの参照から削除
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
    getPostedModel: () => {
      return (
        get().chats[get().conversationId]?.system?.model ??
        // 画面に即時反映するためNEW_MESSAGEを評価
        get().chats['']?.[NEW_MESSAGE_ID.ASSISTANT]?.model
      );
    },
  };
});

const useChat = () => {
  const { t } = useTranslation();
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
    getPostedModel,
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
  }, [setConversationId, setMessages]);

  // エラー処理
  useEffect(() => {
    if (error?.response?.status === 404) {
      openSnackbar(t('error.notFoundConversation'));
      navigate('');
      newChat();
    } else if (error) {
      openSnackbar(error?.message ?? '');
    }
  }, [error, navigate, newChat, openSnackbar, t]);

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
        model: messageContent.model,
      }
    );
  };

  const postChat = (content: string, model: Model, bot?: BotInputType) => {
    const isNewChat = conversationId ? false : true;
    const newConversationId = ulid();

    // エラーリトライ時に同期が間に合わないため、Stateを直接参照
    const tmpMessages = convertMessageMapToArray(
      useChatState.getState().chats[conversationId] ?? {},
      currentMessageId
    );

    const parentMessageId = isNewChat
      ? 'system'
      : tmpMessages[tmpMessages.length - 1].id;

    const modelToPost = isNewChat ? model : getPostedModel();

    const messageContent: MessageContent = {
      content: {
        body: content,
        contentType: 'text',
      },
      model: modelToPost,
      role: 'user',
    };
    const input: PostMessageRequest = {
      conversationId: isNewChat ? newConversationId : conversationId,
      message: {
        ...messageContent,
        parentMessageId: parentMessageId,
      },
      stream: true,
      botId: bot?.botId,
    };
    const createNewConversation = () => {
      // 画面のチラつき防止のために、Stateをコピーする
      copyMessages('', newConversationId);

      conversationApi
        .updateTitleWithGeneratedTitle(newConversationId)
        .then(() => {
          setConversationId(newConversationId);
        })
        .finally(() => {
          syncConversations().then(() => {
            setIsGeneratedTitle(true);
          });
        });
    };

    setPostingMessage(true);

    // 画面に即時反映するために、Stateを更新する
    pushNewMessage(parentMessageId, messageContent);

    const postPromise: Promise<void> = new Promise((resolve, reject) => {
      if (USE_STREAMING) {
        postStreaming({
          input,
          hasKnowledge: bot?.hasKnowledge,
          dispatch: (c: string) => {
            editMessage(conversationId ?? '', NEW_MESSAGE_ID.ASSISTANT, c);
          },
        })
          .then(() => {
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        conversationApi
          .postMessage(input)
          .then((res) => {
            editMessage(
              conversationId ?? '',
              NEW_MESSAGE_ID.ASSISTANT,
              res.data.message.content.body
            );
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      }
    });

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
        removeMessage(conversationId ?? '', NEW_MESSAGE_ID.ASSISTANT);
      })
      .finally(() => {
        setPostingMessage(false);
      });
  };

  /**
   * 再生成
   * @param props content: 内容を上書きしたい場合に設定  messageId: 再生成対象のmessageId  botId: ボットの場合は設定する
   */
  const regenerate = (props?: {
    content?: string;
    messageId?: string;
    bot?: BotInputType;
  }) => {
    let index: number = -1;
    // messageIdが指定されている場合は、指定されたメッセージをベースにする
    if (props?.messageId) {
      index = messages.findIndex((m) => m.id === props.messageId);
    }

    // 最新のメッセージがUSERの場合は、エラーとして処理する
    const isRetryError = messages[messages.length - 1].role === 'user';
    // messageIdが指定されていない場合は、最新のメッセージを再生成する
    if (index === -1) {
      index = isRetryError ? messages.length - 1 : messages.length - 2;
    }

    const parentMessage = produce(messages[index], (draft) => {
      if (props?.content) {
        draft.content.body = props.content;
      }
    });

    // Stateを書き換え後の内容に更新
    if (props?.content) {
      editMessage(conversationId, parentMessage.id, props.content);
    }

    const input: PostMessageRequest = {
      conversationId: conversationId,
      message: {
        ...parentMessage,
        parentMessageId: parentMessage.parent,
      },
      stream: true,
      botId: props?.bot?.botId,
    };

    if (input.message.parentMessageId === null) {
      input.message.parentMessageId = 'system';
    }

    setPostingMessage(true);

    // 画面に即時反映するために、Stateを更新する
    if (isRetryError) {
      pushMessage(
        conversationId ?? '',
        parentMessage.id,
        NEW_MESSAGE_ID.ASSISTANT,
        {
          role: 'assistant',
          content: {
            contentType: 'text',
            body: '',
          },
          model: messages[index].model,
        }
      );
    } else {
      pushNewMessage(parentMessage.parent, parentMessage);
    }

    setCurrentMessageId(NEW_MESSAGE_ID.ASSISTANT);

    postStreaming({
      input,
      dispatch: (c: string) => {
        editMessage(conversationId, NEW_MESSAGE_ID.ASSISTANT, c);
      },
    })
      .then(() => {
        mutate();
      })
      .catch((e) => {
        console.error(e);
        setCurrentMessageId(NEW_MESSAGE_ID.USER);
        removeMessage(conversationId, NEW_MESSAGE_ID.ASSISTANT);
      })
      .finally(() => {
        setPostingMessage(false);
      });
  };

  const hasError = useMemo(() => {
    const length_ = messages.length;
    return length_ === 0 ? false : messages[length_ - 1].role === 'user';
  }, [messages]);

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
    regenerate,
    getPostedModel,
    // エラーのリトライ
    retryPostChat: (params: { content?: string; bot?: BotInputType }) => {
      const length_ = messages.length;
      if (length_ === 0) {
        return;
      }
      const latestMessage = messages[length_ - 1];
      if (latestMessage.sibling.length === 1) {
        // 通常のメッセージ送信時
        // エラー発生時の最新のメッセージはユーザ入力;
        removeMessage(conversationId, latestMessage.id);
        postChat(
          params.content ?? latestMessage.content.body,
          getPostedModel(),
          params.bot
            ? {
                botId: params.bot.botId,
                hasKnowledge: params.bot.hasKnowledge,
              }
            : undefined
        );
      } else {
        // 再生成時
        regenerate({
          content: params.content ?? latestMessage.content.body,
          bot: params.bot,
        });
      }
    },
  };
};

export default useChat;
