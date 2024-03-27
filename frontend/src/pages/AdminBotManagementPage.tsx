import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import { useParams } from 'react-router-dom';
import { PiArrowSquareOut, PiCaretLeft, PiFile } from 'react-icons/pi';
import Textarea from '../components/Textarea';

import ButtonIcon from '../components/ButtonIcon';
import { getBotUrl } from '../utils/BotUtils';
import useBotApiSettingsForAdmin from '../hooks/useBotApiSettingsForAdmin';
import ApiKeyItem from '../components/ApiKeyItem';

import DialogConfirmDeleteApi from '../components/DialogConfirmDeleteApi';
import useSnackbar from '../hooks/useSnackbar';
import ButtonCopy from '../components/ButtonCopy';
import Skeleton from '../components/Skeleton';
import Alert from '../components/Alert';

const AdminBotManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { botId } = useParams();

  const {
    bot,
    botPublication,
    isLoadingBot,
    isLoadingBotPublication,
    deleteBotPublication,
    mutateBotPublication,
  } = useBotApiSettingsForAdmin(botId ?? '');

  const hasSourceUrls = useMemo(() => {
    return bot ? bot.knowledge.sourceUrls.length > 0 : false;
  }, [bot]);

  const hasFiles = useMemo(() => {
    return bot ? bot.knowledge.filenames.length > 0 : false;
  }, [bot]);

  const isSetThrottle = useMemo(() => {
    return (
      botPublication?.throttle.burstLimit || botPublication?.throttle.rateLimit
    );
  }, [botPublication?.throttle.burstLimit, botPublication?.throttle.rateLimit]);

  const isSetQuota = useMemo(() => {
    return botPublication?.quota.limit;
  }, [botPublication?.quota.limit]);

  const displayQuotaPeriod = useMemo(() => {
    switch (botPublication?.quota.period) {
      case 'DAY':
        return t('bot.apiSettings.label.period.day');
      case 'WEEK':
        return t('bot.apiSettings.label.period.week');
      case 'MONTH':
        return t('bot.apiSettings.label.period.month');
      default:
        return '';
    }
  }, [botPublication?.quota.period, t]);

  const { open } = useSnackbar();
  const [isOpenDeleteApiDialog, setIsOpenDeleteApiDialog] = useState(false);
  const [isDeletingApi, setIsDeletingApi] = useState(false);
  const deleteApi = useCallback(() => {
    setIsDeletingApi(true);
    deleteBotPublication()
      .then(() => {
        mutateBotPublication(undefined);
        setIsOpenDeleteApiDialog(false);
      })
      .catch(() => {
        open(t('bot.error.failDeleteApi'));
      })
      .finally(() => {
        setIsDeletingApi(true);
      });
  }, [deleteBotPublication, mutateBotPublication, open, t]);

  const onClickBack = useCallback(() => {
    history.back();
  }, []);

  return (
    <>
      <DialogConfirmDeleteApi
        isOpen={isOpenDeleteApiDialog}
        loading={isDeletingApi}
        onDelete={deleteApi}
        onClose={() => {
          setIsOpenDeleteApiDialog(false);
        }}
      />
      <div className="mb-20 flex justify-center">
        <div className="w-2/3">
          <div className="mt-5 w-full">
            <div className="text-xl font-bold">
              {t('admin.botManagement.label.pageTitle')}
            </div>

            {isLoadingBot && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-6" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {!isLoadingBot && (
              <>
                <div className="mt-3 flex flex-col gap-1">
                  <div className="text-lg font-bold">{bot?.title}</div>
                  {bot?.description ? (
                    <div className="text-sm text-aws-font-color/50">
                      {bot?.description}
                    </div>
                  ) : (
                    <div className="text-sm font-light italic text-aws-font-color/50">
                      {t('bot.label.noDescription')}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-dark-gray">
                    {t('admin.botManagement.label.sharedUrl')}:
                    <div
                      className="flex cursor-pointer items-center text-aws-sea-blue underline hover:text-aws-sea-blue-hover"
                      onClick={() => {
                        window.open(getBotUrl(bot?.id ?? ''), '_blank');
                      }}>
                      <div className="mx-1">{getBotUrl(bot?.id ?? '')} </div>
                      <PiArrowSquareOut />
                    </div>
                  </div>

                  <div className="mt-2">
                    <Textarea
                      label={t('bot.item.instruction')}
                      rows={5}
                      value={bot?.instruction}
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-1">
                  <div className="text-base font-bold">
                    {t('bot.label.knowledge')}
                  </div>
                  {!hasSourceUrls && !hasFiles && (
                    <div className="italic text-dark-gray">
                      {t('admin.botManagement.label.noKnowledge')}
                    </div>
                  )}

                  {hasSourceUrls && (
                    <div>
                      <div className="text-sm text-dark-gray">
                        {t('bot.label.url')}
                      </div>
                      <div className="flex w-full flex-col gap-1">
                        {bot?.knowledge.sourceUrls.map((url, idx) => (
                          <div className="flex w-full gap-2" key={idx}>
                            <InputText
                              className="w-full"
                              type="url"
                              disabled
                              value={url}
                            />
                            <ButtonIcon
                              className="text-aws-sea-blue"
                              onClick={() => {
                                window.open(url, '_blank');
                              }}>
                              <PiArrowSquareOut />
                            </ButtonIcon>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasFiles && (
                    <div>
                      <div className="text-sm text-dark-gray">
                        {t('bot.label.file')}
                      </div>
                      <div className="flex w-full flex-col gap-1">
                        {bot?.knowledge.filenames.map((filename, idx) => (
                          <div
                            key={idx}
                            className="rounded border border-gray p-1 py-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 break-all px-1">
                                <PiFile className="w-5" />
                                <div>{filename}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {isLoadingBotPublication && (
              <div className="mt-2 flex flex-col gap-2">
                <Skeleton className="h-6" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {!isLoadingBotPublication && (
              <div className="mt-3 flex flex-col gap-1">
                <div className="text-lg font-bold">
                  {t('admin.botManagement.label.apiSettings')}
                </div>

                {!botPublication && (
                  <div className="italic text-dark-gray">
                    {t('admin.botManagement.label.notPublishApi')}
                  </div>
                )}
                {botPublication && (
                  <div className="flex flex-col gap-2">
                    <div>
                      <div className="text-base font-bold">
                        {t('admin.botManagement.label.deployStatus')}
                      </div>

                      <div className="flex flex-col gap-1">
                        <InputText
                          className="w-full"
                          disabled
                          label={t('admin.botManagement.label.cfnStatus')}
                          value={botPublication.cfnStatus}
                        />
                        <InputText
                          className="w-full"
                          disabled
                          label={t('admin.botManagement.label.codebuildStatus')}
                          value={botPublication.codebuildStatus}
                        />
                        <InputText
                          className="w-full"
                          disabled
                          label={t('admin.botManagement.label.codeBuildId')}
                          value={botPublication.codebuildId}
                        />
                        <div className="flex items-end">
                          <InputText
                            className="w-full"
                            label={t('bot.apiSettings.label.endpoint')}
                            value={botPublication.endpoint}
                            disabled
                          />
                          <ButtonCopy text={botPublication.endpoint} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-base font-bold">
                        {t('bot.apiSettings.label.apiKeys')}
                      </div>
                      <div className="text-sm text-aws-font-color/50">
                        {t('bot.apiSettings.help.apiKeys')}
                      </div>

                      {botPublication.apiKeyIds.length === 0 && (
                        <Alert
                          className="mt-1"
                          severity="warning"
                          title={t(
                            'admin.botManagement.alert.noApiKeys.title'
                          )}>
                          {t('admin.botManagement.alert.noApiKeys.body')}
                        </Alert>
                      )}
                      <div className="mt-1 flex flex-col gap-1">
                        {botPublication.apiKeyIds.map((keyId) => (
                          <ApiKeyItem
                            key={keyId}
                            botId={botId ?? ''}
                            apiKeyId={keyId}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-base font-bold">
                        {t('bot.apiSettings.label.usagePlan')}
                      </div>
                      <div className="text-sm text-aws-font-color/50">
                        {t('bot.apiSettings.help.usagePlan')}
                      </div>

                      <div className="mt-1 rounded border border-aws-font-color/50 p-2">
                        <div className="flex text-sm">
                          {t('bot.apiSettings.item.throttling')}:
                          <div className="ml-1 font-bold">
                            {isSetThrottle
                              ? t('admin.botManagement.label.usagePlanOn')
                              : t('admin.botManagement.label.usagePlanOff')}
                          </div>
                        </div>

                        {isSetThrottle && (
                          <ul className="ml-8 list-disc">
                            <li>
                              <Trans
                                i18nKey="admin.botManagement.label.rateLimit"
                                values={{
                                  limit: botPublication.throttle.rateLimit,
                                }}
                                components={{
                                  Bold: <div className="inline font-bold" />,
                                }}
                              />
                            </li>
                            <li>
                              <Trans
                                i18nKey="admin.botManagement.label.burstLimit"
                                values={{
                                  limit: botPublication.throttle.burstLimit,
                                }}
                                components={{
                                  Bold: <div className="inline font-bold" />,
                                }}
                              />
                            </li>
                          </ul>
                        )}

                        <div className="my-2 border-t border-aws-font-color/50"></div>

                        <div className="flex text-sm">
                          {t('bot.apiSettings.item.quota')}:
                          <div className="ml-1 font-bold">
                            {isSetQuota
                              ? t('admin.botManagement.label.usagePlanOn')
                              : t('admin.botManagement.label.usagePlanOff')}
                          </div>
                        </div>

                        {isSetQuota && (
                          <ul className="ml-8 list-disc">
                            <li>
                              <Trans
                                i18nKey="admin.botManagement.label.requestsLimit"
                                values={{
                                  limit: botPublication.quota.limit,
                                  period: displayQuotaPeriod,
                                }}
                                components={{
                                  Bold: <div className="inline font-bold" />,
                                }}
                              />
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>

                    <div>
                      <div>
                        <div className="text-base font-bold">
                          {t('bot.apiSettings.label.allowOrigins')}
                        </div>
                        <div className="text-sm text-aws-font-color/50">
                          <div>{t('bot.apiSettings.help.allowOrigins')}</div>
                        </div>
                      </div>

                      <div className="mt-1 flex w-full flex-col gap-1">
                        {botPublication.allowedOrigins.map((url, idx) => (
                          <div className="flex w-full gap-2" key={idx}>
                            <InputText
                              className="w-full"
                              type="url"
                              disabled
                              value={url}
                            />
                            <ButtonIcon
                              className="text-aws-sea-blue"
                              onClick={() => {
                                window.open(url, '_blank');
                              }}>
                              <PiArrowSquareOut />
                            </ButtonIcon>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 flex justify-between">
              <Button outlined icon={<PiCaretLeft />} onClick={onClickBack}>
                {t('button.back')}
              </Button>

              {!isLoadingBotPublication && botPublication && (
                <Button
                  className="bg-red"
                  onClick={() => {
                    setIsOpenDeleteApiDialog(true);
                  }}>
                  {t('admin.botManagement.button.deleteApi')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBotManagementPage;
