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
import { PiArrowsCounterClockwise, PiX } from 'react-icons/pi';
import { TbPhotoPlus } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import ButtonIcon from './ButtonIcon';
import useModel from '../hooks/useModel';
import { produce } from 'immer';
import { twMerge } from 'tailwind-merge';
import { create } from 'zustand';
import ButtonFileChoose from './ButtonFileChoose';
import { BaseProps } from '../@types/common';

type Props = BaseProps & {
  disabledSend?: boolean;
  disabled?: boolean;
  placeholder?: string;
  dndMode?: boolean;
  onSend: (content: string, base64EncodedImages?: string[]) => void;
  onRegenerate: () => void;
};

const MAX_IMAGE_WIDTH = 800;
const MAX_IMAGE_HEIGHT = 800;

const useInputChatContentState = create<{
  base64EncodedImages: string[];
  pushBase64EncodedImage: (encodedImage: string) => void;
  removeBase64EncodedImage: (index: number) => void;
  clearBase64EncodedImages: () => void;
}>((set, get) => ({
  base64EncodedImages: [],
  pushBase64EncodedImage: (encodedImage) => {
    set({
      base64EncodedImages: produce(get().base64EncodedImages, (draft) => {
        draft.push(encodedImage);
      }),
    });
  },
  removeBase64EncodedImage: (index) => {
    set({
      base64EncodedImages: produce(get().base64EncodedImages, (draft) => {
        draft.splice(index, 1);
      }),
    });
  },
  clearBase64EncodedImages: () => {
    set({
      base64EncodedImages: [],
    });
  },
}));

const InputChatContent: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { postingMessage, hasError, messages } = useChat();
  const { disabledImageUpload, model, acceptMediaType } = useModel();

  const [content, setContent] = useState('');
  const {
    base64EncodedImages,
    pushBase64EncodedImage,
    removeBase64EncodedImage,
    clearBase64EncodedImages,
  } = useInputChatContentState();

  useEffect(() => {
    clearBase64EncodedImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disabledSend = useMemo(() => {
    return content === '' || props.disabledSend || hasError;
  }, [hasError, content, props.disabledSend]);

  const disabledRegenerate = useMemo(() => {
    return postingMessage || hasError;
  }, [hasError, postingMessage]);

  const inputRef = useRef<HTMLDivElement>(null);

  const sendContent = useCallback(() => {
    props.onSend(
      content,
      !disabledImageUpload && base64EncodedImages.length > 0
        ? base64EncodedImages
        : undefined
    );
    setContent('');
    clearBase64EncodedImages();
  }, [
    base64EncodedImages,
    clearBase64EncodedImages,
    content,
    disabledImageUpload,
    props,
  ]);

  const encodeAndPushImage = useCallback(
    (imageFile: File) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(imageFile);
      reader.onload = () => {
        if (!reader.result) {
          return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(new Blob([reader.result]));
        img.onload = async () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;

          // determine image size
          const aspectRatio = width / height;
          let newWidth;
          let newHeight;
          if (aspectRatio > 1) {
            newWidth = width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH : width;
            newHeight =
              width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / aspectRatio : height;
          } else {
            newHeight = height > MAX_IMAGE_HEIGHT ? MAX_IMAGE_HEIGHT : height;
            newWidth =
              height > MAX_IMAGE_HEIGHT
                ? MAX_IMAGE_HEIGHT * aspectRatio
                : width;
          }

          // resize image using canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = newWidth;
          canvas.height = newHeight;
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);

          // quality can only be set to jpeg
          const resizedImageData = canvas.toDataURL('image/jpeg', 0.3);

          pushBase64EncodedImage(resizedImageData);
        };
      };
    },
    [pushBase64EncodedImage]
  );

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
            encodeAndPushImage(pastedFile);
            e.preventDefault();
          }
        }
      }
    };
    currentElem?.addEventListener('paste', pasteListener);

    return () => {
      currentElem?.removeEventListener('keypress', keypressListener);
      currentElem?.removeEventListener('paste', pasteListener);
    };
  });

  const onChangeImageFile = useCallback(
    (fileList: FileList) => {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (file) {
          encodeAndPushImage(file);
        }
      }
    },
    [encodeAndPushImage]
  );

  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    []
  );

  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      onChangeImageFile(e.dataTransfer.files);
    },
    [onChangeImageFile]
  );

  return (
    <>
      {props.dndMode && (
        <div
          className="fixed left-0 top-0 h-full w-full bg-black/40"
          onDrop={onDrop}></div>
      )}
      <div
        ref={inputRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={twMerge(
          props.className,
          'relative mb-7 flex w-11/12 flex-col rounded-xl border border-black/10 bg-white shadow-[0_0_30px_7px] shadow-light-gray md:w-10/12 lg:w-4/6 xl:w-3/6'
        )}>
        <div className="flex w-full">
          <Textarea
            className={twMerge(
              'm-1  bg-transparent scrollbar-thin scrollbar-thumb-light-gray',
              disabledImageUpload ? 'pr-6' : 'pr-12'
            )}
            placeholder={props.placeholder ?? t('app.inputMessage')}
            disabled={props.disabled}
            noBorder
            value={content}
            onChange={setContent}
          />
        </div>
        <div className="absolute bottom-0 right-0 flex items-center">
          {!disabledImageUpload && (
            <ButtonFileChoose
              disabled={postingMessage}
              icon
              accept={acceptMediaType.join(',')}
              onChange={onChangeImageFile}>
              <TbPhotoPlus />
            </ButtonFileChoose>
          )}
          <ButtonSend
            className="m-2 align-bottom"
            disabled={disabledSend || props.disabled}
            loading={postingMessage}
            onClick={sendContent}
          />
        </div>
        {base64EncodedImages.length > 0 && (
          <div className="relative m-2 mr-24 flex flex-wrap gap-3">
            {base64EncodedImages.map((imageFile, idx) => (
              <div key={idx} className="relative">
                <img
                  src={imageFile}
                  className="h-16 rounded border border-aws-squid-ink"
                />
                <ButtonIcon
                  className="absolute right-0 top-0 -m-2 border border-aws-sea-blue bg-white p-1 text-xs text-aws-sea-blue"
                  onClick={() => {
                    removeBase64EncodedImage(idx);
                  }}>
                  <PiX />
                </ButtonIcon>
              </div>
            ))}
            {disabledImageUpload && (
              <div className="absolute -m-2 flex h-[120%] w-[110%] items-center justify-center bg-black/30">
                <div className="rounded bg-light-red p-3 text-sm text-aws-font-color">
                  {t('error.notSupportedImage')}
                </div>
              </div>
            )}
          </div>
        )}
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

export default InputChatContent;
