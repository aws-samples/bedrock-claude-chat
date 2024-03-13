import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InputText from '../components/InputText';
import Button from '../components/Button';
import { useParams } from 'react-router-dom';
import { PiCaretLeft, PiPlus, PiTrash } from 'react-icons/pi';
import DialogInstructionsSamples from '../components/DialogInstructionsSamples';
import useBotApiSettings from '../hooks/useBotApiSettings';
import Alert from '../components/Alert';
import Skeleton from '../components/Skeleton';
import Toggle from '../components/Toggle';
import Select from '../components/Select';
import { BotPublicationQuota } from '../@types/api-publication';
import i18next from 'i18next';
import ButtonIcon from '../components/ButtonIcon';
import { twMerge } from 'tailwind-merge';
import { produce } from 'immer';
import useErrorMessage from '../hooks/useErrorMessage';

const PERIOD_OPTIONS: {
  label: string;
  value: BotPublicationQuota['period'];
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

  const { myBot, isLoadingMyBot, shareBot, publishBot } = useBotApiSettings(
    botId ?? ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShare, setIsLoadingShare] = useState(false);

  const onClickShare = useCallback(() => {
    setIsLoadingShare(true);
    shareBot().finally(() => {
      setIsLoadingShare(false);
    });
  }, [shareBot]);

  const [enabledThtottle, setEnabledThtottle] = useState(true);
  const [enabledQuota, setEnabledQuota] = useState(true);

  const [rateLimit, setRateLimit] = useState<null | number>(null);
  const [burstLimit, setBurstLimit] = useState<null | number>(null);
  const [requestLimit, setRequestLimit] = useState<null | number>(null);
  const [period, setPeriod] = useState<BotPublicationQuota['period']>('MONTH');

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
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [
    burstLimit,
    clearErrorMessages,
    enabledQuota,
    enabledThtottle,
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

  const [isOpenSamples, setIsOpenSamples] = useState(false);

  return (
    <>
      <DialogInstructionsSamples
        isOpen={isOpenSamples}
        onClose={() => {
          setIsOpenSamples(false);
        }}
      />
      <div className="mb-20 flex justify-center">
        <div className="w-2/3">
          <div className="mt-5 w-full">
            <div className="text-xl font-bold">
              {t('bot.apiSettings.pageTitle')}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {isLoadingMyBot ? (
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

                  {!myBot?.isPublic && (
                    <Alert
                      severity="warning"
                      title={t('bot.alert.botUnshared.title')}>
                      <div>{t('bot.alert.botUnshared.body')}</div>
                      <div className="mt-2">
                        <Button loading={isLoadingShare} onClick={onClickShare}>
                          {t('bot.button.share')}
                        </Button>
                      </div>
                    </Alert>
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
                        disabled={isLoading}
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
                          disabled={isLoading}
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
                          disabled={isLoading}
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
                        disabled={isLoading}
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
                              disabled={isLoading}
                              onChange={(val) => {
                                setRequestLimit(Number.parseInt(val));
                              }}
                              errorMessage={errorMessages['requestLimit']}
                            />
                            <Select
                              className="mt-5 w-40"
                              options={PERIOD_OPTIONS}
                              value={period}
                              disabled={isLoading}
                              onChange={(val) => {
                                setPeriod(val as BotPublicationQuota['period']);
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
                                disabled={isLoading}
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
                                disabled={isLoading}
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
                            disabled={isLoading}
                            onClick={onClickAddOrigin}>
                            {t('button.add')}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-lg font-bold">
                          {t('bot.label.apiSettings.apiKeys')}
                        </div>
                        <div className="text-sm text-aws-font-color/50">
                          {t('bot.help.apiSettings.apiKeys')}
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
                <Button
                  onClick={onClickCreate}
                  loading={isLoading}
                  // disabled={disabledRegister}
                >
                  {t('bot.button.create')}
                </Button>

                {/* {isNewBot ? (
                  <Button
                    onClick={onClickCreate}
                    loading={isLoading}
                    disabled={disabledRegister}>
                    {t('bot.button.create')}
                  </Button>
                ) : (
                  <Button
                    onClick={onClickEdit}
                    loading={isLoading}
                    disabled={disabledRegister}>
                    {t('bot.button.edit')}
                  </Button>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BotApiSettingsPage;
