import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Help from '../components/Help';
import usePublicBotsForAdmin from '../hooks/usePublicBotsForAdmin';
import ListItemBot from '../components/ListItemBot';
import { formatDate, formatDatetime } from '../utils/DateUtils';

import InputText from '../components/InputText';
import Button from '../components/Button';
import { PiArrowDown } from 'react-icons/pi';
import Skeleton from '../components/Skeleton';

const AdminPublicBotsPage: React.FC = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();

  const [searchDateFrom, setSearchDateFrom] = useState<null | string>(null);
  const [searchDateTo, setSearchDateTo] = useState<null | string>(null);

  const { publicBots, isLoading: isLoadingPublicBots } = usePublicBotsForAdmin({
    start: searchDateFrom ?? undefined,
    end: searchDateTo ?? undefined,
  });

  // const onClickViewBot = useCallback(
  //   (botId: string) => {
  //     navigate(`/bot/edit/${botId}`);
  //   },
  //   [navigate]
  // );

  return (
    <>
      {/* <DialogConfirmDeleteBot
        isOpen={isOpenDeleteDialog}
        target={targetDelete}
        onDelete={onDeleteMyBot}
        onClose={() => {
          setIsOpenDeleteDialog(false);
        }}
      />
      <DialogConfirmShareBot
        isOpen={isOpenShareDialog}
        target={targetShareBot}
        onToggleShare={onToggleShare}
        onClose={() => {
          setIsOpenShareDialog(false);
        }}
      /> */}
      <div className="flex h-full justify-center">
        <div className="w-2/3">
          <div className="h-full w-full pt-8">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">
                  {t('admin.publicBotUsages.label.pageTitle')}
                </div>
                <Help
                  direction="right"
                  message={t('admin.publicBotUsages.help.overview')}
                />
              </div>
            </div>

            <div className="my-2 rounded border p-2">
              <div className="text-sm font-bold">
                {t('admin.publicBotUsages.label.SearchCondition.title')}
              </div>

              <div className="flex gap-2 sm:w-full md:w-3/4">
                <InputText
                  className="w-full"
                  type="date"
                  label={t('admin.publicBotUsages.label.SearchCondition.from')}
                  value={formatDate(searchDateFrom, 'YYYY-MM-DD')}
                  onChange={(val) => {
                    setSearchDateFrom(formatDate(val, 'YYYYMMDD'));
                  }}
                />
                <InputText
                  className="w-full"
                  type="date"
                  label={t('admin.publicBotUsages.label.SearchCondition.to')}
                  value={formatDate(searchDateTo, 'YYYY-MM-DD')}
                  onChange={(val) => {
                    setSearchDateTo(formatDate(val, 'YYYYMMDD'));
                  }}
                />
              </div>
            </div>

            <div className="my-2 flex justify-end">
              <Button outlined rightIcon={<PiArrowDown />} onClick={() => {}}>
                {t('admin.publicBotUsages.label.sortByCost')}
              </Button>
            </div>

            <div className="mt-2 border-b border-gray"></div>

            <div className="h-4/5 overflow-x-hidden overflow-y-scroll border-b border-gray pr-1 scrollbar-thin scrollbar-thumb-aws-font-color/20 ">
              {isLoadingPublicBots && (
                <div className="flex flex-col gap-2">
                  {new Array(15).fill('').map((_, idx) => {
                    return <Skeleton key={idx} className="h-12 w-full" />;
                  })}
                </div>
              )}

              {publicBots?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center italic text-dark-gray">
                  {t('admin.publicBotUsages.label.noPublicBotUsages')}
                </div>
              )}
              {publicBots?.map((bot, idx) => (
                <ListItemBot
                  key={idx}
                  bot={{
                    ...bot,
                    available: true,
                  }}
                  onClick={() => {
                    // onClickViewBot(bot.id);
                  }}>
                  <div className="flex gap-3">
                    <div className="flex gap-1 text-lg font-bold">
                      {(Math.floor(bot.totalPrice * 100) / 100).toFixed(2)} USD
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                      {bot.isPublished ? (
                        <>
                          <div className="font-bold">
                            {/* {t('admin.label.publishedDate')}: */}
                          </div>
                          {bot.publishedDatetime
                            ? formatDatetime(bot.publishedDatetime)
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPublicBotsPage;
