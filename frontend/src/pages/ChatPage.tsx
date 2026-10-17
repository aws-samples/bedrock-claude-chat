import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import InputChatContent from '../components/InputChatContent';
import useChat from '../hooks/useChat';
import { AttachmentType } from '../hooks/useChat';
import ChatMessage from '../components/ChatMessage';
import useScroll from '../hooks/useScroll';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PiArrowsCounterClockwise,
  PiPenNib,
  PiWarningCircleFill,
} from 'react-icons/pi';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next';
import SwitchBedrockModel from '../components/SwitchBedrockModel';
import useSnackbar from '../hooks/useSnackbar';
import useBot from '../hooks/useBot';
import useConversation from '../hooks/useConversation';
import { ActiveModels, BotSummary } from '../@types/bot';
import IconPinnedBot from '../components/IconPinnedBot.tsx';

import { copyBotUrl, isPinnedBot, canBePinned } from '../utils/BotUtils';
import { toCamelCase } from '../utils/StringUtils';
import { produce } from 'immer';
import StatusSyncBot from '../components/StatusSyncBot';
import Alert from '../components/Alert';
import useBotSummary from '../hooks/useBotSummary';
import useModel from '../hooks/useModel';
import { StreamingState } from '../hooks/xstates/streaming.ts';
import { AgentToolsProps } from '../features/agent/types';
import { getRelatedDocumentsOfToolUse } from '../features/agent/utils/AgentUtils';
import { SyncStatus } from '../constants';
import { BottomHelper } from '../features/helper/components/BottomHelper';
import { useIsWindows } from '../hooks/useIsWindows';
import {
  DisplayMessageContent,
  Model,
  PutFeedbackRequest,
  RelatedDocument,
} from '../@types/conversation.ts';
import { AVAILABLE_MODEL_KEYS } from '../constants/index';
import usePostMessageStreaming from '../hooks/usePostMessageStreaming.ts';
import useLoginUser from '../hooks/useLoginUser';
import useBotPinning from '../hooks/useBotPinning';
import Skeleton from '../components/Skeleton.tsx';
import { twMerge } from 'tailwind-merge';
import ButtonStar from '../components/ButtonStar.tsx';
import MenuBot from '../components/MenuBot.tsx';

// ChatMessageWithRelatedDocuments component moved outside to prevent re-creation on every render
type ChatMessageWithRelatedDocumentsProps = {
  chatContent: DisplayMessageContent;
  isStreaming: boolean;
  streamingReasoning: string;
  streamingTools: AgentToolsProps[];
  streamingRelatedDocuments: RelatedDocument[];
  streamingStateValue: string;
  botHasAgent: boolean;
  botHasKnowledge: boolean;
  relatedDocuments: RelatedDocument[];
  onChangeMessageId?: (messageId: string) => void;
  onSubmit?: (messageId: string, content: string) => void;
  onSubmitFeedback?: (messageId: string, feedback: PutFeedbackRequest) => void;
};

const ChatMessageWithRelatedDocuments: React.FC<ChatMessageWithRelatedDocumentsProps> = React.memo((props) => {
  const { t } = useTranslation();
  const { chatContent: message } = props;

  const isAgentThinking = useMemo(() => {
    switch (props.streamingStateValue) {
      case StreamingState.STREAMING:
      case StreamingState.LEAVING:
        return props.isStreaming;
      default:
        return false;
    }
  }, [props.streamingStateValue, props.isStreaming]);

  const reasoning = useMemo(() => (
    isAgentThinking ? props.streamingReasoning : ''
  ), [isAgentThinking, props.streamingReasoning]);

  const tools: AgentToolsProps[] | undefined = useMemo(() => {
    if (isAgentThinking) {
      if (props.streamingTools.length > 0) {
        return props.streamingTools;
      }

      if (props.botHasAgent) {
        return [{ thought: t('agent.progress.label'), tools: {} }];
      }

      if (props.botHasKnowledge) {
        return [{ thought: t('bot.label.retrievingKnowledge'), tools: {} }];
      }

      return undefined;
    } else {
      if (props.botHasKnowledge) {
        const pseudoToolUseId = message.id;
        const relatedDocumentsOfVectorSearch = getRelatedDocumentsOfToolUse(
          props.relatedDocuments,
          pseudoToolUseId
        );
        if (relatedDocumentsOfVectorSearch != null && relatedDocumentsOfVectorSearch.length > 0) {
          return [{
            tools: {
              [pseudoToolUseId]: {
                name: 'knowledge_base_tool',
                status: 'success',
                input: {},
                relatedDocuments: relatedDocumentsOfVectorSearch,
              },
            },
          }];
        }
      }
      return undefined;
    }
  }, [isAgentThinking, props.streamingTools, props.botHasAgent, props.botHasKnowledge, message.id, props.relatedDocuments, t]);

  const relatedDocumentsForCitation = useMemo(
    () => isAgentThinking ? props.streamingRelatedDocuments : props.relatedDocuments,
    [isAgentThinking, props.streamingRelatedDocuments, props.relatedDocuments]
  );

  return (
    <ChatMessage
      tools={tools}
      reasoning={reasoning}
      chatContent={message}
      isStreaming={props.isStreaming}
      relatedDocuments={relatedDocumentsForCitation}
      onChangeMessageId={props.onChangeMessageId}
      onSubmit={props.onSubmit}
      onSubmitFeedback={props.onSubmitFeedback}
    />
  );
});

