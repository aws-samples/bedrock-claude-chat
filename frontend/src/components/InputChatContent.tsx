import React, { useEffect, useMemo } from 'react';
import ButtonSend from './ButtonSend';
import Textarea from './Textarea';
import useChat from '../hooks/useChat';
import Button from './Button';
import { PiArrowsCounterClockwise } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

type Props = {
  content: string;
  disabledSend?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChangeContent: (content: string) => void;
  onSend: () => void;
  onRegenerate: () => void;
};

const InputChatContent: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { postingMessage, hasError, messages } = useChat();

  const disabledSend = useMemo(() => {
    return props.content === '' || props.disabledSend || hasError;
  }, [hasError, props.content, props.disabledSend]);

  const disabledRegenerate = useMemo(() => {
    return postingMessage || hasError;
  }, [hasError, postingMessage]);

  useEffect(() => {
    const listener = (e: DocumentEventMap['keypress']) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        if (!disabledSend) {
          props.onSend();
        }
      }
    };
    document
      .getElementById('input-chat-content')
      ?.addEventListener('keypress', listener);

    return () => {
      document
        .getElementById('input-chat-content')
        ?.removeEventListener('keypress', listener);
    };
  });

  return (
    <div
      id="input-chat-content"
      className="relative mb-7 flex w-11/12 items-end rounded-xl border border-black/10 bg-white shadow-[0_0_30px_7px] shadow-light-gray md:w-10/12 lg:w-4/6 xl:w-3/6">
      <Textarea
        className="m-1 -mr-16 bg-transparent pr-6 scrollbar-thin scrollbar-thumb-light-gray "
        placeholder={props.placeholder ?? t('app.inputMessage')}
        disabled={props.disabled}
        noBorder
        value={props.content}
        onChange={props.onChangeContent}
      />
      <ButtonSend
        className="m-2 align-bottom"
        disabled={disabledSend || props.disabled}
        loading={postingMessage}
        onClick={props.onSend}
      />
      {messages.length > 1 && (
        <Button
          className="absolute -top-14 right-0 bg-aws-paper p-2 text-sm"
          outlined
          disabled={disabledRegenerate || props.disabled}
          onClick={props.onRegenerate}>
          <PiArrowsCounterClockwise className="mr-2" />
          {t('button.regenerate')}
        </Button>
      )}
    </div>
  );
};

export default InputChatContent;
