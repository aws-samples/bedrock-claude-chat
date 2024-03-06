import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ButtonSend from './ButtonSend';
import Textarea from './Textarea';
import useChat from '../hooks/useChat';
import Button from './Button';
import { PiArrowsCounterClockwise } from 'react-icons/pi';
import { TbPhotoPlus } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import ButtonIcon from './ButtonIcon';
import useModel from '../hooks/useModel';

type Props = {
  disabledSend?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onSend: (content: string) => void;
  onRegenerate: () => void;
};

const InputChatContent: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { postingMessage, hasError, messages } = useChat();
  const { disabledImageUpload, model } = useModel();

  const [content, setContent] = useState('');
  const [base64EncodedImages, setBase64EncodedImages] = useState<string[]>([]);

  const disabledSend = useMemo(() => {
    return content === '' || props.disabledSend || hasError;
  }, [hasError, content, props.disabledSend]);

  const disabledRegenerate = useMemo(() => {
    return postingMessage || hasError;
  }, [hasError, postingMessage]);

  const inputRef = useRef<HTMLDivElement>(null);

  const sendContent = useCallback(() => {
    props.onSend(content);
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

      for (let i = 0; i < clipboardItems.length; i++) {
        if (model?.supportMediaType.includes(clipboardItems[i].type)) {
          const pastedFile = clipboardItems[i].getAsFile();
          if (pastedFile) {
            const reader = new FileReader();
            reader.readAsDataURL(pastedFile);

            reader.onloadend = () => {
              setBase64EncodedImages([reader.result?.toString() ?? '']);
            };
          }
        }
      }

      // if(clipboardItems[0].type)

      // const items = [].slice.call(clipboardItems).filter(function (item) {
      //   // Filter the image items only
      //   return /^image\//.test(item.type);
      // });
      // if (items.length === 0) {
      //   return;
      // }

      // const item = items[0];
      // const blob = item.getAsFile();

      // const imageEle = document.getElementById('preview');
      // imageEle.src = URL.createObjectURL(blob);
      // let file = new File(
      //   [blob],
      //   'file name',
      //   { type: 'image/jpeg', lastModified: new Date().getTime() },
      //   'utf-8'
      // );
      // let container = new DataTransfer();
      // container.items.add(file);
      // document.querySelector('#file_input').files = container.files;
    };
    currentElem?.addEventListener('paste', pasteListener);

    return () => {
      currentElem?.removeEventListener('keypress', keypressListener);
      currentElem?.removeEventListener('paste', pasteListener);
    };
  });

  return (
    <div
      ref={inputRef}
      id="input-chat-content"
      className="relative mb-7 flex w-11/12 flex-col  rounded-xl border border-black/10 bg-white shadow-[0_0_30px_7px] shadow-light-gray md:w-10/12 lg:w-4/6 xl:w-3/6">
      <div className="flex w-full items-end">
        <Textarea
          className="m-1 -mr-16 bg-transparent pr-6 scrollbar-thin scrollbar-thumb-light-gray "
          placeholder={props.placeholder ?? t('app.inputMessage')}
          disabled={props.disabled}
          noBorder
          value={content}
          onChange={setContent}
        />

        {!disabledImageUpload && (
          <ButtonIcon className="text-aws-sea-blue" onClick={() => {}}>
            <TbPhotoPlus />
          </ButtonIcon>
        )}
        <ButtonSend
          className="m-2 align-bottom"
          disabled={disabledSend || props.disabled}
          loading={postingMessage}
          onClick={sendContent}
        />
      </div>
      <div className="flex">
        {base64EncodedImages.map((imageFile, idx) => (
          <img key={idx} src={imageFile} />
        ))}
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
  );
};

export default InputChatContent;
