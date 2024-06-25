import { useState } from 'react';
import { PiQuestion } from 'react-icons/pi';
import ModalDialog from '../../../components/ModalDialog';
import { useTranslation } from 'react-i18next';
import Bowser from 'bowser';
export const BottomHelper = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const browser = Bowser.getParser(window.navigator.userAgent);
  const os = browser.getOSName();
  const isWindows = os === 'Windows';
  return (
    <>
      <div className="fixed bottom-3 right-3">
        <PiQuestion
          className="cursor-pointer"
          onClick={() => setIsOpen(() => true)}
          size={24}
        />
      </div>
      <ModalDialog
        title={t('heler.shortcuts.title')}
        isOpen={isOpen}
        onClose={() => setIsOpen(() => false)}>
        <div className="flex items-center justify-between overflow-hidden">
          <div className="flex shrink items-center overflow-hidden text-sm">
            <div className="truncate">{t('heler.shortcuts.items.newChat')}</div>
          </div>
          <div className="ml-3 flex flex-row gap-2">
            <div className="my-2 flex h-8 min-w-[32px] items-center justify-center rounded-md border capitalize">
              <span className="text-sm">{isWindows ? 'Ctrl' : '⌘'}</span>
            </div>
            <div className="my-2 flex h-8 min-w-[50px] items-center justify-center rounded-md border capitalize">
              <span className="text-xs">Shift</span>
            </div>
            <div className="my-2 flex h-8 min-w-[32px] items-center justify-center rounded-md border capitalize">
              <span className="text-sm">o</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between overflow-hidden">
          <div className="flex shrink items-center overflow-hidden text-sm">
            <div className="truncate">
              {t('heler.shortcuts.items.focusInput')}
            </div>
          </div>
          <div className="ml-3 flex flex-row gap-2">
            <div className="my-2 flex h-8 min-w-[50px] items-center justify-center rounded-md border capitalize">
              <span className="text-xs">Shift</span>
            </div>
            <div className="my-2 flex h-8 min-w-[32px] items-center justify-center rounded-md border capitalize">
              <span className="text-xs">Esc</span>
            </div>
          </div>
        </div>
      </ModalDialog>
    </>
  );
};
