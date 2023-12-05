import React, { useMemo } from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { Trans, useTranslation } from 'react-i18next';
import { BotMeta } from '../@types/bot';

type Props = BaseProps & {
  isOpen: boolean;
  target?: BotMeta;
  onToggleShare: (botId: string) => void;
  onClose: () => void;
};

const DialogConfirmShareBot: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const isShared = useMemo(() => {
    return props.target?.isPublic ?? false;
  }, [props.target?.isPublic]);
  return (
    <ModalDialog
      {...props}
      title={
        isShared
          ? t('bot.shareDialog.unshare.title')
          : t('bot.shareDialog.share.title')
      }>
      <div>
        <Trans
          i18nKey={
            isShared
              ? 'bot.shareDialog.unshare.content'
              : 'bot.shareDialog.share.content'
          }
          values={{
            title: props.target?.title,
          }}
          components={{
            Bold: <span className="font-bold" />,
          }}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={props.onClose} className="p-2" outlined>
          {t('button.cancel')}
        </Button>
        {isShared ? (
          <Button
            onClick={() => {
              props.onToggleShare(props.target?.id ?? '');
            }}
            className="bg-red-500 p-2 text-aws-font-color-white">
            {t('bot.button.unshare')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              props.onToggleShare(props.target?.id ?? '');
            }}
            className="bg-green-500 p-2 text-aws-font-color-white">
            {t('bot.button.share')}
          </Button>
        )}
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmShareBot;
