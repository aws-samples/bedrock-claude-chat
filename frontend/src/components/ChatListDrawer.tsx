import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BaseProps } from '../@types/common';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useDrawer from '../hooks/useDrawer';
import ButtonIcon from './ButtonIcon';
import {
  PiChat,
  PiCheck,
  PiCompass,
  PiGlobe,
  PiNotePencil,
  PiPencilLine,
  PiRobot,
  PiShareNetwork,
  PiTrash,
  PiX,
} from 'react-icons/pi';
import { PiCircleNotch } from 'react-icons/pi';
import useConversation from '../hooks/useConversation';
import LazyOutputText from './LazyOutputText';
import DialogConfirmDelete from './DialogConfirmDeleteChat';
import { ConversationMeta } from '../@types/conversation';
import { isMobile } from 'react-device-detect';
import useChat from '../hooks/useChat';
import { useTranslation } from 'react-i18next';
import Menu from './Menu';
import useBot from '../hooks/useBot';
import DrawerItem from './DrawerItem';
import ExpandableDrawerGroup from './ExpandableDrawerGroup';
import useUser from '../hooks/useUser';

type Props = BaseProps & {
  onSignOut: () => void;
};

type ItemProps = BaseProps & {
  label: string;
  to: string;
  generatedTitle?: boolean;
  onClick: () => void;
  onDelete: (conversationId: string) => void;
};

