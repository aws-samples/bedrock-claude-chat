import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListItemBot from './ListItemBot';
import { BotListItem, SharedScope } from '../@types/bot';
import {
  PiGlobe,
  PiLink,
  PiLockKey,
  PiStar,
  PiStarFill,
  PiTrash,
  PiTrashBold,
  PiUsers,
} from 'react-icons/pi';
import StatusSyncBot from './StatusSyncBot';
import ButtonIcon from './ButtonIcon';
import Button from './Button';
import PopoverMenu from './PopoverMenu';
import PopoverItem from './PopoverItem';
import { formatDatetime } from '../utils/DateUtils';

const bots: BotListItem[] = [
  {
    id: '1',
    title: 'Bot 1',
    description: 'Bot 1',
    createTime: new Date(),
    lastUsedTime: new Date(),
    isStarred: false,
    owned: false,
    syncStatus: 'SUCCEEDED',
    available: true,
    sharedScope: 'private',
    sharedStatus: '',
  },
  {
    id: '2',
    title: 'Bot 2',
    description: 'Bot 2',
    createTime: new Date(),
    lastUsedTime: new Date(),
    isStarred: true,
    owned: true,
    syncStatus: 'SUCCEEDED',
    available: true,
    sharedScope: 'private',
    sharedStatus: '',
  },
  {
    id: '3',
    title: 'Bot 1 Disabled',
    description: '',
    createTime: new Date(),
    lastUsedTime: new Date(),
    isStarred: false,
    owned: false,
    syncStatus: 'SUCCEEDED',
    available: false,
    sharedScope: 'private',
    sharedStatus: '',
  },
  {
    id: '4',
    title: 'Bot 2 Disabled',
    description: '',
    createTime: new Date(),
    lastUsedTime: new Date(),
    isStarred: true,
    owned: true,
    syncStatus: 'SUCCEEDED',
    available: false,
    sharedScope: 'private',
    sharedStatus: '',
  },
];