// Default model activation settings when no bot is selected
const defaultActiveModels: ActiveModels = (() => {
  return Object.fromEntries(
    AVAILABLE_MODEL_KEYS.map((key: Model) => [toCamelCase(key), true])
  ) as ActiveModels;
})();

const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { open: openSnackbar } = useSnackbar();
  const { errorDetail } = usePostMessageStreaming();
  const { isAdmin } = useLoginUser();
  const { pinBot, unpinBot } = useBotPinning();

  const {
    streamingState,
    conversationError,
    postingMessage,
    newChat,
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
    getShouldContinue,
    relatedDocuments,
    giveFeedback,
    reasoningEnabled,
    setReasoningEnabled,
    supportReasoning,
  } = useChat();

  // Error Handling
  useEffect(() => {
    if (conversationError) {
      if (conversationError.response?.status === 404) {
        openSnackbar(t('error.notFoundConversation'));
        newChat();
        navigate('/');
      } else {
        openSnackbar(conversationError.message ?? '');
      }
    }
  }, [conversationError, navigate, newChat, openSnackbar, t]);

  const { isWindows } = useIsWindows();

  const { getBotId } = useConversation();

  const { scrollToBottom, scrollToTop } = useScroll(conversationId);

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
      setPageTitle(t('bot.label.notAvailableBot'));

      // redirect to new chat(no bot chat) if not set conversationId
      if (!conversationId) {
        openSnackbar(t('error.cannotAccessBot'));
        newChat();
        navigate('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot, botError]);

  const description = useMemo<string>(() => {
    if (!bot) {
      return '';
    } else {
      return bot.description;
    }
  }, [bot]);

  const isLastAssistantMessageEmpty = useMemo(() => {
    if (messages.length === 0) {
      return false;
    }

    const lastMessage = messages[messages.length - 1];
    return lastMessage.role === 'assistant' && lastMessage.content.length === 0;
  }, [messages]);

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
    (
      content: string,
      enableReasoning: boolean,
      base64EncodedImages?: string[],
      attachments?: AttachmentType[]
    ) => {
      postChat({
        content,
        base64EncodedImages,
        attachments,
        bot: inputBotParams,
        enableReasoning,
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
          enableReasoning: reasoningEnabled,
        });
      } else {
        regenerate({
          messageId,
          content,
          bot: inputBotParams,
          enableReasoning: reasoningEnabled,
        });
      }
    },
    [hasError, inputBotParams, regenerate, retryPostChat, reasoningEnabled]
  );

  const onRegenerate = useCallback(
    (enableReasoning: boolean) => {
      regenerate({
        bot: inputBotParams,
        enableReasoning,
      });
    },
    [inputBotParams, regenerate]
  );

  const onContinueGenerate = useCallback(() => {
    continueGenerate({ bot: inputBotParams });
  }, [inputBotParams, continueGenerate]);

  useLayoutEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [messages, scrollToBottom, scrollToTop]);

  const { updateStarred } = useBot();
  const onClickBotEdit = useCallback(
    (botId: string) => {
      navigate(`/bot/edit/${botId}`);
    },
    [navigate]
  );

  const onClickStar = useCallback(async () => {
    if (!bot) {
      return;
    }
    const isStarred = !bot.isStarred;
    mutateBot(
      produce(bot, (draft) => {
        draft.isStarred = isStarred;
      }),
      {
        revalidate: false,
      }
    );

    updateStarred(bot.id, isStarred).finally(() => {
      mutateBot();
    });
  }, [bot, mutateBot, updateStarred]);

  const onClickCopyUrl = useCallback((botId: string) => {
    copyBotUrl(botId);
  }, []);

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

  const focusInputRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isNewConversationCommand = (() => {
        if (event.code !== 'KeyO') {
          return false;
        }
        if (isWindows) {
          return event.ctrlKey && event.shiftKey;
        } else {
          return event.metaKey && event.shiftKey;
        }
      })();
      const isFocusChatInputCommand = event.code === 'Escape' && event.shiftKey;

      if (isNewConversationCommand) {
        event.preventDefault();

        if (botId) {
          navigate(`/bot/${botId}`);
        } else {
          navigate('/');
        }
      } else if (isFocusChatInputCommand) {
        focusInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const activeModels = useMemo(() => {
    if (!bot) {
      return defaultActiveModels;
    }
    const isActiveModelsEmpty =
      Object.keys(bot?.activeModels ?? {}).length === 0;
    return isActiveModelsEmpty ? defaultActiveModels : bot.activeModels;
  }, [bot]);

  const togglePinBot = useCallback(
    (bot: BotSummary) => {
      mutateBot(
        produce(bot, (draft) => {
          draft.sharedStatus = isPinnedBot(bot.sharedStatus)
            ? 'shared'
            : 'pinned@000';
        }),
        {
          revalidate: false,
        }
      );

      if (isPinnedBot(bot.sharedStatus)) {
        unpinBot(bot.id).finally(() => {
          mutateBot();
        });
      } else {
        pinBot(bot.id, 0).finally(() => {
          mutateBot();
        });
      }
    },
    [mutateBot, pinBot, unpinBot]
  );

  const canSwitchPinned = useMemo(() => {
    return isAdmin && canBePinned(bot?.sharedScope ?? 'private');
  }, [bot?.sharedScope, isAdmin]);

  return (
    <div
      className="relative flex h-full flex-1 flex-col"
      onDragOver={onDragOver}
      onDrop={endDnd}
      onDragEnd={endDnd}>
      <div className="flex-1 overflow-hidden">
        <div className="sticky top-0 z-10 mb-1.5 flex h-14 w-full items-center justify-between border-b border-gray bg-aws-paper-light p-2 dark:bg-aws-paper-dark">
          <div className="flex w-full justify-between">
            <div className="p-2">
              <div className="mr-10 flex items-center whitespace-nowrap font-bold">
                {isLoadingBot ? (
                  <Skeleton className="h-5 w-32" />
                ) : (
                  <>
                    <IconPinnedBot
                      botSharedStatus={bot?.sharedStatus}
                      className="mr-1 text-aws-aqua"
                    />
                    {pageTitle}
                  </>
                )}
              </div>
            </div>

            {isLoadingBot && (
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="size-7" />
                <Skeleton className="h-7 w-12" />
              </div>
            )}

            {isAvailabilityBot && !isLoadingBot && (
              <div className="absolute -top-1 right-0 flex h-full items-center">
                <div className="h-full w-12 bg-linear-to-r from-transparent to-aws-paper-light dark:to-aws-paper-dark"></div>
                <div className="flex items-center bg-aws-paper-light dark:bg-aws-paper-dark">
                  {bot?.owned && (
                    <StatusSyncBot
                      syncStatus={bot.syncStatus}
                      onClickError={onClickSyncError}
                    />
                  )}

                  <ButtonStar
                    isStarred={bot?.isStarred ?? false}
                    onClick={onClickStar}
                  />

                  <MenuBot
                    className="mx-1"
                    {...(bot?.owned && {
                      onClickEdit: () => {
                        onClickBotEdit(bot.id);
                      },
                    })}
                    {...(bot?.sharedScope !== 'private' && {
                      onClickCopyUrl: () => {
                        onClickCopyUrl(bot?.id ?? '');
                      },
                    })}
                    {...(canSwitchPinned
                      ? {
                          onClickSwitchPinned: () => {
                            if (bot) {
                              togglePinBot(bot);
                            }
                          },
                          isPinned: isPinnedBot(bot?.sharedStatus ?? ''),
                        }
                      : {
                          isPinned: undefined,
                          onClickSwitchPinned: undefined,
                        })}
                  />
                </div>
              </div>
            )}
          </div>
          {getPostedModel() && (
            <div className="absolute right-2 top-10 text-xs text-dark-gray dark:text-light-gray">
              model: {getPostedModel()}
            </div>
          )}
        </div>
        <section className="relative size-full flex-1 overflow-auto pb-9">
          <div className="h-full">
            <div
              id="messages"
              role="presentation"
              className="flex h-full flex-col overflow-auto pb-16">
              {messages?.length === 0 ? (
                <div className="relative mb-[45vh]  flex w-full flex-col items-center justify-center">
                  {!loadingConversation && (
                    <SwitchBedrockModel
                      className="mb-6 mt-3 w-min"
                      activeModels={activeModels}
                      botId={botId}
                    />
                  )}
                  <div className="px-20 text-center">
                    <div className="text-lg font-bold">
                      {isLoadingBot && botId && (
                        <Skeleton className="h-5 w-32" />
                      )}
                      {!isLoadingBot && bot && (
                        <div className="flex items-baseline justify-center">
                          <IconPinnedBot
                            botSharedStatus={bot?.sharedStatus}
                            className="mr-1 shrink-0 text-aws-aqua"
                          />
                          <div>{pageTitle}</div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-dark-gray dark:text-light-gray">
                      {isLoadingBot ? (
                        <Skeleton className="mt-1 h-3 w-64" />
                      ) : (
                        description
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages?.map((message, idx, array) => (
                    <div
                      key={message.id}
                      className={`${
                        message.role === 'assistant'
                          ? 'bg-aws-squid-ink-light/5 dark:bg-aws-squid-ink-dark/35'
                          : ''
                      }`}>
                      <ChatMessageWithRelatedDocuments
                        chatContent={message}
                        isStreaming={postingMessage && idx + 1 === array.length}
                        streamingReasoning={streamingState.context.reasoning}
                        streamingTools={streamingState.context.tools}
                        streamingRelatedDocuments={streamingState.context.relatedDocuments}
                        streamingStateValue={streamingState.value as string}
                        botHasAgent={bot?.hasAgent ?? false}
                        botHasKnowledge={bot?.hasKnowledge ?? false}
                        relatedDocuments={relatedDocuments ?? []}
                        onChangeMessageId={onChangeCurrentMessageId}
                        onSubmit={onSubmitEditedContent}
                        onSubmitFeedback={(messageId, feedback) => {
                          if (conversationId) {
                            giveFeedback(messageId, feedback);
                          }
                        }}
                      />
                      <div className="w-full border-b border-aws-squid-ink-light/10 dark:border-aws-squid-ink-dark/10"></div>
                    </div>
                  ))}
                </>
              )}
              {hasError && (
                <div className="mb-12 mt-2 flex flex-col items-center">
                  <div className="flex items-center font-bold text-red">
                    <PiWarningCircleFill className="mr-1 text-2xl" />
                    {errorDetail ?? t('error.answerResponse')}
                  </div>

                  <Button
                    className="mt-2 shadow-sm "
                    icon={<PiArrowsCounterClockwise />}
                    outlined
                    onClick={() => {
                      retryPostChat({
                        enableReasoning: reasoningEnabled,
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

      <div
        className={twMerge(
          'bottom-0 z-0 flex w-full flex-col items-center justify-center',
          messages.length === 0 ? 'absolute top-2/3 -translate-y-1/2' : ''
        )}>
        {bot && bot.syncStatus !== SyncStatus.SUCCEEDED && (
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
                className="w-[calc(33.333%-0.5rem)] cursor-pointer rounded-2xl border border-aws-squid-ink-light/20 bg-white p-2 text-sm  text-dark-gray hover:shadow-lg hover:shadow-gray  dark:border-aws-squid-ink-dark/20 dark:text-light-gray"
                onClick={() => {
                  onSend(qs.example, reasoningEnabled);
                }}>
                <div>
                  <PiPenNib />
                </div>
                {qs.title}
              </div>
            ))}
          </div>
        )}

        <InputChatContent
          className="mb-7 w-11/12 md:w-10/12 lg:w-4/6 xl:w-3/6"
          dndMode={dndMode}
          disabledSend={postingMessage || hasError || isLastAssistantMessageEmpty}
          disabledRegenerate={postingMessage || hasError}
          disabledContinue={postingMessage || hasError}
          disabled={disabledInput}
          placeholder={
            disabledInput
              ? t('bot.label.notAvailableBotInputMessage')
              : undefined
          }
          canRegenerate={messages.length > 1}
          canContinue={getShouldContinue()}
          isLoading={postingMessage}
          isNewChat={messages.length == 0}
          onSend={onSend}
          onRegenerate={onRegenerate}
          continueGenerate={onContinueGenerate}
          ref={focusInputRef}
          supportReasoning={supportReasoning}
          reasoningEnabled={reasoningEnabled}
          onChangeReasoning={setReasoningEnabled}
        />
      </div>
      <BottomHelper />
    </div>
  );
};

export default ChatPage;
