import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ChatMessageMarkdown from './ChatMessageMarkdown';
import ButtonCopy from './ButtonCopy';
import {
  PiCaretLeftBold,
  PiNotePencil,
  PiUserFill,
  PiThumbsDown,
  PiThumbsDownFill,
} from 'react-icons/pi';
import { BaseProps } from '../@types/common';
import {
  DisplayMessageContent,
  RelatedDocument,
  PutFeedbackRequest,
  ReasoningContent,
  TextContent,
} from '../@types/conversation';
import ButtonIcon from './ButtonIcon';
import Textarea from './Textarea';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';
import DialogFeedback from './DialogFeedback';
import UploadedAttachedFile from './UploadedAttachedFile';
import { TEXT_FILE_EXTENSIONS } from '../constants/supportedAttachedFiles';
import AgentToolList from '../features/agent/components/AgentToolList';
import { AgentToolsProps } from '../features/agent/types';
import { convertThinkingLogToAgentToolProps } from '../features/agent/utils/AgentUtils';
import { convertUsedChunkToRelatedDocument } from '../utils/MessageUtils';
import ReasoningCard from '../features/reasoning/components/ReasoningCard';

type Props = BaseProps & {
  tools?: AgentToolsProps[];
  reasoning?: string;
  chatContent?: DisplayMessageContent;
  isStreaming?: boolean;
  relatedDocuments?: RelatedDocument[];
  onChangeMessageId?: (messageId: string) => void;
  onSubmit?: (messageId: string, content: string) => void;
  onSubmitFeedback?: (messageId: string, feedback: PutFeedbackRequest) => void;
};

