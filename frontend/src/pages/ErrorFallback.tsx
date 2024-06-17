import React from 'react';
import { useTranslation } from 'react-i18next';
import { PiSmileyXEyesFill } from 'react-icons/pi';

const ErrorFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-aws-paper">
      <div className="flex text-5xl font-bold">
        <PiSmileyXEyesFill />
        ERROR
      </div>
      <div className="mt-4 text-lg">{t('error.unexpectedError.title')}</div>
      <button
        className="underline"
        onClick={() => (window.location.href = '/')}>
        {t('error.unexpectedError.restore')}
      </button>
    </div>
  );
};

export default ErrorFallback;
