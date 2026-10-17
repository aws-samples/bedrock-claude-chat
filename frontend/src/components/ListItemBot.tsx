import { ReactNode } from 'react';
import { BaseProps } from '../@types/common';
import { useTranslation } from 'react-i18next';
import IconPinnedBot from './IconPinnedBot';
import IconShareBot from './IconShareBot';
import { SharedScope } from '../@types/bot';
import { twMerge } from 'tailwind-merge';
import { isPinnedBot } from '../utils/BotUtils';

type Props = BaseProps & {
  bot: {
    id: string;
    title: string;
    description: string;
    available: boolean;
    owned: boolean;
    sharedStatus: string;
    sharedScope: SharedScope;
  };
  onClick: (botId: string) => void;
  children: ReactNode;
};

const ListItemBot: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  return (
    <div
      key={props.bot.id}
      className={`${
        props.className ?? ''
      } relative flex w-full justify-between border-b border-light-gray dark:border-dark-gray`}>
      <div
        className={`h-full grow overflow-hidden bg-aws-paper-light p-2 dark:bg-aws-paper-dark ${
          props.bot.available
            ? 'cursor-pointer hover:brightness-90'
            : 'text-aws-font-color-light/30 dark:text-aws-font-color-dark/30'
        }`}
        onClick={() => {
          if (props.bot.available) {
            props.onClick(props.bot.id);
          }
        }}>
        <div className="flex w-full flex-nowrap items-center gap-1 whitespace-nowrap text-sm font-semibold">
          <IconPinnedBot
            botSharedStatus={props.bot.sharedStatus}
            className=" shrink-0 text-aws-aqua"
          />

          {!props.bot.owned && !isPinnedBot(props.bot.sharedStatus) && (
            <div>
              <IconShareBot sharedScope={props.bot.sharedScope} />
            </div>
          )}
          <div
            className={twMerge(
              props.bot.available
                ? 'dark:text-aws-font-color-dark'
                : 'dark:text-aws-font-color-gray'
            )}>
            {props.bot.title}
          </div>
        </div>
        {props.bot.description ? (
          <div className="mt-1 truncate pr-12 text-xs text-dark-gray dark:text-light-gray">
            {props.bot.available
              ? props.bot.description
              : t('bot.label.notAvailable')}
          </div>
        ) : (
          <div className="mt-1 truncate pr-12 text-xs italic text-gray dark:text-aws-font-color-gray">
            {t('bot.label.noDescription')}
          </div>
        )}
      </div>

      <div className="absolute right-0 flex h-full justify-between">
        <div className="w-10 bg-linear-to-r from-transparent to-aws-paper-light dark:to-aws-paper-dark"></div>
        <div className="flex items-center gap-2 bg-aws-paper-light pl-2 dark:bg-aws-paper-dark dark:text-aws-font-color-dark">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default ListItemBot;
