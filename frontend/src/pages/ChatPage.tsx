import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InputChatContent from '../components/InputChatContent';
import useChat from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import useScroll from '../hooks/useScroll';
import { useParams } from 'react-router-dom';
import { PiArrowsCounterClockwise, PiWarningCircleFill } from 'react-icons/pi';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import SwitchBedrockModel from '../components/SwitchBedrockModel';
import { Model } from '../@types/conversation';
import useBot from '../hooks/useBot';
import useConversation from '../hooks/useConversation';
import { AxiosError } from 'axios';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();

  const [content, setContent] = useState('');
  const [model, setModel] = useState<Model>('claude-instant-v1');
  const {
    postingMessage,
    postChat,
    messages,
    conversationId,
    setConversationId,
    hasError,
    retryPostChat,
    setCurrentMessageId,
    regenerate,
    getPostedModel,
  } = useChat();

  const { getBotId } = useConversation();
  const { getBot } = useBot();

  const { scrollToBottom, scrollToTop } = useScroll();

  const { conversationId: paramConversationId, botId: paramBotId } =
    useParams();

  const botId = useMemo(() => {
    return paramBotId ?? getBotId(conversationId);
  }, [conversationId, getBotId, paramBotId]);

  const [botName, setBotName] = useState('');
  useEffect(() => {
    if (botId) {
      setBotName(t('bot.label.loadingBot'));
      getBot(botId)
        .then((bot) => {
          setBotName(bot.title);
        })
        .catch((err: AxiosError) => {
          if (err.response?.status === 404) {
            setBotName(t('bot.label.notAvailableBot'));
          }
        });
    } else {
      setBotName(t('bot.label.normalChat'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  useEffect(() => {
    setConversationId(paramConversationId ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramConversationId]);

  const onSend = useCallback(() => {
    postChat(content, model, botId ?? undefined);
    setContent('');
  }, [botId, content, model, postChat]);

  const onChangeCurrentMessageId = useCallback(
    (messageId: string) => {
      setCurrentMessageId(messageId);
    },
    [setCurrentMessageId]
  );

  const onSubmitEditedContent = useCallback(
    (messageId: string, content: string) => {
      if (hasError) {
        retryPostChat({ content, botId: botId ?? undefined });
      } else {
        regenerate({ messageId, content });
      }
    },
    [botId, hasError, regenerate, retryPostChat]
  );

  const onRegenerate = useCallback(() => {
    regenerate();
  }, [regenerate]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [messages, scrollToBottom, scrollToTop]);

  return (
    <>
      <div className="relative flex h-14 justify-center">
        <div className="absolute left-3 top-3 font-bold">{botName}</div>
        {getPostedModel() ? (
          <div className="absolute right-3 top-8 text-sm text-gray-500">
            model: {getPostedModel()}
          </div>
        ) : (
          <SwitchBedrockModel
            className="my-auto"
            model={model}
            setModel={setModel}
          />
        )}
      </div>
      <hr className="w-full border-t border-gray-300" />
      <div className="pb-52 lg:pb-40">
        {messages.length === 0 ? (
          <>
            <div className="mx-3 my-32 flex items-center justify-center text-4xl font-bold text-gray-500/20">
              {t('app.name')}
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
                <ChatMessage
                  chatContent={message}
                  onChangeMessageId={onChangeCurrentMessageId}
                  onSubmit={onSubmitEditedContent}
                />
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
              {t('error.answerResponse')}
            </div>

            <Button
              className="mt-2 shadow "
              icon={<PiArrowsCounterClockwise />}
              outlined
              onClick={() => {
                retryPostChat({
                  botId: botId ?? undefined,
                });
              }}>
              {t('button.resend')}
            </Button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 z-0 flex w-full justify-center">
        <InputChatContent
          content={content}
          disabled={postingMessage}
          onChangeContent={setContent}
          onSend={onSend}
          onRegenerate={onRegenerate}
        />
      </div>
    </>
  );
};

export default ChatPage;
