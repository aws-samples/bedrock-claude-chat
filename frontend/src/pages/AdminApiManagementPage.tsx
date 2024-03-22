import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ListItemBot from '../components/ListItemBot';
import { formatDatetime } from '../utils/DateUtils';

import Skeleton from '../components/Skeleton';
import usePublishApiForAdmin from '../hooks/usePublishApiForAdmin';
import { useNavigate } from 'react-router-dom';

const AdminApiManagementPage: React.FC = () => {
  const { t } = useTranslation();

  const { botApis, isLoading: isLoadingApis } = usePublishApiForAdmin();

  const navigate = useNavigate();

  const onClickViewApi = useCallback(
    (botId: string) => {
      navigate(`/admin/bot/${botId}`);
    },
    [navigate]
  );

  return (
    <>
      <div className="flex h-full justify-center">
        <div className="w-2/3">
          <div className="h-full w-full pt-8">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">
                  {t('admin.apiManagement.label.pageTitle')}
                </div>
              </div>
            </div>

            <div className="mt-2 border-b border-gray"></div>

            <div className="h-4/5 overflow-x-hidden overflow-y-scroll border-b border-gray pr-1 scrollbar-thin scrollbar-thumb-aws-font-color/20 ">
              {isLoadingApis && (
                <div className="flex flex-col gap-2">
                  {new Array(15).fill('').map((_, idx) => {
                    return <Skeleton key={idx} className="h-12 w-full" />;
                  })}
                </div>
              )}

              {botApis?.length === 0 && (
                <div className="flex h-full w-full items-center justify-center italic text-dark-gray">
                  {t('admin.apiManagement.label.noApi')}
                </div>
              )}
              {botApis?.map((api, idx) => (
                <ListItemBot
                  key={idx}
                  bot={{
                    ...api,
                    available: true,
                  }}
                  onClick={() => {
                    onClickViewApi(api.id);
                  }}>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs">{api.publishedStackName}</div>
                    <div className="text-xs">
                      <div className="mr-1 inline font-bold">
                        {t('admin.apiManagement.label.publishedDate')}:
                      </div>
                      {formatDatetime(api.publishedDatetime)}
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

export default AdminApiManagementPage;
