import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import { useParams } from 'react-router-dom';
import { PiCaretLeft, PiPlus, PiTrash } from 'react-icons/pi';
import useBotApiSettings from '../hooks/useBotApiSettings';
import Alert from '../components/Alert';
import Skeleton from '../components/Skeleton';
import Toggle from '../components/Toggle';
import Select from '../components/Select';
import { QuotaPeriod } from '../@types/api-publication';
import i18next from 'i18next';
import ButtonIcon from '../components/ButtonIcon';
import { twMerge } from 'tailwind-merge';
import { produce } from 'immer';
import useErrorMessage from '../hooks/useErrorMessage';
import ButtonCopy from '../components/ButtonCopy';
import ApiKeyItem from '../components/ApiKeyItem';
import DialogConfirmAddApiKey from '../components/DialogConfirmAddApiKey';
import Help from '../components/Help';
import DialogConfirmDeleteApi from '../components/DialogConfirmDeleteApi';
import useSnackbar from '../hooks/useSnackbar';

const PERIOD_OPTIONS: {
  label: string;
  value: QuotaPeriod;
}[] = [
  {
    label: i18next.t('bot.label.apiSettings.period.day'),
    value: 'DAY',
  },
  {
    label: i18next.t('bot.label.apiSettings.period.week'),
    value: 'WEEK',
  },
  {
    label: i18next.t('bot.label.apiSettings.period.month'),
    value: 'MONTH',
  },
];

const BotApiSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { botId } = useParams();

  const {
    myBot,
    isLoadingMyBot,
    botPublication,
    isLoadingBotPublication,
    isUnpublishedBot,
    shareBot,
    publishBot,
    createApiKey,
    mutateBotPublication,
    deleteBotPublication,
  } = useBotApiSettings(botId ?? '');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShare, setIsLoadingShare] = useState(false);

  const onClickShare = useCallback(() => {
    setIsLoadingShare(true);
    shareBot().finally(() => {
      setIsLoadingShare(false);
    });
  }, [shareBot]);

  const isDeploying = useMemo(() => {
    return botPublication?.codebuildStatus === 'IN_PROGRESS';
  }, [botPublication?.codebuildStatus]);

  const hasShared = useMemo(() => {
    return !!myBot?.isPublic;
  }, [myBot?.isPublic]);

  const [hasCreated, setHasCreated] = useState(false);

  const [enabledThtottle, setEnabledThtottle] = useState(true);
  const [enabledQuota, setEnabledQuota] = useState(true);

  const [rateLimit, setRateLimit] = useState<null | number>(null);
  const [burstLimit, setBurstLimit] = useState<null | number>(null);
  const [requestLimit, setRequestLimit] = useState<null | number>(null);
  const [period, setPeriod] = useState<QuotaPeriod>('MONTH');

  const {
    errorMessages,
    setErrorMessage,
    clearAll: clearErrorMessages,
  } = useErrorMessage();

  const [origins, setOrigins] = useState<string[]>(['']);
  const onClickAddOrigin = useCallback(() => {
    setOrigins(
      produce(origins, (draft) => {
        draft.push('');
      })
    );
  }, [origins]);
  const onClickRemoveOrigin = useCallback(
    (index: number) => {
      if (origins.length === 1) {
        setOrigins(['']);
      } else if (origins.length > index) {
        setOrigins(
          produce(origins, (draft) => {
            draft.splice(index, 1);
          })
        );
      }
    },
    [origins]
  );

  const fillApiSettings = useCallback(() => {
    if (!botPublication) {
      return;
    }
    setHasCreated(true);
    setEnabledThtottle(!!botPublication.throttle);
    setEnabledQuota(!!botPublication.quota);
    setRateLimit(botPublication.throttle.rateLimit);
    setBurstLimit(botPublication.throttle.burstLimit);
    setRequestLimit(botPublication.quota.limit);
    setPeriod(botPublication.quota.period ?? 'MONTH');
    setOrigins(botPublication.allowedOrigins);
  }, [botPublication]);

  const clearApiSettings = useCallback(() => {
    setHasCreated(false);
    setEnabledThtottle(true);
    setEnabledQuota(true);
    setRateLimit(null);
    setBurstLimit(null);
    setRequestLimit(null);
    setPeriod('MONTH');
    setOrigins(['']);
  }, []);

  useEffect(() => {
    if (!botPublication) {
      return;
    }

    if (botPublication.cfnStatus === 'CREATE_COMPLETE') {
      fillApiSettings();
    }
  }, [botPublication, fillApiSettings]);

  const onClickCreate = useCallback(() => {
    clearErrorMessages();

    let hasError = false;
    if (enabledThtottle && !rateLimit) {
      setErrorMessage('rateLimit', t('input.validationError.required'));
      hasError = true;
    }
    if (enabledThtottle && !burstLimit) {
      setErrorMessage('burstLimit', t('input.validationError.required'));
      hasError = true;
    }
    if (enabledQuota && !requestLimit) {
      setErrorMessage('requestLimit', t('input.validationError.required'));
      hasError = true;
    }
    origins.forEach((origin, idx) => {
      if (origin === '') {
        setErrorMessage(`origins${idx}`, t('input.validationError.required'));
        hasError = true;
      } else if (
        !/^(https?:\/\/)?([a-zA-Z0-9\\-\\.]+)(:(\d+))?$/.test(origin)
      ) {
        setErrorMessage(
          `origins${idx}`,
          t('input.validationError.invalidOriginFormat')
        );
        hasError = true;
      }
    });

    if (!hasError) {
      setIsLoading(true);
      publishBot({
        allowedOrigins: origins,
        quota: enabledQuota
          ? {
              limit: requestLimit!,
              offset: 0,
              period,
            }
          : undefined,
        throttle: enabledThtottle
          ? {
              burstLimit: burstLimit!,
              rateLimit: rateLimit!,
            }
          : undefined,
      })
        .then(() => {
          mutateBotPublication();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [
    burstLimit,
    clearErrorMessages,
    enabledQuota,
    enabledThtottle,
    mutateBotPublication,
    origins,
    period,
    publishBot,
    rateLimit,
    requestLimit,
    setErrorMessage,
    t,
  ]);

  const onClickBack = useCallback(() => {
    history.back();
  }, []);

  const isInitialLoading = useMemo(() => {
    // If the Bot is not Published, do not show the Loading indicator when searching for BotPublish again.
    return isLoadingMyBot || (isLoadingBotPublication && !isUnpublishedBot);
  }, [isLoadingBotPublication, isLoadingMyBot, isUnpublishedBot]);

  const disabledCreate = useMemo(() => {
    return isLoading || hasCreated || isDeploying;
  }, [hasCreated, isLoading, isDeploying]);

  const [isOpenAddApiKeyDialog, setIsOpenAddApiKeyDialog] = useState(false);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const onClickCreateApiKey = useCallback(() => {
    setIsOpenAddApiKeyDialog(true);
  }, []);
  const addApiKey = useCallback(
    (description: string) => {
      setIsAddingApiKey(true);
      createApiKey(description)
        .then(() => {
          setIsOpenAddApiKeyDialog(false);
        })
        .finally(() => {
          mutateBotPublication();
          setIsAddingApiKey(false);
        });
    },
    [createApiKey, mutateBotPublication]
  );

  const { open } = useSnackbar();
  const [isOpenDeleteApiDialog, setIsOpenDeleteApiDialog] = useState(false);
  const deleteApi = useCallback(() => {
    clearApiSettings();
    setIsOpenDeleteApiDialog(false);
    deleteBotPublication().catch(() => {
      fillApiSettings();
      open(t('bot.error.failDeleteApi'));
    });
  }, [clearApiSettings, deleteBotPublication, fillApiSettings, open, t]);

  return (
    <>
      <DialogConfirmAddApiKey
        isOpen={isOpenAddApiKeyDialog}
        loading={isAddingApiKey}
        onAdd={addApiKey}
        onClose={() => {
          setIsOpenAddApiKeyDialog(false);
        }}
      />
      <DialogConfirmDeleteApi
        isOpen={isOpenDeleteApiDialog}
        onDelete={deleteApi}
        onClose={() => {
          setIsOpenDeleteApiDialog(false);
        }}
      />
      <div className="mb-20 flex justify-center">
        <div className="w-2/3">
          <div className="mt-5 w-full">
            <div className="flex items-center gap-1">
              <div className="text-xl font-bold">
                {t('bot.apiSettings.pageTitle')}
              </div>
              <Help message={t('bot.help.apiSettings.overview')} />
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {isInitialLoading ? (
                <div className="flex flex-col gap-3">
                  <Skeleton />
                  <Skeleton className="w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="text-lg font-bold">{myBot?.title}</div>
                    {myBot?.description ? (
                      <div className="text-sm text-aws-font-color/50">
                        {myBot?.description}
                      </div>
                    ) : (
                      <div className="text-sm font-light italic text-aws-font-color/50">
                        {t('bot.label.noDescription')}
                      </div>
                    )}
                  </div>

                  {isDeploying && (
                    <Alert
                      severity="info"
                      title={t('bot.alert.apiSettings.deploying.title')}>
                      <div>{t('bot.alert.apiSettings.deploying.body')}</div>
                    </Alert>
                  )}
                  {hasCreated && (
                    <Alert
                      severity="info"
                      title={t('bot.alert.apiSettings.deployed.title')}>
                      <div>{t('bot.alert.apiSettings.deployed.body')}</div>
                    </Alert>
                  )}

                  {!hasShared && (
                    <Alert
                      severity="warning"
                      title={t('bot.alert.apiSettings.botUnshared.title')}>
                      <div>{t('bot.alert.apiSettings.botUnshared.body')}</div>
                    </Alert>
                  )}

                  {hasCreated && (
                    <>
                      <div className="mt-3">
                        <div className="text-lg font-bold">
                          {t('bot.label.apiSettings.endpoint')}
                        </div>
                        <div className="text-sm text-aws-font-color/50">
                          {t('bot.help.apiSettings.endpoint')}
                        </div>
                        <div className="flex">
                          <InputText
                            className="w-full"
                            value={botPublication?.endpoint ?? ''}
                            disabled
                          />
                          <ButtonCopy text={botPublication?.endpoint ?? ''} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-lg font-bold">
                          {t('bot.label.apiSettings.apiKeys')}
                        </div>
                        <div className="text-sm text-aws-font-color/50">
                          {t('bot.help.apiSettings.apiKeys')}
                        </div>

                        <div className="mt-1 flex flex-col gap-1">
                          {botPublication?.apiKeyIds.map((keyId) => (
                            <ApiKeyItem
                              key={keyId}
                              botId={botId ?? ''}
                              apiKeyId={keyId}
                            />
                          ))}
                        </div>
                        <div className="mt-2 flex w-full justify-end">
                          <Button onClick={onClickCreateApiKey}>
                            {t('button.add')}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  {myBot?.isPublic && (
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold">
                        {t('bot.label.apiSettings.usagePlan')}
                      </div>
                      <div className="text-sm text-aws-font-color/50">
                        {t('bot.help.apiSettings.usagePlan')}
                      </div>

                      <Toggle
                        label={t('bot.item.apiSettings.throttling')}
                        hint={t('bot.help.apiSettings.throttling')}
                        value={enabledThtottle}
                        disabled={disabledCreate}
                        onChange={setEnabledThtottle}
                      />

                      <div
                        className={twMerge(
                          '-mt-3 origin-top transition-all',
                          enabledThtottle
                            ? 'visible '
                            : 'invisible h-0 scale-y-0'
                        )}>
                        <InputText
                          label={t('bot.item.apiSettings.rateLimit')}
                          value={rateLimit?.toString() ?? ''}
                          type="number"
                          disabled={disabledCreate}
                          onChange={(val) => {
                            setRateLimit(Number.parseInt(val));
                          }}
                          errorMessage={errorMessages['rateLimit']}
                          hint={t('bot.help.apiSettings.rateLimit')}
                        />
                        <InputText
                          label={t('bot.item.apiSettings.burstLimit')}
                          value={burstLimit?.toString() ?? ''}
                          type="number"
                          disabled={disabledCreate}
                          onChange={(val) => {
                            setBurstLimit(Number.parseInt(val));
                          }}
                          errorMessage={errorMessages['burstLimit']}
                          hint={t('bot.help.apiSettings.burstLimit')}
                        />
                      </div>
                      <Toggle
                        label={t('bot.item.apiSettings.quota')}
                        hint={t('bot.help.apiSettings.quota')}
                        value={enabledQuota}
                        disabled={disabledCreate}
                        onChange={setEnabledQuota}
                      />
                      <div
                        className={twMerge(
                          '-mt-3 origin-top transition-all',
                          enabledQuota ? 'visible ' : 'invisible h-0 scale-y-0'
                        )}>
                        <div className="flex flex-col">
                          <div className="flex w-full gap-1">
                            <InputText
                              className="w-full"
                              label={t('bot.item.apiSettings.requestLimit')}
                              value={requestLimit?.toString() ?? ''}
                              type="number"
                              disabled={disabledCreate}
                              onChange={(val) => {
                                setRequestLimit(Number.parseInt(val));
                              }}
                              errorMessage={errorMessages['requestLimit']}
                            />
                            <Select
                              className="mt-5 w-40"
                              options={PERIOD_OPTIONS}
                              value={period}
                              disabled={disabledCreate}
                              onChange={(val) => {
                                setPeriod(val as QuotaPeriod);
                              }}
                            />
                          </div>
                          {!errorMessages['requestLimit'] && (
                            <div className="text-xs text-gray">
                              {t('bot.help.apiSettings.requestLimit')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-lg font-bold">
                          {t('bot.label.apiSettings.allowOrigins')}
                        </div>
                        <div className="text-sm text-aws-font-color/50">
                          <div>{t('bot.help.apiSettings.allowOrigins')}</div>
                          <div>
                            {t('bot.help.apiSettings.allowOriginsExample')}
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col gap-1">
                          {origins.map((_, idx) => (
                            <div key={idx} className="flex items-start">
                              <InputText
                                className="w-full"
                                value={origins[idx]}
                                disabled={disabledCreate}
                                onChange={(val) => {
                                  setOrigins(
                                    produce(origins, (draft) => {
                                      draft[idx] = val;
                                    })
                                  );
                                }}
                                errorMessage={errorMessages[`origins${idx}`]}
                              />
                              <ButtonIcon
                                className="text-red"
                                disabled={disabledCreate}
                                onClick={() => {
                                  onClickRemoveOrigin(idx);
                                }}>
                                <PiTrash />
                              </ButtonIcon>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <Button
                            outlined
                            icon={<PiPlus />}
                            disabled={disabledCreate}
                            onClick={onClickAddOrigin}>
                            {t('button.add')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between">
                <Button
                  outlined
                  icon={<PiCaretLeft />}
                  disabled={isLoading}
                  onClick={onClickBack}>
                  {t('button.back')}
                </Button>
                {!hasShared && !isInitialLoading && (
                  <Button loading={isLoadingShare} onClick={onClickShare}>
                    {t('bot.button.share')}
                  </Button>
                )}
                {!isLoadingShare &&
                  !hasCreated &&
                  !isDeploying &&
                  hasShared && (
                    <Button onClick={onClickCreate} loading={isLoading}>
                      {t('bot.button.create')}
                    </Button>
                  )}
                {hasCreated && (
                  <Button
                    className="bg-red"
                    onClick={() => {
                      setIsOpenDeleteApiDialog(true);
                    }}>
                    {t('button.delete')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BotApiSettingsPage;
