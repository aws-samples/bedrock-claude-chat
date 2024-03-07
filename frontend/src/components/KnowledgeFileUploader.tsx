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
import { create } from 'zustand';
import ButtonFileChoose from './ButtonFileChoose';

type Props = BaseProps & {
  botId: string;
  files: BotFile[];
  onAdd: (files: BotFile[]) => void;
  onUpdate: (files: BotFile[]) => void;
  onDelete: (files: BotFile[], deletedFilename: string) => void;
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

const KnowledgeFileUploaderState = create<{
  files: BotFile[];
  getFiles: () => BotFile[];
  setFiles: (f: BotFile[]) => void;
}>((set, get) => {
  return {
    files: [],
    getFiles: () => get().files,
    setFiles: (f) => {
      set(() => {
        return {
          files: f,
        };
      });
    },
  };
});

const KnowledgeFileUploader: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { uploadFile } = useBot();
  const { getFiles: _getFiles, setFiles: _setFiles } =
    KnowledgeFileUploaderState();

  const uploadFiles = useCallback(
    (targetFiles: FileList) => {
      const originalLength = props.files.length;

      // Normalize file names that contain certain Japanese characters to avoid errors in the ECS Task.
      const renamedFiles: File[] = [];
      for (let i = 0; i < targetFiles.length; i++) {
        renamedFiles.push(
          new File([targetFiles[i]], targetFiles[i].name.normalize('NFC'), {
            type: targetFiles[i].type,
          })
        );
      }

      _setFiles(
        produce(props.files, (draft) => {
          renamedFiles.forEach((file) => {
            const isSupportedFile = SUPPORTED_FILES.includes(
              '.' + file.name.split('.').slice(-1)
            );
            const isDuplicatedFile =
              props.files.findIndex(
                (botFile) => botFile.filename === file.name
              ) > -1;

            if (isSupportedFile && !isDuplicatedFile) {
              draft.push({
                filename: file.name,
                status: 'UPLOADING',
              });
            } else {
              draft.push({
                filename: file.name,
                status: 'ERROR',
                errorMessage: isDuplicatedFile
                  ? t('bot.error.duplicatedFile')
                  : t('bot.error.notSupportedFile'),
              });
            }
          });
        })
      );
      props.onAdd(_getFiles());

      renamedFiles.forEach((file, idx) => {
        if (_getFiles()[originalLength + idx].status === 'UPLOADING') {
          uploadFile(props.botId, file, (progress) => {
            _setFiles(
              produce(_getFiles(), (draft) => {
                draft[originalLength + idx].progress = progress;
              })
            );

            props.onUpdate(_getFiles());
          })
            .then(() => {
              _setFiles(
                produce(_getFiles(), (draft) => {
                  draft[originalLength + idx].status = 'UPLOADED';
                })
              );
              props.onUpdate(_getFiles());
            })
            .catch((e: AxiosError) => {
              console.error(e);
              _setFiles(
                produce(_getFiles(), (draft) => {
                  draft[originalLength + idx].status = 'ERROR';
                  draft[originalLength + idx].errorMessage = e.message;
                })
              );
              props.onUpdate(_getFiles());
            });
        }
      });
    },
    [_getFiles, _setFiles, props, t, uploadFile]
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
      props.onDelete(
        produce(props.files, (draft) => {
          draft.splice(idx, 1);
        }),
        props.files[idx].filename
      );
    },
    [props]
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

        <ButtonFileChoose
          onChange={uploadFiles}
          accept={SUPPORTED_FILES.join(',')}>
          {t('bot.button.chooseFiles')}
        </ButtonFileChoose>
      </div>

      <div className="flex flex-col gap-1">
        {props.files.map((file, idx) => (
          <div key={idx} className="rounded border border-gray bg-white p-1 ">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 break-all px-1">
                <PiFile className="w-5" />
                <div>{file.filename}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="ml-auto whitespace-nowrap">
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
