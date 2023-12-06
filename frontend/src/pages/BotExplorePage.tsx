import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import {
  PiLink,
  PiLockKey,
  PiPlus,
  PiStar,
  PiStarFill,
  PiTrash,
  PiTrashBold,
  PiUsers,
} from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import useBot from '../hooks/useBot';
import ButtonPopover from '../components/ButtonPopover';
import { BotMeta, GetBotsResponse } from '../@types/bot';
import DialogConfirmDeleteBot from '../components/DialogConfirmDeleteBot';
import DialogConfirmShareBot from '../components/DialogShareBot';
import ButtonIcon from '../components/ButtonIcon';
import { BaseProps } from '../@types/common';

type ItemBotProps = BaseProps & {
  bot: GetBotsResponse[number];
  onClick: (botId: string) => void;
  children: ReactNode;
};

const ItemBot: React.FC<ItemBotProps> = (props) => {
  const { t } = useTranslation();
  return (
    <div
      key={props.bot.id}
      className={`${props.className ?? ''} flex justify-between border-b`}>
      <div
        className={`h-full w-full bg-aws-paper p-2 ${
          props.bot.available
            ? 'cursor-pointer hover:brightness-90'
            : 'text-aws-font-color/30'
        }`}
        onClick={() => {
          if (props.bot.available) {
            props.onClick(props.bot.id);
          }
        }}>
        <div className="text-sm font-semibold">{props.bot.title}</div>
        {props.bot.description ? (
          <div className="mt-1 text-xs">
            {props.bot.available
              ? props.bot.description
              : t('bot.label.notAvailable')}
          </div>
        ) : (
          <div className="mt-1 text-xs italic text-gray-400">
            {t('bot.label.noDescription')}
          </div>
        )}
      </div>

      <div className="ml-2 flex items-center gap-2">{props.children}</div>
    </div>
  );
};

