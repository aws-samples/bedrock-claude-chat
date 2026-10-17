import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Help from '../components/Help';
import usePublicBotsForAdmin from '../hooks/usePublicBotsForAdmin';
import ListItemBot from '../components/ListItemBot';
import { addDate, formatDate } from '../utils/DateUtils';

import InputText from '../components/InputText';
import Button from '../components/Button';
import { PiArrowDown } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';
import ListPageLayout from '../layouts/ListPageLayout';
import useLoginUser from '../hooks/useLoginUser';

const DATA_FORMAT = 'YYYYMMDD';

const AdminSharedBotAnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useLoginUser();

  const [searchDateFrom, setSearchDateFrom] = useState<null | string>(
    formatDate(addDate(new Date(), -1, 'month'), DATA_FORMAT)
  );
  const [searchDateTo, setSearchDateTo] = useState<null | string>(
    formatDate(new Date(), DATA_FORMAT)
  );
  const [isDescCost, setIsDescCost] = useState(true);

  const { publicBots, isLoading: isLoadingPublicBots } = usePublicBotsForAdmin({
    start: searchDateFrom ? searchDateFrom + '00' : undefined,
    end: searchDateTo ? searchDateTo + '23' : undefined,
  });

  const sortedBots = useMemo(() => {
    const tmp = isDescCost ? -1 : 1;
    return publicBots?.sort((a, b) =>
      a.totalPrice > b.totalPrice ? tmp : tmp * -1
    );
  }, [isDescCost, publicBots]);

  const validationErrorMessage = useMemo(() => {
    return !!searchDateFrom === !!searchDateTo
      ? null
      : t('admin.validationError.period');
  }, [searchDateFrom, searchDateTo, t]);

  const navigate = useNavigate();

  const onClickViewBot = useCallback(
    (botId: string) => {
      navigate(`/admin/bot/${botId}`);
    },
    [navigate]
  );

  return (
    <ListPageLayout
      pageTitle={t('admin.botAnalytics.label.pageTitle')}
      pageTitleHelp={t('admin.botAnalytics.help.overview')}
      searchCondition={
        <div>
          <div className="rounded-sm border p-2">
            <div className="flex items-center gap-1 text-sm font-bold">
              {t('admin.botAnalytics.label.SearchCondition.title')}
              <Help message={t('admin.botAnalytics.help.calculationPeriod')} />
            </div>

            <div className="flex gap-2 sm:w-full md:w-3/4">
              <InputText
                className="w-full"
                type="date"
                label={t('admin.botAnalytics.label.SearchCondition.from')}
                value={formatDate(searchDateFrom, 'YYYY-MM-DD')}
                onChange={(val) => {
                  if (val === '') {
                    setSearchDateFrom(null);
                    return;
                  }
                  setSearchDateFrom(formatDate(val, DATA_FORMAT));
                }}
                errorMessage={
                  searchDateFrom
                    ? undefined
                    : (validationErrorMessage ?? undefined)
                }
              />
              <InputText
                className="w-full"
                type="date"
                label={t('admin.botAnalytics.label.SearchCondition.to')}
                value={formatDate(searchDateTo, 'YYYY-MM-DD')}
                onChange={(val) => {
                  if (val === '') {
                    setSearchDateTo(null);
                    return;
                  }
                  setSearchDateTo(formatDate(val, DATA_FORMAT));
                }}
                errorMessage={
                  searchDateTo
                    ? undefined
                    : (validationErrorMessage ?? undefined)
                }
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              outlined
              rightIcon={
                <PiArrowDown
                  className={twMerge(
                    'transition',
                    isDescCost ? 'rotate-0' : 'rotate-180'
                  )}
                />
              }
              onClick={() => {
                setIsDescCost(!isDescCost);
              }}>
              {t('admin.botAnalytics.label.sortByCost')}
            </Button>
          </div>
        </div>
      }
      isLoading={isLoadingPublicBots}
      isEmpty={publicBots?.length === 0}
      emptyMessage={t('admin.botAnalytics.label.noBotUsages')}>
      {sortedBots?.map((bot, idx) => (
        <ListItemBot
          key={idx}
          bot={{
            ...bot,
            available: true,
            owned: userId === bot.ownerUserId,
          }}
          onClick={() => {
            onClickViewBot(bot.id);
          }}>
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
    </ListPageLayout>
  );
};

export default AdminSharedBotAnalyticsPage;
