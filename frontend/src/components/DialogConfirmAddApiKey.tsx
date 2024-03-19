import React, { useEffect, useState } from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';
import InputText from './InputText';

type Props = BaseProps & {
  isOpen: boolean;
  loading?: boolean;
  onAdd: (description: string) => void;
  onClose: () => void;
};

const DialogConfirmAddApiKey: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (props.isOpen) {
      setDescription('');
    }
  }, [props.isOpen]);

  return (
    <ModalDialog title={t('bot.apiSettings.addApiKeyDialog.title')} {...props}>
      <div>{t('bot.apiSettings.addApiKeyDialog.content')}</div>
      <InputText
        value={description}
        disabled={props.loading}
        onChange={(val) => {
          setDescription(val);
        }}
      />

      <div className="mt-4 flex justify-end gap-2">
        <Button
          onClick={props.onClose}
          className="p-2"
          outlined
          loading={props.loading}>
          {t('button.cancel')}
        </Button>
        <Button
          loading={props.loading}
          disabled={description === ''}
          onClick={() => {
            props.onAdd(description);
          }}
          className="p-2">
          {t('button.add')}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmAddApiKey;