const ChatMessage: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [changedContent, setChangedContent] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [firstTextContent, setFirstTextContent] = useState(0);

  useEffect(() => {
    if (props.chatContent) {
      setFirstTextContent(
        props.chatContent.content.findIndex(
          (content) => content.contentType === 'text'
        )
      );
    }
  }, [props.chatContent]);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isOpenPreviewImage, setIsOpenPreviewImage] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [dialogFileName, setDialogFileName] = useState<string>('');
  const [dialogFileContent, setDialogFileContent] = useState<string | null>(
    null
  );

  const chatContent = useMemo(() => {
    return props.chatContent;
  }, [props.chatContent]);

  const relatedDocuments = useMemo(() => {
    if (chatContent?.usedChunks) {
      return [
        ...(props.relatedDocuments ?? []),
        ...chatContent.usedChunks.map((chunk) =>
          convertUsedChunkToRelatedDocument(chunk)
        ),
      ];
    } else {
      return props.relatedDocuments;
    }
  }, [props.relatedDocuments, chatContent]);

  const reasoning = useMemo(() => {
    if (props.reasoning) {
      return props.reasoning;
    }

    if (chatContent?.content == null) {
      return undefined;
    }

    const reasoningContent = chatContent.content.find(
      (content): content is ReasoningContent =>
        content.contentType === 'reasoning'
    );

    if (reasoningContent) {
      return reasoningContent.text;
    }

    return undefined;
  }, [props.reasoning, chatContent]);

  const tools = useMemo(() => {
    if (props.tools != null) {
      return props.tools;
    }
    if (chatContent?.thinkingLog == null) {
      return undefined;
    }
    return convertThinkingLogToAgentToolProps(
      chatContent.thinkingLog,
      relatedDocuments
    );
  }, [props.tools, chatContent, relatedDocuments]);

  const nodeIndex = useMemo(() => {
    return chatContent?.sibling.findIndex((s) => s === chatContent.id) ?? -1;
  }, [chatContent]);

  const onClickChange = useCallback(
    (idx: number) => {
      props.onChangeMessageId?.(chatContent?.sibling[idx] ?? '');
    },
    [chatContent?.sibling, props]
  );

  const onSubmit = useCallback(() => {
    props.onSubmit?.(chatContent?.sibling[0] ?? '', changedContent);
    setIsEdit(false);
  }, [changedContent, chatContent?.sibling, props]);

  const handleFeedbackSubmit = useCallback(
    (messageId: string, feedback: PutFeedbackRequest) => {
      if (chatContent) {
        props.onSubmitFeedback?.(messageId, feedback);
      }
      setIsFeedbackOpen(false);
    },
    [chatContent, props]
  );

  return (
    <div className={twMerge(props.className, 'grid grid-cols-12 gap-2 p-3')}>
      <div className="col-start-1 lg:col-start-2 ">
        {(chatContent?.sibling.length ?? 0) > 1 && (
          <div className="flex items-center justify-start text-sm lg:justify-end">
            <ButtonIcon
              className="text-xs"
              disabled={nodeIndex === 0}
              onClick={() => {
                onClickChange(nodeIndex - 1);
              }}>
              <PiCaretLeftBold />
            </ButtonIcon>
            {nodeIndex + 1}
            <div className="mx-1">/</div>
            {chatContent?.sibling.length}
            <ButtonIcon
              className="text-xs"
              disabled={nodeIndex >= (chatContent?.sibling.length ?? 0) - 1}
              onClick={() => {
                onClickChange(nodeIndex + 1);
              }}>
              <PiCaretLeftBold className="rotate-180" />
            </ButtonIcon>
          </div>
        )}
      </div>

      <div className="order-first col-span-12 flex lg:order-0 lg:col-span-8 lg:col-start-3">
        {chatContent?.role === 'user' && (
          <div className="h-min rounded-sm bg-aws-sea-blue-light p-2 text-xl text-white dark:bg-aws-sea-blue-dark">
            <PiUserFill />
          </div>
        )}
        {chatContent?.role === 'assistant' && (
          <div className="min-w-[2.3rem] max-w-[2.3rem]">
            <img src="/images/bedrock_icon_64.png" className="rounded-sm" />
          </div>
        )}

        <div className="ml-5 grow ">
          {chatContent?.role === 'assistant' &&
            tools != null &&
            tools.length > 0 && (
              <div className="flex flex-col">
                {tools.map((tools, index) => (
                  <div key={index} className="mb-3 mt-0">
                    <AgentToolList
                      messageId={chatContent.id}
                      tools={tools}
                      relatedDocuments={relatedDocuments}
                    />
                  </div>
                ))}
              </div>
            )
          }
          {chatContent?.role == 'assistant' && reasoning && (
            // ReasoningCard for ReasoningContent in assistant message itself.
            <ReasoningCard
              content={reasoning}
              className="mx-auto mb-3 mt-0 flex w-full max-w-5xl flex-col rounded-sm border border-gray bg-aws-paper-light text-aws-font-color-light/80 dark:bg-aws-paper-dark dark:text-aws-font-color-dark/80"
            />
          )}
          {chatContent?.role === 'user' && !isEdit && (
            <div>
              {chatContent.content.some(
                (content) => content.contentType === 'image'
              ) && (
                <div key="images">
                  {chatContent.content.map((content, idx) => {
                    if (content.contentType === 'image') {
                      const imageUrl = `data:${content.mediaType};base64,${content.body}`;
                      return (
                        <img
                          key={idx}
                          src={imageUrl}
                          className="mb-2 h-48 cursor-pointer"
                          onClick={() => {
                            setPreviewImageUrl(imageUrl);
                            setIsOpenPreviewImage(true);
                          }}
                        />
                      );
                    }
                  })}
                </div>
              )}
              {chatContent.content.some(
                (content) => content.contentType === 'attachment'
              ) && (
                <div key="files" className="my-2 flex">
                  {chatContent.content.map((content, idx) => {
                    if (content.contentType === 'attachment') {
                      const isTextFile = TEXT_FILE_EXTENSIONS.some((ext) =>
                        content.fileName?.toLowerCase().endsWith(ext)
                      );
                      return (
                        <UploadedAttachedFile
                          key={idx}
                          fileName={content.fileName ?? ''}
                          onClick={
                            // Only text file can be previewed
                            isTextFile
                              ? () => {
                                  const textContent = new TextDecoder(
                                    'utf-8'
                                  ).decode(
                                    Uint8Array.from(atob(content.body), (c) =>
                                      c.charCodeAt(0)
                                    )
                                  ); // base64 encoded text to be decoded string
                                  setDialogFileName(content.fileName ?? '');
                                  setDialogFileContent(textContent);
                                  setIsFileModalOpen(true);
                                }
                              : undefined
                          }
                        />
                      );
                    }
                  })}
                </div>
              )}
              {chatContent.content.some(
                (content) => content.contentType === 'text'
              ) &&
                chatContent.content.map((content, idx) => {
                  if (content.contentType === 'text') {
                    return (
                      <React.Fragment key={idx}>
                        {content.body.split('\n').map((c, idxBody) => (
                          <div key={idxBody}>{c}</div>
                        ))}
                      </React.Fragment>
                    );
                  }
                })}
              <ModalDialog
                isOpen={isOpenPreviewImage}
                onClose={() => setIsOpenPreviewImage(false)}
                // Set image null after transition end
                widthFromContent={true}
                onAfterLeave={() => setPreviewImageUrl(null)}>
                {previewImageUrl && (
                  <img
                    src={previewImageUrl}
                    className="mx-auto max-h-[80vh] max-w-full rounded-md"
                  />
                )}
              </ModalDialog>
              <ModalDialog
                isOpen={isFileModalOpen}
                onClose={() => setIsFileModalOpen(false)}
                widthFromContent={true}
                title={dialogFileName ?? ''}>
                <div className="relative flex size-auto max-h-[80vh] max-w-[80vh] flex-col">
                  <div className="overflow-auto px-4">
                    <pre className="whitespace-pre-wrap break-all">
                      {dialogFileContent}
                    </pre>
                  </div>
                </div>
              </ModalDialog>
            </div>
          )}
          {isEdit && (
            <div>
              <Textarea
                className="bg-transparent"
                value={changedContent}
                noBorder
                onChange={(v) => setChangedContent(v)}
              />
              <div className="flex justify-center gap-3">
                <Button onClick={onSubmit}>{t('button.SaveAndSubmit')}</Button>
                <Button
                  outlined
                  onClick={() => {
                    setIsEdit(false);
                  }}>
                  {t('button.cancel')}
                </Button>
              </div>
            </div>
          )}
          {chatContent?.role === 'assistant' && (
            <ChatMessageMarkdown
              isStreaming={props.isStreaming}
              relatedDocuments={relatedDocuments}
              messageId={chatContent.id}>
              {chatContent.content
                .filter((content) => content.contentType === 'text')
                .map((content) => (content as TextContent).body)
                .join('\n')}
            </ChatMessageMarkdown>
          )}
        </div>
      </div>

      <div className="col-span-2 col-start-11">
        <div className="flex flex-col items-end lg:items-start">
          {chatContent?.role === 'user' && !isEdit && (
            <ButtonIcon
              className="text-dark-gray dark:text-light-gray"
              onClick={() => {
                const textContent = chatContent.content[
                  firstTextContent
                ] as TextContent;
                setChangedContent(textContent.body);
                setIsEdit(true);
              }}>
              <PiNotePencil />
            </ButtonIcon>
          )}
          {chatContent?.role === 'assistant' && (
            <div className="flex">
              <ButtonIcon
                className="text-dark-gray dark:text-light-gray"
                onClick={() => setIsFeedbackOpen(true)}>
                {chatContent.feedback && !chatContent.feedback.thumbsUp ? (
                  <PiThumbsDownFill />
                ) : (
                  <PiThumbsDown />
                )}
              </ButtonIcon>
              <ButtonCopy
                className="text-dark-gray dark:text-light-gray"
                text={
                  chatContent.content.find((c) => c.contentType === 'text')
                    ? (
                        chatContent.content.find(
                          (c) => c.contentType === 'text'
                        ) as TextContent
                      ).body
                    : ''
                }
              />
            </div>
          )}
        </div>
      </div>
      <DialogFeedback
        isOpen={isFeedbackOpen}
        thumbsUp={false}
        feedback={chatContent?.feedback ?? undefined}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={(feedback) => {
          if (chatContent) {
            handleFeedbackSubmit(chatContent.id, feedback);
          }
        }}
      />
    </div>
  );
};

export default ChatMessage;
