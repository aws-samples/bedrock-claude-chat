import React, { useMemo, useState } from 'react';
import Markdown from './Markdown';
import ButtonCopy from './ButtonCopy';
import { PiCaretLeftBold, PiNotePencil, PiUserFill } from 'react-icons/pi';
import { BaseProps } from '../@types/common';
import MLIcon from '../assets/ML-icon.svg';
import { MessageContentWithChildren } from '../@types/conversation';
import ButtonIcon from './ButtonIcon';
import Textarea from './Textarea';
import Button from './Button';

type Props = BaseProps & {
  chatContent?: MessageContentWithChildren;
  loading?: boolean;
};

const ChatMessage: React.FC<Props> = (props) => {
  const [isEdit, setIsEdit] = useState(false);
  const [changedContent, setChangedContent] = useState('');

  const chatContent = useMemo<MessageContentWithChildren | undefined>(() => {
    if (props.loading) {
      return {
        model: 'claude',
        content: {
          body: '',
          contentType: 'text',
        },
        role: 'assistant',
        id: '',
        children: [],
      };
    }
    return props.chatContent;
  }, [props]);

  return (
    <div className={`${props.className ?? ''} grid grid-cols-12 gap-2 p-3 `}>
      <div className="col-start-1 lg:col-start-2">
        {(chatContent?.children.length ?? 0) > 1 && (
          <div className="flex items-center text-sm ">
            <PiCaretLeftBold />1<div className="mx-1">/</div> 2
            <PiCaretLeftBold className="rotate-180" />
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
            <div className="break-all">
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
                <Button>変更 & 送信</Button>
                <Button
                  className="border-gray-400 bg-aws-paper"
                  onClick={() => {
                    setIsEdit(false);
                  }}>
                  Cancel
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
