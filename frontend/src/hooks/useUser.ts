import { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const GROUP_ALLOW_API_SETTINGS = 'PublishAllowed';
const GROUP_ADMIN = 'Admin';

const useUser = () => {
  const [isAllowApiSettings, setIsAllowApiSettings] = useState(false);
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
      setIsAdmin(groups.findIndex((group) => group === GROUP_ADMIN) > -1);
    } else {
      setIsAllowApiSettings(false);
      setIsAdmin(false);
    }
  }, [session]);
  return {
    isAllowApiSettings,
    isAdmin,
  };
};

export default useUser;
