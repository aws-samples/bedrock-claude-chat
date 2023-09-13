import { useEffect, useMemo } from "react";
import useConversationApi from "./useConversationApi";
import { produce } from "immer";
import { MessageContent, PostMessageRequest } from "../@types/conversation";
import useConversation from "./useConversation";
import { useParams } from "react-router-dom";
import { create } from "zustand";

type ChatStateType = {
  [id: string]: MessageContent[];
};

const useChatState = create<{
  conversationId: string;
  setConversationId: (s: string) => void;
  postingMessage: boolean;
  setPostingMessage: (b: boolean) => void;
  chats: ChatStateType;
  setMessages: (id: string, messages: MessageContent[]) => void;
  pushMessage: (id: string, message: MessageContent) => void;
  getMessages: (id: string) => MessageContent[];
  isGeneratedTitle: boolean;
  setIsGeneratedTitle: (b: boolean) => void;
}>((set, get) => {
  return {
    conversationId: "",
    setConversationId: (s) => {
      set(() => ({
        conversationId: s,
      }));
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
    getMessages: (id: string) => {
      return get().chats[id] ? get().chats[id] : [];
    },
    isGeneratedTitle: false,
    setIsGeneratedTitle: (b: boolean) => {
      set(() => ({
        isGeneratedTitle: b,
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
    getMessages,
    isGeneratedTitle,
    setIsGeneratedTitle,
  } = useChatState();

  const { conversationId: paramConversationId } = useParams();

  useEffect(() => {
    setConversationId(paramConversationId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramConversationId]);

  const conversationApi = useConversationApi();
  const {
    data,
    mutate,
    isLoading: loadingConversation,
  } = conversationApi.getConversation(conversationId);
  const { syncConversations } = useConversation();

  const messages = useMemo(() => {
    return chats[conversationId] ?? [];
  }, [conversationId, chats]);

  useEffect(() => {
    if (conversationId && data?.id === conversationId) {
      setMessages(conversationId, data ? data.messages : []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, data]);

  useEffect(() => {
    setIsGeneratedTitle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return {
    conversationId,
    loadingConversation,
    postingMessage,
    isGeneratedTitle,
    setIsGeneratedTitle,
    newChat: () => {
      setConversationId("");
      setMessages("", []);
    },
    messages,
    postChat: (content: string) => {
      const messageContent: MessageContent = {
        content: {
          body: content,
          contentType: "text",
        },
        model: "claude",
        role: "user",
      };
      const input: PostMessageRequest = {
        conversationId: conversationId ?? undefined,
        message: messageContent,
        stream: false,
      };

      setPostingMessage(true);

      pushMessage(conversationId ?? "", messageContent);

      conversationApi
        .postMessage(input)
        .then((res) => {
          pushMessage(conversationId ?? "", res.data.message);
          // 新規チャットの場合の処理
          if (!conversationId) {
            conversationApi
              .updateTitleWithGeneratedTitle(res.data.conversationId)
              .finally(() => {
                syncConversations().then(() => {
                  setConversationId(res.data.conversationId);
                  setMessages(res.data.conversationId, getMessages(""));
                  setIsGeneratedTitle(true);
                });
              });
          } else {
            mutate();
          }
        })
        .finally(() => {
          setPostingMessage(false);
        });
    },
  };
};

export default useChat;
