import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import InputChatContent from '../components/InputChatContent';
import useChat from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import useScroll from '../hooks/useScroll';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PiArrowsCounterClockwise,
  PiLink,
  PiPenNib,
  PiPencilLine,
  PiStar,
  PiStarFill,
  PiWarningCircleFill,
} from 'react-icons/pi';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import SwitchBedrockModel from '../components/SwitchBedrockModel';
import useBot from '../hooks/useBot';
import useConversation from '../hooks/useConversation';
import ButtonPopover from '../components/PopoverMenu';
import PopoverItem from '../components/PopoverItem';

import { copyBotUrl } from '../utils/BotUtils';
import { produce } from 'immer';
import ButtonIcon from '../components/ButtonIcon';
import StatusSyncBot from '../components/StatusSyncBot';
import Alert from '../components/Alert';
import useBotSummary from '../hooks/useBotSummary';
import useModel from '../hooks/useModel';
import { TextInputChatContent } from '../features/agent/components/TextInputChatContent';
import { AgentProcessingIndicator } from '../features/agent/components/AgentProcessingIndicator';
import { AgentState } from '../features/agent/xstates/agentThinkProgress';
import { BottomHelper } from '../features/helper/components/BottomHelper';
import { useIsWindows } from '../hooks/useIsWindows';
const MISTRAL_ENABLED: boolean =
  import.meta.env.VITE_APP_ENABLE_MISTRAL === 'true';

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    agentThinking,
    postingMessage,
    postChat,
    messages,
    conversationId,
    setConversationId,
    hasError,
    retryPostChat,
    setCurrentMessageId,
    regenerate,
    continueGenerate,
    getPostedModel,
    loadingConversation,
  } = useChat();

  const { isWindows } = useIsWindows();

  const { getBotId } = useConversation();

  const { scrollToBottom, scrollToTop } = useScroll();

  const { conversationId: paramConversationId, botId: paramBotId } =
    useParams();

  const botId = useMemo(() => {
    return paramBotId ?? getBotId(conversationId);
  }, [conversationId, getBotId, paramBotId]);

  const {
    data: bot,
    error: botError,
    isLoading: isLoadingBot,
    mutate: mutateBot,
  } = useBotSummary(botId ?? undefined);

  const [pageTitle, setPageTitle] = useState('');
  const [isAvailabilityBot, setIsAvailabilityBot] = useState(false);

  useEffect(() => {
    setIsAvailabilityBot(false);
    if (bot) {
      setIsAvailabilityBot(true);
      setPageTitle(bot.title);
    } else {
      setPageTitle(t('bot.label.normalChat'));
    }
    if (botError) {
      if (botError.response?.status === 404) {
        setPageTitle(t('bot.label.notAvailableBot'));
      }
    }
  }, [bot, botError, t]);

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

  const inputBotParams = useMemo(() => {
    return botId
      ? {
          botId: botId,
          hasKnowledge: bot?.hasKnowledge ?? false,
          hasAgent: bot?.hasAgent ?? false,
        }
      : undefined;
  }, [bot?.hasKnowledge, botId, bot?.hasAgent]);

  const onSend = useCallback(
    (content: string, base64EncodedImages?: string[]) => {
      postChat({
        content,
        base64EncodedImages,
        bot: inputBotParams,
      });
    },
    [inputBotParams, postChat]
  );

  const onChangeCurrentMessageId = useCallback(
    (messageId: string) => {
      setCurrentMessageId(messageId);
    },
    [setCurrentMessageId]
  );

  const onSubmitEditedContent = useCallback(
    (messageId: string, content: string) => {
      if (hasError) {
        retryPostChat({
          content,
          bot: inputBotParams,
        });
      } else {
        regenerate({
          messageId,
          content,
          bot: inputBotParams,
        });
      }
    },
    [hasError, inputBotParams, regenerate, retryPostChat]
  );

  const onRegenerate = useCallback(() => {
    regenerate({
      bot: inputBotParams,
    });
  }, [inputBotParams, regenerate]);

  const onContinueGenerate = useCallback(()=>{
    continueGenerate({bot: inputBotParams});
  }, [inputBotParams, continueGenerate])

  useLayoutEffect(() => {
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
    mutateBot(
      produce(bot, (draft) => {
        draft.isPinned = isStarred;
      }),
      {
        revalidate: false,
      }
    );

    try {
      if (bot.owned) {
        updateMyBotStarred(bot.id, isStarred);
      } else {
        updateSharedBotStarred(bot.id, isStarred);
      }
    } finally {
      mutateBot();
    }
  }, [bot, mutateBot, updateMyBotStarred, updateSharedBotStarred]);

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

  const onClickSyncError = useCallback(() => {
    navigate(`/bot/edit/${bot?.id}`);
  }, [bot?.id, navigate]);

  const { disabledImageUpload } = useModel();
  const [dndMode, setDndMode] = useState(false);
  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!disabledImageUpload) {
        setDndMode(true);
      }
      e.preventDefault();
    },
    [disabledImageUpload]
  );

  const endDnd: React.DragEventHandler<HTMLDivElement> = useCallback((e) => {
    setDndMode(false);
    e.preventDefault();
  }, []);

  useEffect(() => {
    const activeCodes: { [key in KeyboardEvent['code']]: boolean } = {};
    const handleKeyDown = (event: KeyboardEvent) => {
      activeCodes[event.code] = true;

      const hasKeyDownCommand = (() => {
        return isWindows
          ? (activeCodes['ControlLeft'] || activeCodes['ControlRight']) &&
              (activeCodes['ShiftLeft'] || activeCodes['ShiftRight']) &&
              activeCodes['KeyO']
          : (activeCodes['MetaLeft'] || activeCodes['MetaRight']) &&
              (activeCodes['ShiftLeft'] || activeCodes['ShiftRight']) &&
              activeCodes['KeyO'];
      })();

      if (!hasKeyDownCommand) return;
      event.preventDefault();
      navigate('/');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      className="relative flex h-full flex-1 flex-col"
      onDragOver={onDragOver}
      onDrop={endDnd}
      onDragEnd={endDnd}>
      <div className="flex-1 overflow-hidden">
        <div className="sticky top-0 z-10 mb-1.5 flex h-14 w-full items-center justify-between border-b border-gray bg-aws-paper p-2">
          <div className="flex w-full justify-between">
            <div className="p-2">
              <div className="mr-10 font-bold">{pageTitle}</div>
              <div className="text-xs font-thin text-dark-gray">
                {description}
              </div>
            </div>

            {isAvailabilityBot && (
              <div className="absolute -top-1 right-0 flex h-full items-center">
                <div className="h-full w-5 bg-gradient-to-r from-transparent to-aws-paper"></div>
                <div className="flex items-center bg-aws-paper">
                  {bot?.owned && (
                    <StatusSyncBot
                      syncStatus={bot.syncStatus}
                      onClickError={onClickSyncError}
                    />
                  )}
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
            <div className="absolute right-2 top-10 text-xs text-dark-gray">
              model: {getPostedModel()}
            </div>
          )}
        </div>
        <section className="relative h-full w-full flex-1 overflow-auto pb-9">
          <div className="h-full">
            <div
              id="messages"
              role="presentation"
              className=" flex h-full flex-col overflow-auto pb-9">
              {messages?.length === 0 ? (
                <div className="relative flex w-full justify-center">
                  {!loadingConversation && (
                    <SwitchBedrockModel className="mt-3 w-min" />
                  )}
                  <div className="absolute mx-3 my-20 flex items-center justify-center text-4xl font-bold text-gray">
                    {!MISTRAL_ENABLED
                      ? t('app.name')
                      : t('app.nameWithoutClaude')}
                  </div>
                </div>
              ) : (
                <>
                  {messages?.map((message, idx) => (
                    <div
                      key={idx}
                      className={`${
                        message.role === 'assistant' ? 'bg-aws-squid-ink/5' : ''
                      }`}>
                      {messages.length === idx + 1 &&
                      [AgentState.THINKING, AgentState.LEAVING].some(
                        (v) => v == agentThinking.value
                      ) ? (
                        <AgentProcessingIndicator
                          processCount={agentThinking.context.count}
                        />
                      ) : (
                        <ChatMessage
                          chatContent={message}
                          onChangeMessageId={onChangeCurrentMessageId}
                          onSubmit={onSubmitEditedContent}
                        />
                      )}

                      <div className="w-full border-b border-aws-squid-ink/10"></div>
                    </div>
                  ))}
                </>
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
                        bot: inputBotParams,
                      });
                    }}>
                    {t('button.resend')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="bottom-0 z-0 flex w-full flex-col items-center justify-center">
        {bot && bot.syncStatus !== 'SUCCEEDED' && (
          <div className="mb-8 w-1/2">
            <Alert
              severity="warning"
              title={t('bot.alert.sync.incomplete.title')}>
              {t('bot.alert.sync.incomplete.body')}
            </Alert>
          </div>
        )}
        {messages.length === 0 && (
          <div className="mb-3 flex w-11/12 flex-wrap-reverse justify-start gap-2 md:w-10/12 lg:w-4/6 xl:w-3/6">
            {bot?.conversationQuickStarters?.map((qs, idx) => (
              <div
                key={idx}
                className="w-[calc(33.333%-0.5rem)] cursor-pointer rounded-2xl border border-aws-squid-ink/20 bg-white p-2  text-sm text-dark-gray  hover:shadow-lg hover:shadow-gray"
                onClick={() => {
                  onSend(qs.example);
                }}>
                <div>
                  <PiPenNib />
                </div>
                {qs.title}
              </div>
            ))}
          </div>
        )}

        {bot?.hasAgent ? (
          <TextInputChatContent
            dndMode={dndMode}
            disabledSend={postingMessage}
            disabled={disabledInput}
            placeholder={
              disabledInput
                ? t('bot.label.notAvailableBotInputMessage')
                : undefined
            }
            onSend={onSend}
            onRegenerate={onRegenerate}
          />
        ) : (
          <InputChatContent
            dndMode={dndMode}
            disabledSend={postingMessage}
            disabled={disabledInput}
            placeholder={
              disabledInput
                ? t('bot.label.notAvailableBotInputMessage')
                : undefined
            }
            onSend={onSend}
            onRegenerate={onRegenerate}
            continueGenerate={onContinueGenerate}
          />
        )}
      </div>
      <BottomHelper />
    </div>
  );
};

export default ChatPage;
