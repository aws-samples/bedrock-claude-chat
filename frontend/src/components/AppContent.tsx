import React, { useCallback } from 'react';
import ChatListDrawer from './ChatListDrawer';
import { BaseProps } from '../@types/common';
import LazyOutputText from './LazyOutputText';
import { PiList, PiPlus } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';
import SnackbarProvider from '../providers/SnackbarProvider';
import { Outlet, matchRoutes, useLocation } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import useDrawer from '../hooks/useDrawer';
import useConversation from '../hooks/useConversation';
import useChat from '../hooks/useChat';
import { allPaths, usePageLabel } from '../routes';

type Props = BaseProps & {
  signOut?: () => void;
};

const AppContent: React.FC<Props> = (props) => {
  const { getPageLabel } = usePageLabel();
  const { switchOpen: switchDrawer } = useDrawer();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { getTitle } = useConversation();
  const { isGeneratedTitle } = useChat();

  const location = useLocation();

  const conversationOrNewChatRoutes: { path: (typeof allPaths)[number] }[] = [
    { path: '/:conversationId' },
    { path: '/bot/:botId' },
    { path: '/' },
    { path: '*' },
  ];

  const extractPathPattern = allPaths
    .filter(
      (pattern) =>
        !conversationOrNewChatRoutes.find(({ path }) => path === pattern)
    )
    .map((pattern) => ({ path: pattern }));
  const routes = matchRoutes(extractPathPattern, location);
  const pathPattern = routes?.map(({ route }) => route.path)[0] ?? '/';

  const isConversationOrNewChat = !routes?.length;

  const onClickNewChat = useCallback(() => {
    navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-dvh w-screen bg-aws-paper">
      <ChatListDrawer
        onSignOut={() => {
          props.signOut ? props.signOut() : null;
        }}
      />

      <main className="relative min-h-dvh flex-1 overflow-y-hidden transition-width">
        <header className="visible flex h-12 w-full items-center bg-aws-squid-ink p-3 text-lg text-aws-font-color-white lg:hidden lg:h-0">
          <button
            className="mr-2 rounded-full p-2 hover:brightness-50 focus:outline-none focus:ring-1 "
            onClick={() => {
              switchDrawer();
            }}>
            <PiList />
          </button>

          <div className="flex grow justify-center">
            {isGeneratedTitle ? (
              <>
                <LazyOutputText text={getTitle(conversationId ?? '')} />
              </>
            ) : (
              <>
                {isConversationOrNewChat
                  ? getTitle(conversationId ?? '')
                  : getPageLabel(pathPattern)}
              </>
            )}
          </div>

          <ButtonIcon onClick={onClickNewChat}>
            <PiPlus />
          </ButtonIcon>
        </header>

        <div
          className="h-full overflow-hidden overflow-y-auto  text-aws-font-color"
          id="main">
          <SnackbarProvider>
            <Outlet />
          </SnackbarProvider>
        </div>
      </main>
    </div>
  );
};

export default AppContent;
