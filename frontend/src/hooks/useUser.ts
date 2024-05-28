import { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const GROUP_ALLOW_API_SETTINGS = 'PublishAllowed';
const GROUP_ALLOW_CREATING_BOT = 'CreatingBotAllowed';
const GROUP_ADMIN = 'Admin';

const useUser = () => {
  const [isAllowApiSettings, setIsAllowApiSettings] = useState(false);
  const [isAllowCreatingBot, setIsAllowCreatingBot] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: session } = useSWR('current-session', () =>
    Auth.currentSession()
  );

  useEffect(() => {
    const groups: string[] | undefined =
      session?.getIdToken().payload['cognito:groups'];

    if (groups) {
      setIsAllowApiSettings(
        groups.findIndex((group) => group === GROUP_ALLOW_API_SETTINGS) > -1
      );
      setIsAllowCreatingBot(
        groups.findIndex((group) => group === GROUP_ALLOW_CREATING_BOT) > -1
      );
      setIsAdmin(groups.findIndex((group) => group === GROUP_ADMIN) > -1);
    } else {
      setIsAllowApiSettings(false);
      setIsAllowCreatingBot(false);
      setIsAdmin(false);
    }
  }, [session]);
  return {
    isAllowApiSettings,
    isAllowCreatingBot,
    isAdmin,
  };
};

export default useUser;
