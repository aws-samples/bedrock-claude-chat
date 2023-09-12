import React, { useCallback, useEffect, useState } from "react";
import InputChatContent from "../components/InputChatContent";
import useChat from "../hooks/useChat";
import ChatMessage from "../components/ChatMessage";
import useScroll from "../hooks/useScroll";
import { useParams } from "react-router-dom";

const ChatPage: React.FC = () => {
  const [content, setContent] = useState("");
  const { conversationId } = useParams();
  const { loading, postChat, messages } = useChat(conversationId);
  const { scrollToBottom, scrollToTop } = useScroll();

  const onSend = useCallback(() => {
    postChat(content);
    setContent("");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    } else {
      scrollToTop();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <>
      <div className="pb-24">
        {messages.length === 0 && (
          <>
            <div className="mx-3 my-32 flex items-center justify-center text-4xl font-bold text-gray-500/20">
              Bedrock Claude Chat
            </div>
          </>
        )}
        {messages.map((message, idx) => (
          <div key={idx}>
            <ChatMessage chatContent={message} />
            <div className="w-full border"></div>
          </div>
        ))}
        {loading && <ChatMessage loading />}
      </div>

      <div className="absolute bottom-0 z-0 flex w-full justify-center">
        <InputChatContent
          content={content}
          disabled={loading}
          onChangeContent={setContent}
          onSend={() => {
            onSend();
          }}
        />
      </div>
    </>
  );
};

export default ChatPage;
