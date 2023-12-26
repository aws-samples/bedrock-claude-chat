import React, { useCallback } from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';
import { BotFile } from '../@types/bot';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { PiFile, PiTrash, PiWarningCircleFill } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';
import { AxiosError } from 'axios';
import Progress from './Progress';
import useBot from '../hooks/useBot';

type Props = BaseProps & {
  botId: string;
  files: BotFile[];
  onChange: (files: BotFile[]) => void;
};

const SUPPORTED_FILES = [
  '.text',
  '.txt',
  '.md',
  '.xlsx',
  '.docx',
  '.pptx',
  '.pdf',
  '.csv',
];

const KnowledgeFileUploader: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { uploadFile, deleteUploadedFile } = useBot();

  const uploadFiles = useCallback(
    (files: FileList) => {
      const originalLength = props.files.length;
      let tmpFiles = produce(props.files, (draft) => {
        for (let i = 0; i < files.length; i++) {
          if (
            SUPPORTED_FILES.includes('.' + files[i].name.split('.').slice(-1))
          ) {
            draft.push({
              filename: files[i].name,
              status: 'UPLOADING',
            });
          } else {
            draft.push({
              filename: files[i].name,
              status: 'ERROR',
              errorMessage: t('bot.error.notSupportedFile'),
            });
          }
        }
        return;
      });
      props.onChange(tmpFiles);

      for (let i = 0; i < files.length; i++) {
        if (tmpFiles[originalLength + i].status === 'UPLOADING') {
          uploadFile(props.botId, files[i], (progress) => {
            tmpFiles = produce(tmpFiles, (draft) => {
              draft[originalLength + i].progress = progress;
            });
            props.onChange(tmpFiles);
          })
            .then(() => {
              tmpFiles = produce(tmpFiles, (draft) => {
                draft[originalLength + i].status = 'UPLOADED';
              });
              props.onChange(tmpFiles);
            })
            .catch((e: AxiosError) => {
              console.error(e);
              tmpFiles = produce(tmpFiles, (draft) => {
                draft[originalLength + i].status = 'ERROR';
                draft[originalLength + i].errorMessage = e.message;
              });
              props.onChange(tmpFiles);
            });
        }
      }
    },
    [props, t, uploadFile]
  );

  const onClickChooseFiles: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        if (e.target.files) {
          uploadFiles(e.target.files);
        }
      },
      [uploadFiles]
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
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const onDeleteFile = useCallback(
    (idx: number) => {
      if (props.files[idx].status === 'UPLOADED') {
        deleteUploadedFile(props.botId, props.files[idx].filename);
      }

      props.onChange(
        produce(props.files, (draft) => {
          draft.splice(idx, 1);
        })
      );
    },
    [deleteUploadedFile, props]
  );

  return (
    <>
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={twMerge(
          'flex h-full w-full flex-col items-center justify-center gap-3 rounded border-4 border-gray text-dark-gray',
          props.className
        )}>
        <div>
          {t('bot.label.dndFileUpload', {
            fileExtensions: SUPPORTED_FILES.join(','),
          })
            .split('\n')
            .map((s, idx) => (
              <div key={idx}>{s}</div>
            ))}
        </div>
        <label className="flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg border bg-aws-sea-blue p-1 px-3 text-aws-font-color-white hover:brightness-75">
          {t('bot.button.chooseFiles', {
            replace: {
              fileExtensions: 'aa',
            },
          })}

          <input
            type="file"
            hidden
            onChange={onClickChooseFiles}
            accept={SUPPORTED_FILES.join(',')}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1">
        {props.files.map((file, idx) => (
          <div key={idx} className="rounded border border-gray bg-white p-1 ">
            <div className="flex items-center justify-between ">
              <div className="flex items-center gap-2 px-1">
                <PiFile />
                {file.filename}
              </div>
              <div className="ml-auto w-32">
                {file.status === 'UPLOADING' && (
                  <div className="text-sm text-dark-gray">
                    {t('bot.label.fileUploadStatus.uploading')}
                    <Progress progress={file.progress ?? 0} />
                  </div>
                )}
                {file.status === 'UPLOADED' && (
                  <div className="text-sm font-bold text-dark-gray">
                    {t('bot.label.fileUploadStatus.uploaded')}
                  </div>
                )}
                {file.status === 'ERROR' && (
                  <div className="flex items-center gap-1 text-sm font-bold text-red">
                    <PiWarningCircleFill />
                    {t('bot.label.fileUploadStatus.error')}
                  </div>
                )}
              </div>
              <div>
                <ButtonIcon
                  className="text-red"
                  disabled={file.status === 'UPLOADING'}
                  onClick={() => {
                    onDeleteFile(idx);
                  }}>
                  <PiTrash />
                </ButtonIcon>
              </div>
            </div>
            {file.errorMessage && (
              <div className="rounded border border-dark-gray bg-light-gray px-2 py-1 text-sm ">
                <div className="font-bold text-red">
                  {t('bot.label.uploadError')}
                </div>
                <div className="italic">{file.errorMessage}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default KnowledgeFileUploader;
