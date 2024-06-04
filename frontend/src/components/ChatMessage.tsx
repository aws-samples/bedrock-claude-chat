import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '../@types/conversation';
import ButtonIcon from './ButtonIcon';
import Textarea from './Textarea';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';
import useChat from '../hooks/useChat';
import DialogFeedback from './DialogFeedback';

type Props = BaseProps & {
  chatContent?: DisplayMessageContent;
  onChangeMessageId?: (messageId: string) => void;
  onSubmit?: (messageId: string, content: string) => void;
};

const ChatMessage: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [changedContent, setChangedContent] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const { getRelatedDocuments, conversationId, giveFeedback } = useChat();
  const [relatedDocuments, setRelatedDocuments] = useState<RelatedDocument[]>(
    []
  );

  useEffect(() => {
    if (props.chatContent) {
      if (props.chatContent.usedChunks) {
        // usedChunks is available for existing messages
        setRelatedDocuments(
          props.chatContent.usedChunks.map((chunk) => {
            return {
              chunkBody: chunk.content,
              contentType: chunk.contentType,
              sourceLink: chunk.source,
              rank: chunk.rank,
            };
          })
        );
      } else {
        // For new messages, get related documents from the api
        setRelatedDocuments(getRelatedDocuments(props.chatContent.id));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chatContent]);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isOpenPreviewImage, setIsOpenPreviewImage] = useState(false);

  const chatContent = useMemo<DisplayMessageContent | undefined>(() => {
    return props.chatContent;
  }, [props]);

  const nodeIndex = useMemo(() => {
    return chatContent?.sibling.findIndex((s) => s === chatContent.id) ?? -1;
  }, [chatContent]);

  const onClickChange = useCallback(
    (idx: number) => {
      props.onChangeMessageId
        ? props.onChangeMessageId(chatContent?.sibling[idx] ?? '')
        : null;
    },
    [chatContent?.sibling, props]
  );

  const onSubmit = useCallback(() => {
    props.onSubmit
      ? props.onSubmit(chatContent?.sibling[0] ?? '', changedContent)
      : null;
    setIsEdit(false);
  }, [changedContent, chatContent?.sibling, props]);

  const handleFeedbackSubmit = useCallback(
    (messageId: string, feedback: PutFeedbackRequest) => {
      if (chatContent && conversationId) {
        giveFeedback(messageId, feedback);
      }
      setIsFeedbackOpen(false);
    },
    [chatContent, conversationId, giveFeedback]
  );

  return (
    <div className={`${props.className ?? ''} grid grid-cols-12 gap-2 p-3 `}>
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

      <div className="order-first col-span-12 flex lg:order-none lg:col-span-8 lg:col-start-3">
        {chatContent?.role === 'user' && (
          <div className="h-min rounded bg-aws-sea-blue p-2 text-xl text-white">
            <PiUserFill />
          </div>
        )}
        {chatContent?.role === 'assistant' && (
          <div className="min-w-[2.3rem] max-w-[2.3rem]">
            <img src="/images/bedrock_icon_64.png" className="rounded" />
          </div>
        )}

        <div className="ml-5 grow ">
          {chatContent?.role === 'user' && !isEdit && (
            <div>
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
                } else {
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
              relatedDocuments={relatedDocuments}
              messageId={chatContent.id}>
              {chatContent.content[0].body}
            </ChatMessageMarkdown>
          )}
        </div>
      </div>

      <div className="col-start-11">
        <div className="flex flex-col items-end">
          {chatContent?.role === 'user' && !isEdit && (
            <ButtonIcon
              className="text-dark-gray"
              onClick={() => {
                setChangedContent(chatContent.content[0].body);
                setIsEdit(true);
              }}>
              <PiNotePencil />
            </ButtonIcon>
          )}
          {chatContent?.role === 'assistant' && (
            <div className="flex">
              <ButtonIcon
                className="text-dark-gray"
                onClick={() => setIsFeedbackOpen(true)}>
                {chatContent.feedback && !chatContent.feedback.thumbsUp ? (
                  <PiThumbsDownFill />
                ) : (
                  <PiThumbsDown />
                )}
              </ButtonIcon>
              <ButtonCopy
                className="text-dark-gray"
                text={chatContent.content[0].body}
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
