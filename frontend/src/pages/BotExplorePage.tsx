import React, { ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import { PiLockKey, PiPlus, PiTrashBold, PiUsers } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import useBot from '../hooks/useBot';
import ButtonPopover from '../components/ButtonPopover';
import { BotMeta } from '../@types/bot';
import DialogConfirmDeleteBot from '../components/DialogConfirmDeleteBot';
import DialogConfirmShareBot from '../components/DialogConfirmShareBot';

type ItemProps = {
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

const ItemBotMenu: React.FC<ItemProps> = (props) => {
  return (
    <div
      className={`${
        props.className ?? ''
      } flex cursor-pointer items-center gap-1 border-b border-aws-font-color/50 bg-aws-paper px-1 py-0.5 first:rounded-t last:rounded-b last:border-b-0 hover:brightness-75`}
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
  const [targetShare, setTargetShare] = useState<BotMeta>();

  const { myBots, deleteBot, updateBotSharing } = useBot();

  const onClickNewBot = useCallback(() => {
    navigate('/bot/create');
  }, [navigate]);

  const onClickDelete = useCallback((target: BotMeta) => {
    setIsOpenDeleteDialog(true);
    setTargetDelete(target);
  }, []);

  const onDelete = useCallback(() => {
    if (targetDelete) {
      setIsOpenDeleteDialog(false);
      deleteBot(targetDelete.id).catch(() => {
        setIsOpenDeleteDialog(true);
      });
    }
  }, [deleteBot, targetDelete]);

  const onClickShare = useCallback((target: BotMeta) => {
    setIsOpenShareDialog(true);
    setTargetShare(target);
  }, []);

  const onToggleShare = useCallback(() => {
    if (targetShare) {
      setIsOpenShareDialog(false);
      updateBotSharing(targetShare.id, !targetShare.isPublic).catch(() => {
        setIsOpenShareDialog(true);
      });
    }
  }, [targetShare, updateBotSharing]);

  return (
    <>
      <DialogConfirmDeleteBot
        isOpen={isOpenDeleteDialog}
        target={targetDelete}
        onDelete={onDelete}
        onClose={() => {
          setIsOpenDeleteDialog(false);
        }}
      />
      <DialogConfirmShareBot
        isOpen={isOpenShareDialog}
        target={targetShare}
        onToggleShare={onToggleShare}
        onClose={() => {
          setIsOpenShareDialog(false);
        }}
      />
      <div className="flex justify-center">
        <div className="w-2/3">
          <div className="mt-8 w-full">
            <div className="flex items-end justify-between">
              <div className="text-xl font-bold">{t('bot.myBots')}</div>
              <Button
                className=" text-sm"
                outlined
                icon={<PiPlus />}
                onClick={onClickNewBot}>
                {t('bot.button.newBot')}
              </Button>
            </div>
            <div className="mt-2 border-b"></div>

            {myBots?.map((bot) => (
              <div key={bot.id} className="flex justify-between border-b">
                <div className="h-full w-full cursor-pointer bg-aws-paper p-2 hover:brightness-90">
                  <div className="text-sm font-semibold">{bot.title}</div>
                  <div className="mt-1 text-xs">{bot.description}</div>
                </div>

                <div className="ml-2 flex items-center gap-2">
                  {bot.isPublic ? (
                    <PiUsers className="mr-8" />
                  ) : (
                    <PiLockKey className="mr-8" />
                  )}

                  <Button
                    className="h-8 text-sm font-semibold"
                    outlined
                    onClick={() => {}}>
                    {t('bot.button.edit')}
                  </Button>
                  <div className="relative">
                    <ButtonPopover className="h-8">
                      <div className="flex w-20 flex-col rounded border border-aws-font-color/50 bg-aws-paper text-sm">
                        <ItemBotMenu
                          onClick={() => {
                            onClickShare(bot);
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BotExplorePage;
