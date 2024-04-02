import React from 'react';
import { BaseProps } from '../@types/common';
import ChatListDrawer from './ChatListDrawer';
import LazyOutputText from './LazyOutputText';
import { PiList, PiPlus } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';
import SnackbarProvider from '../providers/SnackbarProvider';
import { Outlet } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

type Props = BaseProps & {
  switchDrawer: () => void;
  onClickNewChat: () => void;
  conversationId?: string;
  getTitle: (conversationId: string) => string;
  isGeneratedTitle: boolean;
};

const AppContent: React.FC<Props> = (props) => {
  const { signOut } = useAuthenticator();
  const {
    switchDrawer,
    onClickNewChat,
    conversationId,
    getTitle,
    isGeneratedTitle,
  } = props;

  return (
    <div className="h-dvh relative flex w-screen bg-aws-paper">
      <ChatListDrawer
        onSignOut={() => {
          signOut ? signOut() : null;
        }}
      />

      <main className="min-h-dvh relative flex-1 overflow-y-hidden transition-width">
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
              <>{getTitle(conversationId ?? '')}</>
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
