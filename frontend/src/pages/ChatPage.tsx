import React, { useCallback, useEffect, useState } from 'react';
import InputChatContent from '../components/InputChatContent';
import useChat from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import useScroll from '../hooks/useScroll';
import { useParams } from 'react-router-dom';
import { PiArrowsCounterClockwise, PiWarningCircleFill } from 'react-icons/pi';
import Button from '../components/Button';

const ChatPage: React.FC = () => {
  const [content, setContent] = useState('');
  const {
    postingMessage,
    postChat,
    messages,
    setConversationId,
    hasError,
    retryPostChat,
  } = useChat();
  const { scrollToBottom, scrollToTop } = useScroll();

  const { conversationId: paramConversationId } = useParams();

  useEffect(() => {
    setConversationId(paramConversationId ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramConversationId]);

  const onSend = useCallback(() => {
    postChat(content);
    setContent('');
  }, [content, postChat]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [messages, scrollToBottom, scrollToTop]);

  return (
    <>
      <div className="pb-24">
        {messages.length === 0 ? (
          <>
            <div className="mx-3 my-32 flex items-center justify-center text-4xl font-bold text-gray-500/20">
              Bedrock Claude Chat
            </div>
          </>
        ) : (
          messages.map((message, idx) =>
            message.content.body !== '' ? (
              <div
                key={idx}
                className={`${
                  message.role === 'assistant' ? 'bg-aws-squid-ink/5' : ''
                }`}>
                <ChatMessage chatContent={message} />
                <div className="w-full border-b border-aws-squid-ink/10"></div>
              </div>
            ) : (
              <ChatMessage key={idx} loading />
            )
          )
        )}
        {hasError && (
          <div className="mb-12 mt-2 flex flex-col items-center">
            <div className="flex items-center font-bold text-red-500">
              <PiWarningCircleFill className="mr-1 text-2xl" />
              回答中にエラーが発生しました。
            </div>

            <Button
              className="mt-2 border-gray-400 bg-white shadow "
              icon={<PiArrowsCounterClockwise />}
              onClick={retryPostChat}>
              再実行
            </Button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 z-0 flex w-full justify-center">
        <InputChatContent
          content={content}
          disabled={postingMessage}
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
