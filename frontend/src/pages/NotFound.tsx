import React from 'react';
import { useTranslation } from 'react-i18next';
import { PiSmileyXEyesFill } from 'react-icons/pi';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <div className="flex text-5xl font-bold">
        <PiSmileyXEyesFill />
        404 ERROR
      </div>
      <div className="mt-4 text-lg">{t('error.notFoundPage')}</div>
    </div>
  );
};

export default NotFound;
