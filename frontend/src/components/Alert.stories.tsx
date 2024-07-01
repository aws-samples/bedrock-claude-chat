import { useTranslation } from 'react-i18next';
import Alert from './Alert';

export const Warning = () => {
  const { t } = useTranslation();
  return (
    <>
      <Alert
        className="mt-1"
        severity="warning"
        title={t('admin.botManagement.alert.noApiKeys.title')}>
        {t('admin.botManagement.alert.noApiKeys.body')}
      </Alert>
    </>
  );
};

export const Error = () => {
  const { t } = useTranslation();

  return (
    <Alert severity="error" title={t('bot.alert.sync.error.title')}>
      <>
        <div className="mb-1 text-sm">
          <div>{t('bot.alert.sync.error.body')}</div>
        </div>
      </>
    </Alert>
  );
};

export const Info = () => {
  const { t } = useTranslation();

  return (
    <Alert severity="info" title={t('bot.apiSettings.alert.deploying.title')}>
      <div>{t('bot.apiSettings.alert.deploying.body')}</div>
    </Alert>
  );
};
