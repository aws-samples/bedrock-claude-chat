import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import { BaseProps } from '../@types/common';
import Button from './Button';
import ModalDialog from './ModalDialog';
import { Trans, useTranslation } from 'react-i18next';
import { SharedScope } from '../@types/bot';
import Toggle from './Toggle';
import { copyBotUrl, getBotUrl, isPinnedBot } from '../utils/BotUtils';
import RadioButton from './RadioButton';
import InputText from './InputText';
import { PiMagnifyingGlass, PiSpinner } from 'react-icons/pi';
import DialogShareBotPermission from './DialogShareBotPermission';
import { getShareText } from '../utils/shareUtils';
import Alert from './Alert';

type Props = BaseProps & {
  isOpen: boolean;
  isLoading?: boolean;
  isPublication?: boolean;
  botId?: string;
  sharedScope?: SharedScope;
  sharedStatus?: string;
  allowedUserIds?: string[];
  allowedGroupIds?: string[];
  onChangeSharedScope: (sharedScope: SharedScope) => void;
  onUpdateAllowedUserAndGroup: (
    allowedUserIds: string[],
    allowedGroupIds: string[]
  ) => void;
  onClose: () => void;
};

const DialogShareBot: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const [labelCopy, setLabelCopy] = useState(t('bot.button.copy'));
  const [isPermissionManagement, setIsPermissionManagement] = useState(false);
  const [searchUsersPrefix, setSearchUsersPrefix] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isShared = useMemo(() => {
    return props.sharedScope ? props.sharedScope !== 'private' : false;
  }, [props.sharedScope]);

  const url = useMemo(() => {
    return getBotUrl(props.botId ?? '');
  }, [props.botId]);

  const onClickCopy = useCallback(() => {
    copyBotUrl(props.botId ?? '');
    setLabelCopy(t('bot.button.copied'));

    setTimeout(() => {
      setLabelCopy(t('bot.button.copy'));
    }, 3000);
  }, [props.botId, t]);

  // clear search input when close dialog
  useEffect(() => {
    if (!props.isOpen) {
      setSearchUsersPrefix('');
      setIsPermissionManagement(false);
    }
  }, [props.isOpen]);

  // focus search input
  useEffect(() => {
    if (isPermissionManagement && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isPermissionManagement]);

  // stay focus search input when input
  const handleSearchPrefixChange = (value: string) => {
    setSearchUsersPrefix(value);
    if (!isPermissionManagement) {
      setIsPermissionManagement(true);
    }
  };

  const isPinned = useMemo(() => {
    return isPinnedBot(props.sharedStatus ?? '');
  }, [props.sharedStatus]);

  const disabled = useMemo(() => {
    return (isPinned || props.isPublication) && !props.isLoading;
  }, [isPinned, props.isLoading, props.isPublication]);

  return (
    <ModalDialog
      {...props}
      title={
        isPermissionManagement
          ? t('bot.shareDialog.label.memberManagement')
          : t('bot.shareDialog.title')
      }>
      {isPermissionManagement && (
        <DialogShareBotPermission
          allowedGroupIds={props.allowedGroupIds ?? []}
          allowedUserIds={props.allowedUserIds ?? []}
          searchUsersPrefix={searchUsersPrefix}
          onChangeSearchUsersPrefix={handleSearchPrefixChange}
          onUpdateAllowedUserAndGroup={(userIds, groupIds) => {
            props.onUpdateAllowedUserAndGroup(userIds, groupIds);
            setIsPermissionManagement(false);
          }}
          onCancel={() => {
            setSearchUsersPrefix('');
            setIsPermissionManagement(false);
          }}
        />
      )}
      {props.isLoading && (
        <div className="flex h-32 items-center justify-center">
          <PiSpinner className="animate-spin text-6xl" />
        </div>
      )}

      {disabled && (
        <Alert
          title={
            isPinned
              ? t('error.share.markedEssential.title')
              : t('error.share.publication.title')
          }
          className="mb-2"
          severity="warning">
          {isPinned
            ? t('error.share.markedEssential.content')
            : t('error.share.publication.content')}
        </Alert>
      )}

      {!isPermissionManagement && !props.isLoading && (
        <>
          <div className="flex w-full items-center">
            <div className="w-full">{t('bot.shareDialog.switchLabel')}</div>

            <Toggle
              value={isShared}
              disabled={disabled}
              onChange={() => {
                props.onChangeSharedScope(isShared ? 'private' : 'all');
              }}
            />
          </div>

          {isShared && (
            <>
              <div className="-mb-1">
                {t('bot.shareDialog.label.selectShare')}
              </div>
              <div className="flex gap-3">
                <RadioButton
                  name="shared-scope"
                  label={t('bot.shareDialog.label.all')}
                  checked={props.sharedScope === 'all'}
                  value=""
                  disabled={disabled}
                  onChange={() => {
                    props.onChangeSharedScope('all');
                  }}
                />
                <RadioButton
                  name="shared-scope"
                  label={t('bot.shareDialog.label.partial')}
                  checked={props.sharedScope === 'partial'}
                  value=""
                  disabled={disabled}
                  onChange={() => {
                    props.onChangeSharedScope('partial');
                  }}
                />
              </div>
            </>
          )}

          {props.sharedScope === 'partial' && (
            <>
              <div className="flex flex-col gap-1">
                <InputText
                  value={searchUsersPrefix}
                  placeholder={t('bot.shareDialog.label.search')}
                  icon={<PiMagnifyingGlass />}
                  disabled={disabled}
                  onChange={(s) => {
                    setSearchUsersPrefix(s);
                    setIsPermissionManagement(true);
                  }}
                />
              </div>

              <div className="my-3 flex items-center justify-between">
                <div className="font-bold">
                  {getShareText(
                    props.allowedUserIds?.length ?? 0,
                    props.allowedGroupIds?.length ?? 0
                  )}
                </div>
                <Button
                  outlined
                  onClick={() => {
                    setIsPermissionManagement(true);
                  }}>
                  {t('bot.shareDialog.button.manage')}
                </Button>
              </div>
            </>
          )}

          <div className="my-3 flex w-full items-center text-xs">
            <div className="w-full">
              {props.sharedScope === 'private' ? (
                t('bot.shareDialog.off.content')
              ) : (
                <Trans
                  i18nKey="bot.shareDialog.on.content"
                  components={{
                    Link: (
                      <a
                        href="/bot/discover"
                        className="italic text-aws-sea-blue-light underline dark:text-aws-sea-blue-dark"
                      />
                    ),
                  }}
                />
              )}
            </div>
          </div>

          {isShared && (
            <>
              <div className="text-xs">
                {t('bot.shareDialog.on.linkDescription')}
              </div>
              <div className="mt-1 flex justify-between rounded-sm border border-aws-squid-ink-light/50 bg-aws-paper-light dark:border-dark-gray dark:bg-aws-paper-dark">
                <input
                  type="text"
                  className="my-2 ml-2 w-full bg-aws-paper-light dark:bg-aws-paper-dark"
                  readOnly
                  value={url}
                />
                <Button
                  outlined
                  className="rounded-none rounded-r-sm border-0 border-l bg-white dark:bg-aws-squid-ink-dark"
                  onClick={onClickCopy}>
                  {labelCopy}
                </Button>
              </div>
            </>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={props.onClose} className="p-2">
              {t('button.done')}
            </Button>
          </div>
        </>
      )}
    </ModalDialog>
  );
};

export default DialogShareBot;
