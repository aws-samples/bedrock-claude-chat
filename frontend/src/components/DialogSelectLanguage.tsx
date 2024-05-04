import React, { useState } from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { useTranslation } from 'react-i18next';
import Select from './Select';
import { LANGUAGES } from '../i18n';

type Props = BaseProps & {
  isOpen: boolean;
  onClose: () => void;
};

const DialogSelectLanguage: React.FC<Props> = (props) => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  return (
    <ModalDialog {...props} title={t('languageDialog.title')}>
      <div>
        <Select
          value={language}
          options={LANGUAGES}
          onChange={(lng) => {
            setLanguage(lng);
          }}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={props.onClose} className="p-2" outlined>
          {t('button.cancel')}
        </Button>
        <Button
          onClick={() => {
            i18n.changeLanguage(language);
            props.onClose();
          }}
          className="p-2">
          {t('button.ok')}
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogSelectLanguage;
