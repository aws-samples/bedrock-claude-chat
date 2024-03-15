import React from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';

type Props = BaseProps & {
  isOpen: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DialogConfirmDeleteApi: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <ModalDialog title={t('bot.deleteApiDaialog.title')} {...props}>
      <div>{t('bot.deleteApiDaialog.content')}</div>

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

export default DialogConfirmDeleteApi;
