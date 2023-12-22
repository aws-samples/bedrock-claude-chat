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

type Props = BaseProps & {
  syncStatus: BotSyncStatus;
};

const StatusSyncBot: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <div className={twMerge('flex items-center gap-1', props.className)}>
      <div>
        {(props.syncStatus === 'QUEUED' || props.syncStatus === 'RUNNING') && (
          <PiSpinnerBold className="animate-spin text-aws-squid-ink" />
        )}
        {props.syncStatus === 'SUCCEEDED' && (
          <PiCheckCircleBold className="text-aws-aqua" />
        )}
        {props.syncStatus === 'FAILED' && (
          <PiXCircleBold className="text-red" />
        )}
      </div>

      <div className="whitespace-nowrap text-sm text-dark-gray">
        {props.syncStatus === 'QUEUED' && (
          <>{t('bot.label.syncStatus.queue')}</>
        )}
        {props.syncStatus === 'RUNNING' && (
          <>{t('bot.label.syncStatus.running')}</>
        )}
        {props.syncStatus === 'SUCCEEDED' && (
          <>{t('bot.label.syncStatus.success')}</>
        )}
        {props.syncStatus === 'FAILED' && <>{t('bot.label.syncStatus.fail')}</>}
      </div>
    </div>
  );
};

export default StatusSyncBot;
