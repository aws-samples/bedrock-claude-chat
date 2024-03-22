import React from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';

type Props = BaseProps & {
  isOpen: boolean;
  loading?: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DialogConfirmDeleteApi: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <ModalDialog title={t('bot.apiSettings.deleteApiDaialog.title')} {...props}>
      <div>{t('bot.apiSettings.deleteApiDaialog.content')}</div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          loading={props.loading}
          onClick={props.onClose}
          className="p-2"
          outlined>
          {t('button.cancel')}
        </Button>
        <Button
          loading={props.loading}
          onClick={props.onDelete}
          className="bg-red p-2 text-aws-font-color-white">
          {t('bot.button.delete')}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmDeleteApi;
