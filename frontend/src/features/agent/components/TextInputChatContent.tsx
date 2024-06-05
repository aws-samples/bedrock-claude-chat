import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ButtonSend from '../../../components/ButtonSend';
import Textarea from '../../../components/Textarea';
import useChat from '../../../hooks/useChat';
import Button from '../../../components/Button';
import { PiArrowsCounterClockwise } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../../@types/common';

type Props = BaseProps & {
  disabledSend?: boolean;
  disabled?: boolean;
  placeholder?: string;
  dndMode?: boolean;
  onSend: (content: string, base64EncodedImages?: string[]) => void;
  onRegenerate: () => void;
};

export const TextInputChatContent: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { postingMessage, hasError, messages } = useChat();

  const [content, setContent] = useState('');

  const disabledSend = useMemo(() => {
    return content === '' || props.disabledSend || hasError;
  }, [hasError, content, props.disabledSend]);

  const disabledRegenerate = useMemo(() => {
    return postingMessage || hasError;
  }, [hasError, postingMessage]);

  const inputRef = useRef<HTMLDivElement>(null);

  const sendContent = useCallback(() => {
    props.onSend(content, undefined);
    setContent('');
  }, [content, props]);

  useEffect(() => {
    const currentElem = inputRef?.current;
    const keypressListener = (e: DocumentEventMap['keypress']) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabledSend) {
          sendContent();
        }
      }
    };
    currentElem?.addEventListener('keypress', keypressListener);

    const pasteListener = (e: DocumentEventMap['paste']) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems || clipboardItems.length === 0) {
        return;
      }
    };
    currentElem?.addEventListener('paste', pasteListener);

    return () => {
      currentElem?.removeEventListener('keypress', keypressListener);
      currentElem?.removeEventListener('paste', pasteListener);
    };
  });

  return (
    <>
      <div
        ref={inputRef}
        className={twMerge(
          props.className,
          'relative mb-7 flex w-11/12 flex-col rounded-xl border border-black/10 bg-white shadow-[0_0_30px_7px] shadow-light-gray md:w-10/12 lg:w-4/6 xl:w-3/6'
        )}>
        <div className="flex w-full">
          <Textarea
            className={twMerge(
              'm-1  bg-transparent pr-6 scrollbar-thin scrollbar-thumb-light-gray'
            )}
            placeholder={props.placeholder ?? t('app.inputMessage')}
            disabled={props.disabled}
            noBorder
            value={content}
            onChange={setContent}
          />
        </div>
        <div className="absolute bottom-0 right-0 flex items-center">
          <ButtonSend
            className="m-2 align-bottom"
            disabled={disabledSend || props.disabled}
            loading={postingMessage}
            onClick={sendContent}
          />
        </div>

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
    </>
  );
};
