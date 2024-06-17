import React, { useEffect } from 'react';
import { translations } from '@aws-amplify/ui-react';
import { Amplify, I18n } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import AuthAmplify from './components/AuthAmplify';
import AuthCustom from './components/AuthCustom';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';
import './i18n';
import { validateSocialProvider } from './utils/SocialProviderUtils';
import AppContent from './components/AppContent';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './pages/ErrorFallback';

const customProviderEnabled =
  import.meta.env.VITE_APP_CUSTOM_PROVIDER_ENABLED === 'true';
const socialProviderFromEnv = import.meta.env.VITE_APP_SOCIAL_PROVIDERS?.split(
  ','
).filter(validateSocialProvider);
const MISTRAL_ENABLED: boolean =
  import.meta.env.VITE_APP_ENABLE_MISTRAL === 'true';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // set header title
    document.title = !MISTRAL_ENABLED
      ? t('app.name')
      : t('app.nameWithoutClaude');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  Amplify.configure({
    Auth: {
      userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
      userPoolWebClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
      authenticationFlowType: 'USER_SRP_AUTH',
      oauth: {
        domain: import.meta.env.VITE_APP_COGNITO_DOMAIN,
        scope: ['openid', 'email'],
        redirectSignIn: import.meta.env.VITE_APP_REDIRECT_SIGNIN_URL,
        redirectSignOut: import.meta.env.VITE_APP_REDIRECT_SIGNOUT_URL,
        responseType: 'code',
      },
    },
  });

  I18n.putVocabularies(translations);
  I18n.setLanguage(i18n.language);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {customProviderEnabled ? (
        <AuthCustom>
          <AppContent />
        </AuthCustom>
      ) : (
        <Authenticator.Provider>
          <AuthAmplify socialProviders={socialProviderFromEnv}>
            <AppContent />
          </AuthAmplify>
        </Authenticator.Provider>
      )}
    </ErrorBoundary>
  );
};

export default App;
