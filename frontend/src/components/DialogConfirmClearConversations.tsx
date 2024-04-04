import React from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { Trans, useTranslation } from 'react-i18next';

type Props = BaseProps & {
  isOpen: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DialogConfirmClearConversations: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  return (
    <ModalDialog {...props} title={t('clearDialog.title')}>
      <div>
        <Trans
          i18nKey="clearDialog.content"
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
            props.onDelete();
          }}
          className="bg-red p-2 text-aws-font-color-white">
          {t('button.deleteAll')}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmClearConversations;
