import React, { useState } from 'react';
import { BaseProps } from '../@types/common';
import useBotApiKey from '../hooks/useBotApiKey';
import Skeleton from './Skeleton';
import { useTranslation } from 'react-i18next';
import { PiCheckCircleBold, PiXCircleBold } from 'react-icons/pi';
import { formatDatetime } from '../utils/DateUtils';
import Button from './Button';
import ButtonCopy from './ButtonCopy';

import useBotApiSettings from '../hooks/useBotApiSettings';
import DialogConfirmDeleteApiKey from './DialogConfirmDeleteApiKey';
import { produce } from 'immer';

type Props = BaseProps & {
  botId: string;
  apiKeyId: string;
};

const ApiKeyItem: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { botApiKey, isLoading, deleteBotApiKey } = useBotApiKey(
    props.botId,
    props.apiKeyId
  );
  const { botPublication, mutateBotPublication } = useBotApiSettings(
    props.botId
  );

  const [isHideKey, setIsHideKey] = useState(true);

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  return (
    <>
      <DialogConfirmDeleteApiKey
        apiKeyTitle={botApiKey?.description ?? ''}
        isOpen={isOpenDialog}
        onDelete={() => {
          setIsOpenDialog(false);
          mutateBotPublication({
            ...botPublication!,
            apiKeyIds: produce(botPublication?.apiKeyIds ?? [], (draft) => {
              const index = draft.findIndex(
                (keyId) => keyId === props.apiKeyId
              );
              if (index > -1) {
                draft.splice(index, 1);
              }
            }),
          });
          Promise.all([deleteBotApiKey(), mutateBotPublication()]).finally(
            () => {
              mutateBotPublication();
            }
          );
        }}
        onClose={() => {
          setIsOpenDialog(false);
        }}
      />

      <div className="w-full">
        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <div className="flex flex-col gap-1 rounded border border-aws-font-color/50 p-1 text-sm">
            <div className="text-base font-semibold">
              {botApiKey?.description}
            </div>
            <div className="flex items-center gap-3">
              {botApiKey?.enabled ? (
                <div className="flex w-24 items-center gap-1 text-aws-aqua">
                  <PiCheckCircleBold />
                  {t('bot.apiSettings.label.apiKeyDetail.active')}
                </div>
              ) : (
                <div className="flex w-24 items-center gap-1 text-red">
                  <PiXCircleBold />
                  {t('bot.apiSettings.label.apiKeyDetail.inactive')}
                </div>
              )}
              <div className="text-xs text-aws-font-color/70">
                <div className="mr-1 inline">
                  {t('bot.apiSettings.label.apiKeyDetail.creationDate')}:
                </div>
                {botApiKey?.createdDate
                  ? formatDatetime(botApiKey.createdDate)
                  : ''}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-1">
                  {t('bot.apiSettings.label.apiKeyDetail.key')}:
                </div>
                <div>{isHideKey ? '***************' : botApiKey?.value}</div>
                <ButtonCopy text={botApiKey?.value ?? ''} className="-my-2" />
                <Button
                  text
                  className="-m-2 font-bold text-aws-sea-blue"
                  onClick={() => {
                    setIsHideKey(!isHideKey);
                  }}>
                  {isHideKey
                    ? t('bot.apiSettings.button.ApiKeyShow')
                    : t('bot.apiSettings.button.ApiKeyHide')}
                </Button>
              </div>
              <div>
                <Button
                  className="bg-red"
                  onClick={() => {
                    setIsOpenDialog(true);
                  }}>
                  {t('bot.button.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ApiKeyItem;
