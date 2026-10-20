import type { Meta } from '@storybook/react-vite';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonPopover from './PopoverMenu';
import PopoverItem from './PopoverItem';
import { PiPencilLine, PiLink, PiStarFill, PiStar } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';
import StatusSyncBot from './StatusSyncBot';

export default { component: ButtonPopover } satisfies Meta<
  typeof ButtonPopover
>;

export const ChatHeader = () => {
  const { t } = useTranslation();
  const [IsStarred, togglePinned] = useReducer((current) => !current, true);
  return (
    <div className="flex items-center bg-aws-paper-light dark:bg-aws-paper-dark">
      <StatusSyncBot syncStatus="SUCCEEDED" onClickError={() => {}} />
      <ButtonIcon onClick={togglePinned}>
        {IsStarred ? <PiStarFill className="text-aws-aqua" /> : <PiStar />}
      </ButtonIcon>
      <ButtonPopover
        className="mx-1 dark:text-aws-font-color-dark"
        target="bottom-right">
        <PopoverItem onClick={() => {}}>
          <PiPencilLine />
          {t('bot.titleSubmenu.edit')}
        </PopoverItem>
        <PopoverItem onClick={() => {}}>
          <PiLink />
          {t('bot.titleSubmenu.copyLink')}
        </PopoverItem>
      </ButtonPopover>
    </div>
  );
};
