import React from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { Trans, useTranslation } from 'react-i18next';

type Props = BaseProps & {
  isOpen: boolean;
  apiKeyTitle: string;
  onDelete: () => void;
  onClose: () => void;
};

const DialogConfirmDeleteApiKey: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <ModalDialog
      title={t('bot.apiSettings.deleteApiKeyDialog.title')}
      {...props}>
      <div>
        <Trans
          i18nKey="bot.apiSettings.deleteApiKeyDialog.content"
          values={{
            title: props.apiKeyTitle,
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
          onClick={props.onDelete}
          className="bg-red p-2 text-aws-font-color-white">
          {t('bot.button.delete')}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmDeleteApiKey;
