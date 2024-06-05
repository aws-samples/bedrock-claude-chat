import React, { ReactNode, cloneElement, ReactElement } from 'react';
import { BaseProps } from '../@types/common';
import { Authenticator } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { SocialProvider } from '../@types/auth';

const MISTRAL_ENABLED: boolean =
  import.meta.env.VITE_APP_ENABLE_MISTRAL === 'true';

type Props = BaseProps & {
  socialProviders: SocialProvider[];
  children: ReactNode;
};

const AuthAmplify: React.FC<Props> = ({ socialProviders, children }) => {
  const { t } = useTranslation();
  const { signOut } = useAuthenticator();

  return (
    <Authenticator
      socialProviders={socialProviders}
      components={{
        Header: () => (
          <div className="mb-5 mt-10 flex justify-center text-3xl text-aws-font-color">
            {!MISTRAL_ENABLED ? t('app.name') : t('app.nameWithoutClaude')}
          </div>
        ),
      }}>
      <>{cloneElement(children as ReactElement, { signOut })}</>
    </Authenticator>
  );
};

export default AuthAmplify;
