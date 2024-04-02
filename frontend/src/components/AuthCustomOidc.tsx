import React, { ReactNode, useState, useEffect } from 'react';
import { BaseProps } from '../@types/common';
import { Auth } from 'aws-amplify';
import { Button, Text, Loader } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';

type Props = BaseProps & {
  children: ReactNode;
};

const AuthCustomOidc: React.FC<Props> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(() => {
        setAuthenticated(true);
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signIn = () => {
    Auth.federatedSignIn({
      customProvider: import.meta.env.VITE_APP_CUSTOM_OIDC_PROVIDER_NAME,
    });
  };

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 justify-items-center gap-4">
          <Text className="mt-12 text-center">Loading...</Text>
          <Loader width="5rem" height="5rem" />
        </div>
      ) : !authenticated ? (
        <div className="grid grid-cols-1 justify-items-center gap-4">
          <Text className="mt-12 text-center text-3xl">{t('app.name')}</Text>
          <Button
            variation="primary"
            onClick={() => signIn()}
            className="mt-6 w-60">
            Login
          </Button>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

export default AuthCustomOidc;
