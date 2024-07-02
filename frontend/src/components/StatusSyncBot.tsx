import React from 'react';
import { BaseProps } from '../@types/common';
import { BotSyncStatus } from '../@types/bot';
import { useTranslation } from 'react-i18next';
import {
  PiCheckCircleBold,
  PiSpinnerBold,
  PiXCircleBold,
} from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';
import { SyncStatus } from '../constants';

type Props = BaseProps & {
  syncStatus: BotSyncStatus;
  onClickError?: () => void;
};

const StatusSyncBot: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <div className={twMerge('flex items-center gap-1', props.className)}>
      <div>
        {(props.syncStatus === SyncStatus.QUEUED ||
          props.syncStatus === SyncStatus.RUNNING) && (
          <PiSpinnerBold className="animate-spin text-aws-squid-ink" />
        )}
        {props.syncStatus === SyncStatus.SUCCEEDED && (
          <PiCheckCircleBold className="text-aws-aqua" />
        )}
        {props.syncStatus === SyncStatus.FAILED && (
          <PiXCircleBold className="text-red" />
        )}
      </div>

      <div className="whitespace-nowrap text-sm text-dark-gray">
        {props.syncStatus === SyncStatus.QUEUED && (
          <>{t('bot.label.syncStatus.queue')}</>
        )}
        {props.syncStatus === SyncStatus.RUNNING && (
          <>{t('bot.label.syncStatus.running')}</>
        )}
        {props.syncStatus === SyncStatus.SUCCEEDED && (
          <>{t('bot.label.syncStatus.success')}</>
        )}
        {props.syncStatus === SyncStatus.FAILED && (
          <>
            {props.onClickError ? (
              <a
                className="flex cursor-pointer items-center gap-0.5 border-b font-semibold text-aws-sea-blue hover:font-bold"
                onClick={props.onClickError}>
                {t('bot.label.syncStatus.fail')}
              </a>
            ) : (
              <>{t('bot.label.syncStatus.fail')}</>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatusSyncBot;
