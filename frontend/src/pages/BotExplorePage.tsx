import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import {
  PiGlobe,
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
import { BotMeta } from '../@types/bot';
import DialogConfirmDeleteBot from '../components/DialogConfirmDeleteBot';
import DialogConfirmShareBot from '../components/DialogShareBot';
import ButtonIcon from '../components/ButtonIcon';
import PopoverMenu from '../components/PopoverMenu';
import PopoverItem from '../components/PopoverItem';
import useChat from '../hooks/useChat';
import Help from '../components/Help';
import StatusSyncBot from '../components/StatusSyncBot';
import useUser from '../hooks/useUser';
import ListItemBot from '../components/ListItemBot';

const BotExplorePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAllowCreatingBot, isAllowApiSettings } = useUser();

  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenShareDialog, setIsOpenShareDialog] = useState(false);
  const [targetDelete, setTargetDelete] = useState<BotMeta>();
  const [targetShareIndex, setTargetShareIndex] = useState<number>();

  const { newChat } = useChat();
  const {
    myBots,
    recentlyUsedSharedBots,
    deleteMyBot,
    deleteRecentlyUsedBot,
    updateBotSharing,
    updateMyBotStarred,
    updateSharedBotStarred,
  } = useBot(true);

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

  const onClickApiSettings = useCallback(
    (botId: string) => {
      navigate(`/bot/api-settings/${botId}`);
    },
    [navigate]
  );

  const onToggleShare = useCallback(() => {
    if (targetShareBot) {
      updateBotSharing(targetShareBot.id, !targetShareBot.isPublic);
    }
  }, [targetShareBot, updateBotSharing]);

  const onClickBot = useCallback(
    (botId: string) => {
      newChat();
      navigate(`/bot/${botId}`);
    },
    [navigate, newChat]
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
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">{t('bot.label.myBots')}</div>
                <Help direction="right" message={t('bot.help.overview')} />
              </div>

              <Button
                className=" text-sm"
                disabled={!isAllowCreatingBot}
                outlined
                icon={<PiPlus />}
                onClick={onClickNewBot}>
                {t('bot.button.newBot')}
              </Button>
            </div>
            <div className="mt-2 border-b border-gray"></div>

            <div className="h-4/5 overflow-x-hidden overflow-y-scroll border-b border-gray pr-1 scrollbar-thin scrollbar-thumb-aws-font-color/20 ">
              {myBots?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center italic text-dark-gray">
                  {t('bot.label.noBots')}
                </div>
              )}
              {myBots?.map((bot, idx) => (
                <ListItemBot
                  key={bot.id}
                  bot={bot}
                  onClick={onClickBot}
                  className="last:border-b-0">
                  <div className="flex items-center">
                    {bot.owned && (
                      <StatusSyncBot
                        className="mr-5"
                        syncStatus={bot.syncStatus}
                        onClickError={() => {
                          navigate(`/bot/edit/${bot.id}`);
                        }}
                      />
                    )}

                    <div className="mr-5 flex justify-end">
                      {bot.isPublic ? (
                        <div className="flex items-center">
                          <PiUsers className="mr-1" />
                          <ButtonIcon
                            className="-mr-3"
                            onClick={() => {
                              onClickShare(idx);
                            }}>
                            <PiLink />
                          </ButtonIcon>
                        </div>
                      ) : (
                        <div className="ml-7">
                          <PiLockKey />
                        </div>
                      )}
                    </div>

                    <div className="mr-5">
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
                      className="mr-2 h-8 text-sm font-semibold"
                      outlined
                      onClick={() => {
                        onClickEditBot(bot.id);
                      }}>
                      {t('bot.button.edit')}
                    </Button>
                    <div className="relative">
                      <PopoverMenu className="h-8" target="bottom-right">
                        <PopoverItem
                          onClick={() => {
                            onClickShare(idx);
                          }}>
                          <PiUsers />
                          {t('bot.button.share')}
                        </PopoverItem>
                        {isAllowApiSettings && (
                          <PopoverItem
                            onClick={() => {
                              onClickApiSettings(bot.id);
                            }}>
                            <PiGlobe />
                            {t('bot.button.apiSettings')}
                          </PopoverItem>
                        )}
                        <PopoverItem
                          className="font-bold text-red"
                          onClick={() => {
                            onClickDelete(bot);
                          }}>
                          <PiTrashBold />
                          {t('bot.button.delete')}
                        </PopoverItem>
                      </PopoverMenu>
                    </div>
                  </div>
                </ListItemBot>
              ))}
            </div>
          </div>
          <div className="h-1/2 w-full">
            <div className="text-xl font-bold">
              {t('bot.label.recentlyUsedBots')}
            </div>
            <div className="mt-2 border-b border-gray"></div>
            <div className="h-4/5 overflow-y-scroll border-b border-gray  pr-1 scrollbar-thin scrollbar-thumb-aws-font-color/20">
              {recentlyUsedSharedBots?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center italic text-dark-gray">
                  {t('bot.label.noBotsRecentlyUsed')}
                </div>
              )}
              {recentlyUsedSharedBots?.map((bot) => (
                <ListItemBot
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
                    className="text-red"
                    onClick={() => {
                      deleteRecentlyUsedBot(bot.id);
                    }}>
                    <PiTrash />
                  </ButtonIcon>
                </ListItemBot>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BotExplorePage;
