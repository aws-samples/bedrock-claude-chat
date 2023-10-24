import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BaseProps } from '../@types/common';
import { Link, useNavigate } from 'react-router-dom';
import useDrawer from '../hooks/useDrawer';
import ButtonIcon from './ButtonIcon';
import {
  PiChat,
  PiCheck,
  PiPencilLine,
  PiPlus,
  PiTrash,
  PiX,
} from 'react-icons/pi';

import Button from './Button';
import useConversation from '../hooks/useConversation';
import LazyOutputText from './LazyOutputText';
import DialogConfirmDelete from './DialogConfirmDeleteChat';
import { ConversationMeta } from '../@types/conversation';
import { isMobile } from 'react-device-detect';
import useChat from '../hooks/useChat';
import { useTranslation } from 'react-i18next';
import Menu from './Menu';

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
  const { conversationId } = useChat();
  const [tempLabel, setTempLabel] = useState('');
  const [editing, setEditing] = useState(false);
  const { updateTitle } = useConversation();

  const inputRef = useRef<HTMLInputElement>(null);

  const active = useMemo<boolean>(() => {
    return conversationId === props.to;
  }, [conversationId, props.to]);

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
    <Link
      className={`group mx-2 my-1 flex h-10 items-center  rounded px-2 ${
        active ? 'bg-aws-sea-blue' : 'hover:bg-aws-sea-blue-hover'
      } ${props.className ?? ''}`}
      to={props.to}
      onClick={props.onClick}>
      <div className={`flex h-8 max-h-5 w-full justify-start overflow-hidden`}>
        <div className="mr-2 text-base">
          <PiChat />
        </div>
        <div className="relative flex-1 text-ellipsis break-all">
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
          {!editing && (
            <div
              className={`absolute inset-y-0 right-0 w-8 bg-gradient-to-l 
              ${
                active
                  ? 'from-aws-sea-blue'
                  : 'from-aws-squid-ink group-hover:from-aws-sea-blue-hover'
              }
              `}
            />
          )}
        </div>

        <div className="flex">
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
        </div>
      </div>
    </Link>
  );
};

const ChatListDrawer: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { opened, switchOpen } = useDrawer();
  const { conversations } = useConversation();
  const [prevConversations, setPrevConversations] =
    useState<typeof conversations>();
  const [generateTitleIndex, setGenerateTitleIndex] = useState(-1);

  const { deleteConversation } = useConversation();
  const { newChat } = useChat();
  const navigate = useNavigate();

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
    navigate('');
    closeSamllDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="relative h-full overflow-y-auto bg-aws-squid-ink  ">
        <nav
          className={`lg:visible lg:w-64 ${
            opened ? 'visible w-64' : 'invisible w-0'
          } text-sm  text-white transition-width`}>
          <div
            className={`${
              opened ? 'w-64' : 'w-0'
            } fixed top-0 z-50 h-14 bg-aws-squid-ink p-2 transition-width lg:w-64 `}>
            <Button
              className="h-full w-full bg-aws-squid-ink"
              onClick={onClickNewChat}
              icon={<PiPlus />}>
              {t('button.newChat')}
            </Button>
          </div>

          <div className="absolute top-14 w-full overflow-y-auto overflow-x-hidden pb-12">
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
          className="fixed z-40 h-screen w-screen bg-gray-900/90"
          onClick={switchOpen}></div>
      </div>
    </>
  );
};

export default ChatListDrawer;