const Item: React.FC<ItemProps> = (props) => {
  const { pathname } = useLocation();
  const { conversationId: pathParam } = useParams();
  const { conversationId } = useChat();
  const [tempLabel, setTempLabel] = useState('');
  const [editing, setEditing] = useState(false);
  const { updateTitle } = useConversation();

  const inputRef = useRef<HTMLInputElement>(null);

  const active = useMemo<boolean>(() => {
    return (
      pathParam === props.to ||
      ((pathname === '/' || pathname.startsWith('/bot/')) &&
        conversationId == props.to)
    );
  }, [conversationId, pathParam, pathname, props.to]);

  const onClickEdit = useCallback(() => {
    setEditing(true);
    setTempLabel(props.label);
  }, [props.label]);

  const onClickUpdate = useCallback(() => {
    updateTitle(props.to, tempLabel).then(() => {
      setEditing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempLabel, props.to]);

  const onClickDelete = useCallback(() => {
    props.onDelete(props.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.to]);

  useLayoutEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  useLayoutEffect(() => {
    if (editing) {
      const listener = (e: DocumentEventMap['keypress']) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();

          // dispatch 処理の中で Title の更新を行う（同期を取るため）
          setTempLabel((newLabel) => {
            updateTitle(props.to, newLabel).then(() => {
              setEditing(false);
            });
            return newLabel;
          });
        }
      };
      inputRef.current?.addEventListener('keypress', listener);

      inputRef.current?.focus();

      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        inputRef.current?.removeEventListener('keypress', listener);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  return (
    <DrawerItem
      isActive={active}
      isBlur={!editing}
      to={props.to}
      onClick={props.onClick}
      icon={<PiChat />}
      labelComponent={
        <>
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent"
              value={tempLabel}
              onChange={(e) => {
                setTempLabel(e.target.value);
              }}
            />
          ) : (
            <>
              {props.generatedTitle ? (
                <LazyOutputText text={props.label} />
              ) : (
                <>{props.label}</>
              )}
            </>
          )}
        </>
      }
      actionComponent={
        <>
          {active && !editing && (
            <>
              <ButtonIcon className="text-base" onClick={onClickEdit}>
                <PiPencilLine />
              </ButtonIcon>

              <ButtonIcon className="text-base" onClick={onClickDelete}>
                <PiTrash />
              </ButtonIcon>
            </>
          )}
          {editing && (
            <>
              <ButtonIcon className="text-base" onClick={onClickUpdate}>
                <PiCheck />
              </ButtonIcon>

              <ButtonIcon
                className="text-base"
                onClick={() => {
                  setEditing(false);
                }}>
                <PiX />
              </ButtonIcon>
            </>
          )}
        </>
      }
    />
  );
};

const ChatListDrawer: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { opened, switchOpen } = useDrawer();
  const { conversations } = useConversation();
  const { starredBots, recentlyUsedUnsterredBots } = useBot();

  const { isAdmin } = useUser();

  const [prevConversations, setPrevConversations] =
    useState<typeof conversations>();
  const [generateTitleIndex, setGenerateTitleIndex] = useState(-1);

  const { deleteConversation } = useConversation();
  const { newChat, conversationId } = useChat();
  const navigate = useNavigate();
  const { botId } = useParams();

  useEffect(() => {
    setPrevConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    // 新規チャットの場合はTitleをLazy表示にする
    if (!conversations || !prevConversations) {
      return;
    }
    if (conversations.length > prevConversations?.length) {
      setGenerateTitleIndex(
        conversations?.findIndex(
          (c) =>
            (prevConversations?.findIndex((pc) => c.id === pc.id) ?? -1) < 0
        ) ?? -1
      );
    }
  }, [conversations, prevConversations]);

  const onClickNewChat = useCallback(() => {
    newChat();
    closeSamllDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickNewBotChat = useCallback(
    () => {
      newChat();
      closeSamllDrawer();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    ConversationMeta | undefined
  >();

  const onDelete = useCallback(
    (conversationId: string) => {
      setIsOpenDeleteModal(true);
      setDeleteTarget(conversations?.find((c) => c.id === conversationId));
    },
    [conversations]
  );

  const deleteChat = useCallback(
    (conversationId: string) => {
      deleteConversation(conversationId).then(() => {
        newChat();
        navigate('');
        setIsOpenDeleteModal(false);
        setDeleteTarget(undefined);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const smallDrawer = useRef<HTMLDivElement>(null);

  const closeSamllDrawer = useCallback(() => {
    if (smallDrawer.current?.classList.contains('visible')) {
      switchOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    // リサイズイベントを拾って状態を更新する
    const onResize = () => {
      if (isMobile) {
        return;
      }

      // 狭い画面のDrawerが表示されていて、画面サイズが大きくなったら状態を更新
      if (!smallDrawer.current?.checkVisibility() && opened) {
        switchOpen();
      }
    };
    onResize();

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  return (
    <>
      <DialogConfirmDelete
        isOpen={isOpenDeleteModal}
        target={deleteTarget}
        onDelete={deleteChat}
        onClose={() => setIsOpenDeleteModal(false)}
      />
      <div className="relative h-full overflow-y-auto bg-aws-squid-ink scrollbar-thin scrollbar-track-white scrollbar-thumb-aws-squid-ink/30 ">
        <nav
          className={`lg:visible lg:w-64 ${
            opened ? 'visible w-64' : 'invisible w-0'
          } text-sm  text-white transition-width`}>
          <div className="absolute top-0 w-full overflow-y-auto overflow-x-hidden pb-12">
            <DrawerItem
              isActive={false}
              icon={<PiNotePencil />}
              to=""
              onClick={onClickNewChat}
              labelComponent={t('button.newChat')}
            />
            <DrawerItem
              isActive={false}
              icon={<PiCompass />}
              to="bot/explore"
              labelComponent={t('button.botConsole')}
            />
            {isAdmin && (
              <ExpandableDrawerGroup
                label={t('app.adminConsoles')}
                className="border-t pt-1">
                <DrawerItem
                  isActive={false}
                  icon={<PiShareNetwork />}
                  to="admin/shared-bot-analytics"
                  labelComponent={t('button.sharedBotAnalytics')}
                />
                <DrawerItem
                  isActive={false}
                  icon={<PiGlobe />}
                  to="admin/api-management"
                  labelComponent={t('button.apiManagement')}
                />
                {/* <DrawerItem
                  isActive={false}
                  icon={<PiUsersThree />}
                  to="admin/user-usages"
                  labelComponent={t('button.userUsages')}
                /> */}
              </ExpandableDrawerGroup>
            )}

            <ExpandableDrawerGroup
              label={t('app.starredBots')}
              className="border-t pt-1">
              {starredBots?.map((bot) => (
                <DrawerItem
                  key={bot.id}
                  isActive={botId === bot.id && !conversationId}
                  to={`bot/${bot.id}`}
                  icon={<PiRobot />}
                  labelComponent={bot.title}
                  onClick={onClickNewBotChat}
                />
              ))}
            </ExpandableDrawerGroup>

            <ExpandableDrawerGroup
              label={t('app.recentlyUsedBots')}
              className="border-t pt-1">
              {recentlyUsedUnsterredBots
                ?.slice(0, 3)
                .map((bot) => (
                  <DrawerItem
                    key={bot.id}
                    isActive={false}
                    to={`bot/${bot.id}`}
                    icon={<PiRobot />}
                    labelComponent={bot.title}
                    onClick={onClickNewBotChat}
                  />
                ))}
            </ExpandableDrawerGroup>

            <ExpandableDrawerGroup
              label={t('app.conversationHistory')}
              className="border-t pt-1">
              {conversations === undefined && (
                <div className="flex animate-spin items-center justify-center p-4">
                  <PiCircleNotch size={24} />
                </div>
              )}
              {conversations?.map((conversation, idx) => (
                <Item
                  key={idx}
                  className="grow"
                  label={conversation.title}
                  to={conversation.id}
                  generatedTitle={idx === generateTitleIndex}
                  onClick={closeSamllDrawer}
                  onDelete={onDelete}
                />
              ))}
            </ExpandableDrawerGroup>
          </div>

          <div
            className={`${
              opened ? 'w-64' : 'w-0'
            } fixed bottom-0 flex h-12 items-center justify-start border-t bg-aws-squid-ink transition-width lg:w-64`}>
            <Menu onSignOut={props.onSignOut} />
          </div>
        </nav>
      </div>

      <div
        ref={smallDrawer}
        className={`lg:hidden ${opened ? 'visible' : 'hidden'}`}>
        <ButtonIcon
          className="fixed left-64 top-0 z-50 text-white"
          onClick={switchOpen}>
          <PiX />
        </ButtonIcon>
        <div
          className="fixed z-40 h-dvh w-screen bg-dark-gray/90"
          onClick={switchOpen}></div>
      </div>
    </>
  );
};

export default ChatListDrawer;
