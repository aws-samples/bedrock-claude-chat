import React from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { Trans, useTranslation } from 'react-i18next';
import { BotMeta } from '../@types/bot';

type Props = BaseProps & {
  isOpen: boolean;
  target?: BotMeta;
  onDelete: (conversationId: string) => void;
  onClose: () => void;
};

const DialogConfirmDeleteBot: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <ModalDialog {...props} title={t('bot.deleteDialog.title')}>
      <div>
        <Trans
          i18nKey="bot.deleteDialog.content"
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
        <Button
          onClick={() => {
            props.onDelete(props.target?.id ?? '');
          }}
          className="bg-red p-2 text-aws-font-color-white">
          {t('button.delete')}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmDeleteBot;
