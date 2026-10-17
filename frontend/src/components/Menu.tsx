import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import {
  PiList,
  PiSidebar,
  PiSignOut,
  PiTranslate,
  PiTrash,
} from 'react-icons/pi';
import { useTranslation } from 'react-i18next';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';
import useLoginUser from '../hooks/useLoginUser';
import { IoMoonSharp, IoSunnyOutline } from 'react-icons/io5';
import useLocalStorage from '../hooks/useLocalStorage';
import Toggle from './Toggle';

type Props = BaseProps & {
  onSignOut: () => void;
  onSelectLanguage: () => void;
  onClickDrawerOptions: () => void;
  onClearConversations: () => void;
};

const MenuSettings: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const { userGroups, userName } = useLoginUser();

  const [isOpen, setIsOpen] = useState(false);
  // If you want to add a theme, change the type from boolean to string and change the UI from pulldown.
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClickOutside = (event: any) => {
      // メニューボタンとメニュー以外をクリックしていたらメニューを閉じる
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    if (theme === 'dark') {
      setIsDarkTheme(true);
    }
  }, [theme]);

  const changeTheme = (isDarkTheme: boolean) => {
    setIsDarkTheme(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.className = 'dark';
      setTheme('dark');
    } else {
      document.documentElement.className = 'light';
      setTheme('light');
    }
  };

  return (
    <>
      <Button
        ref={buttonRef}
        className={twMerge(
          'relative bg-aws-squid-ink-light dark:bg-aws-squid-ink-dark',
          props.className
        )}
        text
        icon={<PiList />}
        onClick={() => {
          setIsOpen(!isOpen);
        }}>
        {t('button.menu')}
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-10 left-2 w-60 rounded-sm border border-aws-font-color-white-light bg-aws-sea-blue-light text-aws-font-color-white-light dark:border-aws-font-color-white-dark dark:bg-aws-ui-color-dark dark:text-aws-font-color-white-dark">
          <div className="flex flex-col gap-1 border-b p-2">
            <div className="font-bold">{userName}</div>
            <div className="">
              <div className="italic">{t('app.userGroups')}</div>
              <ul className="list-disc pl-5">
                {userGroups.map((group) => (
                  <li key={group}>{group}</li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="flex w-full cursor-pointer items-center p-2 hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark"
            onClick={() => {
              setIsOpen(false);
              props.onClickDrawerOptions();
            }}>
            <PiSidebar className="mr-2" />
            {t('button.drawerOption')}
          </div>

          <div
            className="flex w-full cursor-pointer items-center p-2 hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark"
            onClick={() => {
              setIsOpen(false);
              props.onSelectLanguage();
            }}>
            <PiTranslate className="mr-2" />
            {t('button.language')}
          </div>

          <div className="flex w-full items-center px-2 hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark">
            {isDarkTheme ? (
              <IoMoonSharp className="mr-2" />
            ) : (
              <IoSunnyOutline className="mr-2" />
            )}
            <div className="flex w-full items-center justify-between">
              <span>{t('button.mode')}</span>
              <Toggle
                value={isDarkTheme}
                onChange={(isDarkTheme) => {
                  changeTheme(isDarkTheme);
                }}
              />
            </div>
          </div>
          <div
            className="flex w-full cursor-pointer items-center border-t p-2 hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark"
            onClick={() => {
              setIsOpen(false);
              props.onClearConversations();
            }}>
            <PiTrash className="mr-2" />
            {t('button.clearConversation')}
          </div>
          <div
            className="flex w-full cursor-pointer items-center border-t p-2 hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark"
            onClick={props.onSignOut}>
            <PiSignOut className="mr-2" />
            {t('button.signOut')}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuSettings;
