import React, {
  ReactNode,
  useState,
  useEffect,
  cloneElement,
  ReactElement,
} from 'react';
import Button from './Button';
import { BaseProps } from '../@types/common';
import { Auth } from 'aws-amplify';
import { useTranslation } from 'react-i18next';
import { PiCircleNotch } from 'react-icons/pi';

const MISTRAL_ENABLED: boolean = import.meta.env.VITE_APP_ENABLE_MISTRAL === 'true';

type Props = BaseProps & {
  children: ReactNode;
};

const AuthCustom: React.FC<Props> = ({ children }) => {
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
      customProvider: import.meta.env.VITE_APP_CUSTOM_PROVIDER_NAME,
    });
  };

  const signOut = () => {
    Auth.signOut();
  };

  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center p-4">
          <div className="mb-3 text-4xl">Loading...</div>
          <div className="animate-spin">
            <PiCircleNotch size={100} />
          </div>
        </div>
      ) : !authenticated ? (
        <div className="flex flex-col items-center gap-4">
          <div className="mb-5 mt-10 text-4xl text-aws-sea-blue">
            {!MISTRAL_ENABLED ? t('app.name') : t('app.nameWithoutClaude')}
          </div>
          <Button onClick={() => signIn()} className="px-20 text-xl">
            {t('signIn.button.login')}
          </Button>
        </div>
      ) : (
        // Pass the signOut function to the child component
        <>{cloneElement(children as ReactElement, { signOut })}</>
      )}
    </>
  );
};

export default AuthCustom;