type ItemBotMenuProps = {
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

const ItemBotMenu: React.FC<ItemBotMenuProps> = (props) => {
  return (
    <div
      className={`${
        props.className ?? ''
      } flex cursor-pointer items-center gap-1 border-b border-aws-font-color/50 bg-aws-paper px-2 py-1 first:rounded-t last:rounded-b last:border-b-0 hover:brightness-75`}
      onClick={props.onClick}>
      {props.children}
    </div>
  );
};

const BotExplorePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenShareDialog, setIsOpenShareDialog] = useState(false);
  const [targetDelete, setTargetDelete] = useState<BotMeta>();
  const [targetShareIndex, setTargetShareIndex] = useState<number>();

  const {
    myBots,
    recentlyUsedSharedBots,
    deleteMyBot,
    deleteRecentlyUsedBot,
    updateBotSharing,
    updateMyBotStarred,
    updateSharedBotStarred,
  } = useBot();

  const targetShareBot = useMemo(() => {
    if (myBots) {
      if ((targetShareIndex ?? -1) < 0) {
        return undefined;
      }
      return myBots[targetShareIndex!];
    }
    return undefined;
  }, [myBots, targetShareIndex]);

  const onClickNewBot = useCallback(() => {
    navigate('/bot/new');
  }, [navigate]);

  const onClickEditBot = useCallback(
    (botId: string) => {
      navigate(`/bot/edit/${botId}`);
    },
    [navigate]
  );

  const onClickDelete = useCallback((target: BotMeta) => {
    setIsOpenDeleteDialog(true);
    setTargetDelete(target);
  }, []);

  const onDeleteMyBot = useCallback(() => {
    if (targetDelete) {
      setIsOpenDeleteDialog(false);
      deleteMyBot(targetDelete.id).catch(() => {
        setIsOpenDeleteDialog(true);
      });
    }
  }, [deleteMyBot, targetDelete]);

  const onClickShare = useCallback((targetIndex: number) => {
    setIsOpenShareDialog(true);
    setTargetShareIndex(targetIndex);
  }, []);

  const onToggleShare = useCallback(() => {
    if (targetShareBot) {
      updateBotSharing(targetShareBot.id, !targetShareBot.isPublic);
    }
  }, [targetShareBot, updateBotSharing]);

  const onClickBot = useCallback(
    (botId: string) => {
      navigate(`/bot/${botId}`);
    },
    [navigate]
  );

  return (
    <>
      <DialogConfirmDeleteBot
        isOpen={isOpenDeleteDialog}
        target={targetDelete}
        onDelete={onDeleteMyBot}
        onClose={() => {
          setIsOpenDeleteDialog(false);
        }}
      />
      <DialogConfirmShareBot
        isOpen={isOpenShareDialog}
        target={targetShareBot}
        onToggleShare={onToggleShare}
        onClose={() => {
          setIsOpenShareDialog(false);
        }}
      />
      <div className="flex h-full justify-center">
        <div className="w-2/3">
          <div className="h-1/2 w-full pt-8">
            <div className="flex items-end justify-between">
              <div className="text-xl font-bold">{t('bot.label.myBots')}</div>
              <Button
                className=" text-sm"
                outlined
                icon={<PiPlus />}
                onClick={onClickNewBot}>
                {t('bot.button.newBot')}
              </Button>
            </div>
            <div className="mt-2 border-b"></div>

            <div className="h-4/5 overflow-y-scroll border-b  pr-1 scrollbar-thin scrollbar-thumb-aws-font-color/20 ">
              {myBots?.map((bot, idx) => (
                <ItemBot
                  key={bot.id}
                  bot={bot}
                  onClick={onClickBot}
                  className="last:border-b-0">
                  {bot.isPublic ? (
                    <div className="flex items-center">
                      <PiUsers className="mr-1" />
                      <ButtonIcon
                        className="mr-2"
                        onClick={() => {
                          onClickShare(idx);
                        }}>
                        <PiLink />
                      </ButtonIcon>
                    </div>
                  ) : (
                    <PiLockKey className="mr-4" />
                  )}

                  <div className="mr-4">
                    {bot.isPinned ? (
                      <ButtonIcon
                        disabled={!bot.available}
                        onClick={() => {
                          updateMyBotStarred(bot.id, false);
                        }}>
                        <PiStarFill className="text-aws-aqua" />
                      </ButtonIcon>
                    ) : (
                      <ButtonIcon
                        disabled={!bot.available}
                        onClick={() => {
                          updateMyBotStarred(bot.id, true);
                        }}>
                        <PiStar />
                      </ButtonIcon>
                    )}
                  </div>

                  <Button
                    className="h-8 text-sm font-semibold"
                    outlined
                    onClick={() => {
                      onClickEditBot(bot.id);
                    }}>
                    {t('bot.button.edit')}
                  </Button>
                  <div className="relative">
                    <ButtonPopover className="h-8">
                      <div className="flex w-20 flex-col rounded border border-aws-font-color/50 bg-aws-paper text-sm">
                        <ItemBotMenu
                          onClick={() => {
                            onClickShare(idx);
                          }}>
                          <PiUsers />
                          {t('bot.button.share')}
                        </ItemBotMenu>

                        <ItemBotMenu
                          className="font-bold text-red-600"
                          onClick={() => {
                            onClickDelete(bot);
                          }}>
                          <PiTrashBold />
                          {t('bot.button.delete')}
                        </ItemBotMenu>
                      </div>
                    </ButtonPopover>
                  </div>
                </ItemBot>
              ))}
            </div>
          </div>
          <div className="h-1/2 w-full">
            <div className="text-xl font-bold">
              {t('bot.label.recentlyUsedBots')}
            </div>
            <div className="mt-2 border-b"></div>
            <div className="h-4/5 overflow-y-scroll border-b pr-1 scrollbar-thin scrollbar-thumb-aws-font-color/20">
              {recentlyUsedSharedBots?.map((bot) => (
                <ItemBot
                  key={bot.id}
                  bot={bot}
                  onClick={onClickBot}
                  className="last:border-b-0">
                  {bot.isPinned ? (
                    <ButtonIcon
                      disabled={!bot.available}
                      onClick={() => {
                        updateSharedBotStarred(bot.id, false);
                      }}>
                      <PiStarFill className="text-aws-aqua" />
                    </ButtonIcon>
                  ) : (
                    <ButtonIcon
                      disabled={!bot.available}
                      onClick={() => {
                        updateSharedBotStarred(bot.id, true);
                      }}>
                      <PiStar />
                    </ButtonIcon>
                  )}
                  <ButtonIcon
                    className="text-red-600"
                    onClick={() => {
                      deleteRecentlyUsedBot(bot.id);
                    }}>
                    <PiTrash />
                  </ButtonIcon>
                </ItemBot>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BotExplorePage;
