import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InputChatContent from '../components/InputChatContent';
import useChat from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import useScroll from '../hooks/useScroll';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PiArrowsCounterClockwise,
  PiLink,
  PiPencilLine,
  PiStar,
  PiStarFill,
  PiWarningCircleFill,
} from 'react-icons/pi';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import SwitchBedrockModel from '../components/SwitchBedrockModel';
import { Model } from '../@types/conversation';
import useBot from '../hooks/useBot';
import useConversation from '../hooks/useConversation';
import { AxiosError } from 'axios';
import ButtonPopover from '../components/PopoverMenu';
import PopoverItem from '../components/PopoverItem';

import { copyBotUrl } from '../utils/BotUtils';
import { produce } from 'immer';
import ButtonIcon from '../components/ButtonIcon';
import { BotMeta } from '../@types/bot';
import StatusSyncBot from '../components/StatusSyncBot';
import Alert from '../components/Alert';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
    loadingConversation,
  } = useChat();

  const { getBotId } = useConversation();
  const { getBotSummary } = useBot();

  const { scrollToBottom, scrollToTop } = useScroll();

  const { conversationId: paramConversationId, botId: paramBotId } =
    useParams();

  const botId = useMemo(() => {
    return paramBotId ?? getBotId(conversationId);
  }, [conversationId, getBotId, paramBotId]);

  const [pageTitle, setPageTitle] = useState('');
  const [bot, setBot] = useState<BotMeta>();
  const [isAvailabilityBot, setIsAvailabilityBot] = useState(false);
  const [isLoadingBot, setIsLoadingBot] = useState(false);
  useEffect(() => {
    setIsAvailabilityBot(false);
    if (botId) {
      setPageTitle(t('bot.label.loadingBot'));
      setBot(undefined);
      setIsLoadingBot(true);
      getBotSummary(botId)
        .then((bot) => {
          setIsAvailabilityBot(true);
          setPageTitle(bot.title);
          setBot(bot);
        })
        .catch((err: AxiosError) => {
          if (err.response?.status === 404) {
            setPageTitle(t('bot.label.notAvailableBot'));
            setBot(undefined);
          }
        })
        .finally(() => {
          setIsLoadingBot(false);
        });
    } else {
      setPageTitle(t('bot.label.normalChat'));
      setBot(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  const description = useMemo<string>(() => {
    if (!bot) {
      return '';
    } else if (bot.description === '') {
      return t('bot.label.noDescription');
    } else {
      return bot.description;
    }
  }, [bot, t]);

  const disabledInput = useMemo(() => {
    return botId !== null && !isAvailabilityBot && !isLoadingBot;
  }, [botId, isAvailabilityBot, isLoadingBot]);

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
        regenerate({ messageId, content, botId: botId ?? undefined });
      }
    },
    [botId, hasError, regenerate, retryPostChat]
  );

  const onRegenerate = useCallback(() => {
    regenerate({
      botId: botId ?? undefined,
    });
  }, [botId, regenerate]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [messages, scrollToBottom, scrollToTop]);

  const { updateMyBotStarred, updateSharedBotStarred } = useBot();
  const onClickBotEdit = useCallback(
    (botId: string) => {
      navigate(`/bot/edit/${botId}`);
    },
    [navigate]
  );

  const onClickStar = useCallback(() => {
    if (!bot) {
      return;
    }
    const isStarred = !bot.isPinned;
    setBot(
      produce(bot, (draft) => {
        draft.isPinned = isStarred;
      })
    );

    try {
      if (bot.owned) {
        updateMyBotStarred(bot.id, isStarred);
      } else {
        updateSharedBotStarred(bot.id, isStarred);
      }
    } catch {
      setBot(
        produce(bot, (draft) => {
          if (draft) {
            draft.isPinned = !isStarred;
          }
        })
      );
    }
  }, [bot, updateMyBotStarred, updateSharedBotStarred]);

  const [copyLabel, setCopyLabel] = useState(t('bot.titleSubmenu.copyLink'));
  const onClickCopyUrl = useCallback(
    (botId: string) => {
      copyBotUrl(botId);
      setCopyLabel(t('bot.titleSubmenu.copiedLink'));
      setTimeout(() => {
        setCopyLabel(t('bot.titleSubmenu.copyLink'));
      }, 3000);
    },
    [t]
  );

  return (
    <>
      <div className="relative h-14 w-full">
        <div className="flex w-full justify-between">
          <div className="p-2">
            <div className="mr-10 font-bold">{pageTitle}</div>
            <div className="text-xs font-thin text-dark-gray">
              {description}
            </div>
          </div>

          {isAvailabilityBot && (
            <div className="absolute right-0 flex h-full items-center">
              <div className="h-full w-5 bg-gradient-to-r from-transparent to-aws-paper"></div>
              <div className="flex items-center bg-aws-paper">
                {bot?.owned && <StatusSyncBot syncStatus={bot.syncStatus} />}
                <ButtonIcon onClick={onClickStar}>
                  {bot?.isPinned ? (
                    <PiStarFill className="text-aws-aqua" />
                  ) : (
                    <PiStar />
                  )}
                </ButtonIcon>
                <ButtonPopover className="mx-1" target="bottom-right">
                  {bot?.owned && (
                    <PopoverItem
                      onClick={() => {
                        if (bot) {
                          onClickBotEdit(bot.id);
                        }
                      }}>
                      <PiPencilLine />
                      {t('bot.titleSubmenu.edit')}
                    </PopoverItem>
                  )}
                  {bot?.isPublic && (
                    <PopoverItem
                      onClick={() => {
                        if (bot) {
                          onClickCopyUrl(bot.id);
                        }
                      }}>
                      <PiLink />
                      {copyLabel}
                    </PopoverItem>
                  )}
                </ButtonPopover>
              </div>
            </div>
          )}
        </div>
        {getPostedModel() && (
          <div className="absolute right-3 top-8 text-sm text-dark-gray">
            model: {getPostedModel()}
          </div>
        )}
      </div>
      <hr className="w-full border-t border-gray" />
      <div className="pb-52 lg:pb-40">
        {messages.length === 0 ? (
          <div className="relative flex w-full justify-center">
            {!loadingConversation && (
              <SwitchBedrockModel
                className="mt-3 w-min"
                model={model}
                setModel={setModel}
              />
            )}
            <div className="absolute mx-3 my-20 flex items-center justify-center text-4xl font-bold text-gray">
              {t('app.name')}
            </div>
          </div>
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
            <div className="flex items-center font-bold text-red">
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

      <div className="absolute bottom-0 z-0 flex w-full flex-col items-center justify-center">
        {bot && bot.syncStatus !== 'SUCCEEDED' && (
          <div className="mb-8 w-1/2">
            <Alert>{t('bot.alert.sync.incomplete')}</Alert>
          </div>
        )}
        <InputChatContent
          content={content}
          disabledSend={postingMessage}
          disabled={disabledInput}
          placeholder={
            disabledInput
              ? t('bot.label.notAvailableBotInputMessage')
              : undefined
          }
          onChangeContent={setContent}
          onSend={onSend}
          onRegenerate={onRegenerate}
        />
      </div>
    </>
  );
};

export default ChatPage;
