import { useEffect } from "react";
import useConversationApi from "./useConversationApi";
import { produce } from "immer";
import { MessageContent, PostMessageRequest } from "../@types/conversation";
import useConversation from "./useConversation";
import { useNavigate, useParams } from "react-router-dom";
import { create } from "zustand";

type ChatStateType = {
  [id: string]: MessageContent[];
};

const useChatState = create<{
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
          draft[id] = messages;
        }),
      }));
    },
    pushMessage: (id: string, message: MessageContent) => {
      set((state) => ({
        chats: produce(state.chats, (draft) => {
          draft[id].push(message);
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
    postingMessage,
    setPostingMessage,
    setMessages,
    pushMessage,
    getMessages,
    isGeneratedTitle,
    setIsGeneratedTitle,
  } = useChatState();

  const navigate = useNavigate();
  const { conversationId } = useParams();

  const conversationApi = useConversationApi();
  const {
    data,
    mutate,
    isLoading: loadingConversation,
  } = conversationApi.getConversation(conversationId);
  const { syncConversations } = useConversation();

  useEffect(() => {
    if (conversationId) {
      setMessages(conversationId ?? "", data ? data.messages : []);
    } else {
      setMessages("", []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loadingConversation, conversationId]);

  useEffect(() => {
    setIsGeneratedTitle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return {
    postingMessage,
    isGeneratedTitle,
    setIsGeneratedTitle,
    messages: getMessages(conversationId ?? ""),
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
                  navigate("/" + res.data.conversationId);
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