export const MyBots = () => {
  const { t } = useTranslation();
  const [myBots, setMyBots] = useState(bots);
  return (
    <div className="h-4/5 overflow-x-hidden overflow-y-scroll border-b border-gray pr-1 scrollbar-thin">
      {myBots.length === 0 && (
        <div className="flex size-full items-center justify-center italic text-dark-gray dark:text-light-gray">
          {t('bot.label.noBots')}
        </div>
      )}
      {myBots.map((bot) => (
        <ListItemBot
          key={bot.id}
          bot={bot}
          onClick={() => {}}
          className="last:border-b-0">
          <div className="flex items-center">
            {bot.owned && (
              <StatusSyncBot
                className="mr-5"
                syncStatus={bot.syncStatus}
                onClickError={() => {}}
              />
            )}

            <div className="mr-5 flex justify-end">
              {bot.sharedScope === 'all' ? (
                <div className="flex items-center">
                  <PiUsers className="mr-1" />
                  <ButtonIcon className="-mr-3" onClick={() => {}}>
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
              {bot.isStarred ? (
                <ButtonIcon disabled={!bot.available} onClick={() => {}}>
                  <PiStarFill className="text-aws-aqua" />
                </ButtonIcon>
              ) : (
                <ButtonIcon disabled={!bot.available} onClick={() => {}}>
                  <PiStar />
                </ButtonIcon>
              )}
            </div>

            <Button
              className="mr-2 h-8 text-sm font-semibold"
              outlined
              onClick={() => {}}>
              {t('bot.button.edit')}
            </Button>
            <div className="relative">
              <PopoverMenu className="h-8" target="bottom-right">
                <PopoverItem onClick={() => {}}>
                  <PiUsers />
                  {t('bot.button.share')}
                </PopoverItem>
                <PopoverItem onClick={() => {}}>
                  <PiGlobe />
                  {t('bot.button.apiSettings')}
                </PopoverItem>
                <PopoverItem
                  className="font-bold text-red"
                  onClick={() => {
                    setMyBots((current) =>
                      current.filter((value) => value.id !== bot.id)
                    );
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
  );
};

export const RecentlyUsedSharedBots = () => {
  const { t } = useTranslation();
  const [recentlyUsedSharedBots, setRecentlyUsedSharedBots] = useState(bots);
  return (
    <div className="h-4/5 overflow-y-scroll border-b border-gray  pr-1 scrollbar-thin">
      {recentlyUsedSharedBots.length === 0 && (
        <div className="flex size-full items-center justify-center italic text-dark-gray dark:text-light-gray">
          {t('bot.label.noBotsRecentlyUsed')}
        </div>
      )}
      {recentlyUsedSharedBots.map((bot) => (
        <ListItemBot
          key={bot.id}
          bot={bot}
          onClick={() => {}}
          className="last:border-b-0">
          {bot.isStarred ? (
            <ButtonIcon disabled={!bot.available} onClick={() => {}}>
              <PiStarFill className="text-aws-aqua" />
            </ButtonIcon>
          ) : (
            <ButtonIcon disabled={!bot.available} onClick={() => {}}>
              <PiStar />
            </ButtonIcon>
          )}
          <ButtonIcon
            className="text-red"
            onClick={() => {
              setRecentlyUsedSharedBots((current) =>
                current.filter((value) => value.id !== bot.id)
              );
            }}>
            <PiTrash />
          </ButtonIcon>
        </ListItemBot>
      ))}
    </div>
  );
};

export const ApiManagement = () => {
  const { t } = useTranslation();
  const botApis = [
    {
      id: '1',
      title: 'Bot 1',
      description: 'Bot 1',
      publishedStackName: 'ApiPublishmentStackBot1',
      publishedDatetime: new Date(),
      available: true,
      sharedStatus: '',
      sharedScope: 'all' as SharedScope,
      owned: false,
    },
    {
      id: '2',
      title: 'Bot 1 Disabled',
      description: '',
      publishedStackName: 'ApiPublishmentStackBot1',
      publishedDatetime: new Date(),
      available: false,
      sharedStatus: '',
      sharedScope: 'all' as SharedScope,
      owned: false,
    },
  ];
  return (
    <div className="h-4/5 overflow-x-hidden overflow-y-scroll border-b border-gray pr-1 scrollbar-thin">
      {botApis?.map((api, idx) => (
        <ListItemBot key={idx} bot={api} onClick={() => {}}>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs">{api.publishedStackName}</div>
            <div className="text-xs">
              <div className="mr-1 inline font-bold">
                {t('admin.apiManagement.label.publishedDate')}:
              </div>
              {formatDatetime(api.publishedDatetime)}
            </div>
          </div>
        </ListItemBot>
      ))}
    </div>
  );
};

export const Analytics = () => {
  const { t } = useTranslation();
  const sortedBots = [
    {
      id: '1',
      title: 'Bot 1',
      description: 'Bot 1',
      totalPrice: 10.0,
      publishedDatetime: new Date(),
      isPublished: true,
      available: true,
      sharedStatus: '',
      sharedScope: 'all' as SharedScope,
      owned: false,
    },
    {
      id: '2',
      title: 'Bot 2',
      description: 'Bot 2',
      totalPrice: 5.0,
      publishedDatetime: new Date(),
      isPublished: false,
      available: true,
      sharedStatus: '',
      sharedScope: 'all' as SharedScope,
      owned: false,
    },
    {
      id: '3',
      title: 'Bot 1 Disabled',
      description: '',
      totalPrice: 10.0,
      publishedDatetime: new Date(),
      isPublished: true,
      available: false,
      sharedStatus: '',
      sharedScope: 'all' as SharedScope,
      owned: false,
    },
    {
      id: '4',
      title: 'Bot 2 Disabled',
      description: '',
      totalPrice: 5.0,
      publishedDatetime: new Date(),
      isPublished: false,
      available: false,
      sharedStatus: '',
      sharedScope: 'all' as SharedScope,
      owned: false,
    },
  ];
  return (
    <div className="h-4/5 overflow-x-hidden overflow-y-scroll border-b border-gray pr-1 scrollbar-thin">
      {sortedBots?.map((bot, idx) => (
        <ListItemBot key={idx} bot={bot} onClick={() => {}}>
          <div className="relative flex h-full items-center">
            <div className="text-lg font-bold">
              {(Math.floor(bot.totalPrice * 100) / 100).toFixed(2)} USD
            </div>

            <div className="absolute bottom-0 right-0 flex origin-bottom-right whitespace-nowrap text-xs font-light">
              {bot.isPublished ? (
                <>
                  {bot.isPublished
                    ? t('admin.botAnalytics.label.published')
                    : null}
                </>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </ListItemBot>
      ))}
    </div>
  );
};
