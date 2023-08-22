import { useEffect, useMemo, useState } from "react";
import useConversationApi from "./useConversationApi";
import { produce } from "immer";
import {
  Conversation,
  MessageContent,
  PostMessageRequest,
} from "../@types/conversation";
import useConversation from "./useConversation";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";

const useChatState = create<{
  isGeneratedTitle: boolean;
  setIsGeneratedTitle: (b: boolean) => void;
}>((set) => {
  return {
    isGeneratedTitle: false,
    setIsGeneratedTitle: (b: boolean) => {
      set(() => ({
        isGeneratedTitle: b,
      }));
    },
  };
});

const useChat = (id?: string) => {
  const [isGeneratedTitle, setIsGeneratedTitle] = useChatState((state) => [
    state.isGeneratedTitle,
    state.setIsGeneratedTitle,
  ]);

  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(id);
  const [loading, setLoading] = useState(false);

  const conversationApi = useConversationApi();
  const { data, mutate } = conversationApi.getConversation(conversationId);
  const { syncConversations } = useConversation();

  const [initialContent, setInitialContent] = useState<Conversation>();

  useEffect(() => {
    setConversationId(id);

    if (!id) {
      const INIT_CONTENT = {
        id: "",
        createTime: 0,
        messages: [],
        title: "",
      };

      mutate(INIT_CONTENT, {
        revalidate: false,
      });
      setInitialContent(INIT_CONTENT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setIsGeneratedTitle(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const isEmpty = useMemo(() => {
    return (data?.messages.length ?? 0) === 0;
  }, [data]);

  const chats = useMemo<MessageContent[]>(() => {
    if (isEmpty && initialContent) {
      return initialContent.messages;
    }

    return data?.messages.filter((chat) => chat.role !== "system") ?? [];
  }, [data, initialContent, isEmpty]);

  return {
    loading,
    isGeneratedTitle,
    setIsGeneratedTitle,
    chats,
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

      setLoading(true);

      if (!isEmpty) {
        mutate(
          produce(data, (draft) => {
            draft?.messages.push({
              ...input.message,
            });
          }),
          {
            revalidate: false,
          }
        );
      } else {
        setInitialContent({
          id: "",
          createTime: 0,
          title: "",
          messages: [messageContent],
        });
      }

      conversationApi
        .postMessage(input)
        .then((res) => {
          // 新規チャットの場合の処理
          if (isEmpty) {
            conversationApi
              .updateTitleWithGeneratedTitle(res.data.conversationId)
              .finally(() => {
                syncConversations().then(() => {
                  navigate("/" + res.data.conversationId);
                  setIsGeneratedTitle(true);
                });
              });
            setConversationId(res.data.conversationId);
          } else {
            mutate(
              produce(data, (draft) => {
                draft?.messages.push({
                  ...input.message,
                });
                draft?.messages.push({
                  ...res.data.message,
                });
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
  };
};

export default useChat;
