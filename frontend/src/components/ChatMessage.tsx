import React, { useCallback, useMemo, useState } from 'react';
import Markdown from './Markdown';
import ButtonCopy from './ButtonCopy';
import { PiCaretLeftBold, PiNotePencil, PiUserFill } from 'react-icons/pi';
import { BaseProps } from '../@types/common';
import MLIcon from '../assets/ML-icon.svg';
import { MessageContentWithChildren } from '../@types/conversation';
import ButtonIcon from './ButtonIcon';
import Textarea from './Textarea';
import Button from './Button';
import { useTranslation } from 'react-i18next';

type Props = BaseProps & {
  chatContent?: MessageContentWithChildren;
  loading?: boolean;
  onChangeMessageId?: (messageId: string) => void;
  onSubmit?: (messageId: string, content: string) => void;
};

const ChatMessage: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState(false);
  const [changedContent, setChangedContent] = useState('');

  const chatContent = useMemo<MessageContentWithChildren | undefined>(() => {
    if (props.loading) {
      return {
        model: 'claude-v2',
        content: {
          body: '',
          contentType: 'text',
        },
        role: 'assistant',
        id: '',
        parent: null,
        children: [],
        sibling: [],
      };
    }
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
          <div className="min-w-[2.5rem] max-w-[2.5rem]">
            <img src={MLIcon} />
          </div>
        )}

        <div className="ml-5 grow ">
          {chatContent?.role === 'user' && !isEdit && (
            <div>
              {chatContent.content.body.split('\n').map((c, idx) => (
                <div key={idx}>{c}</div>
              ))}
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
                  className="border-gray-400 bg-aws-paper"
                  onClick={() => {
                    setIsEdit(false);
                  }}>
                  {t('button.cancel')}
                </Button>
              </div>
            </div>
          )}

          {chatContent?.role === 'assistant' && !props.loading && (
            <Markdown>{chatContent.content.body}</Markdown>
          )}
          {props.loading && (
            <div className="animate-pulse text-gray-400">▍</div>
          )}
        </div>
      </div>

      <div className="col-start-11">
        <div className="flex">
          {chatContent?.role === 'user' && !props.loading && !isEdit && (
            <ButtonIcon
              className="mr-0.5 text-gray-400"
              onClick={() => {
                setChangedContent(chatContent.content.body);
                setIsEdit(true);
              }}>
              <PiNotePencil />
            </ButtonIcon>
          )}
          {chatContent?.role === 'assistant' && !props.loading && (
            <>
              <ButtonCopy
                className="mr-0.5 text-gray-400"
                text={chatContent.content.body}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
