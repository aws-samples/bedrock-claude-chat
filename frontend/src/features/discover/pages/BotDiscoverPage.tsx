import React, { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  PiBinoculars,
  PiCertificate,
  PiMagnifyingGlass,
  PiRanking,
  PiX,
  PiCaretLeft,
  PiCaretRight,
} from 'react-icons/pi';
import InputText from '../../../components/InputText';
import useBotStore from '../hooks/useBotStore';
import { twMerge } from 'tailwind-merge';
import useBotSearch from '../hooks/useBotSearch';
import BotSearchResults, { SkeletonBot } from '../components/BotSearchResults';
import useLoginUser from '../../../hooks/useLoginUser';
import Alert from '../../../components/Alert';
import MenuBot from '../../../components/MenuBot';
import CardBotForDiscover from '../components/CardBotForDiscover';

// for pagination
const ITEMS_PER_PAGE = 6;

const BotDiscoverPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAdmin } = useLoginUser();
  const [inputValue, setInputValue] = useState('');

  const [trendingCurrentPage, setTrendingCurrentPage] = useState(1);
  const [discoverCurrentPage, setDiscoverCurrentPage] = useState(1);

  const {
    pickupBots,
    isLoadingPickupBots,
    popularBots,
    isLoadingPopularBots,
    pinnedBots,
    isLoadingPinnedBots,
  } = useBotStore();

  const {
    displayQuery, // Query used for displaying search results
    searchResults,
    isSearching,
    hasSearched,
    handleSearch,
    clearSearch,
  } = useBotSearch();

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      handleSearch(value); // Trigger search on input change for real-time search
    },
    [handleSearch]
  );

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    clearSearch();
  }, [clearSearch]);

  // Show regular content when not searching
  const showRegularContent = useMemo(() => !hasSearched, [hasSearched]);

  const getCurrentPageItems = useCallback(
    <T,>(items: T[], currentPage: number): T[] => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      return items.slice(startIndex, endIndex);
    },
    []
  );

  const currentTrendingBots = useMemo(
    () => getCurrentPageItems(popularBots, trendingCurrentPage),
    [popularBots, trendingCurrentPage, getCurrentPageItems]
  );

  const currentDiscoverBots = useMemo(
    () => getCurrentPageItems(pickupBots, discoverCurrentPage),
    [pickupBots, discoverCurrentPage, getCurrentPageItems]
  );

  const trendingTotalPages = useMemo(
    () => Math.ceil(popularBots.length / ITEMS_PER_PAGE),
    [popularBots.length]
  );

  const discoverTotalPages = useMemo(
    () => Math.ceil(pickupBots.length / ITEMS_PER_PAGE),
    [pickupBots.length]
  );

  const handlePageChange = useCallback(
    (
      pageNumber: number,
      setPageFunction: React.Dispatch<React.SetStateAction<number>>
    ) => {
      setPageFunction(pageNumber);
    },
    []
  );

  const Pagination = useCallback(
    ({
      currentPage,
      totalPages,
      onPageChange,
    }: {
      currentPage: number;
      totalPages: number;
      onPageChange: (page: number) => void;
    }) => {
      if (totalPages <= 1) {
        return null;
      }

      return (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-sm p-1 disabled:cursor-not-allowed disabled:opacity-50">
            <PiCaretLeft size={20} />
          </button>

          <span className="text-sm">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-sm p-1 disabled:cursor-not-allowed disabled:opacity-50">
            <PiCaretRight size={20} />
          </button>
        </div>
      );
    },
    []
  );

  return (
    <>
      <div className="flex justify-center pb-16">
        <div className="flex w-full max-w-(--breakpoint-xl) flex-col gap-3 px-4 pt-8 lg:w-4/5">
          <div className="flex justify-center text-4xl font-bold">
            {t('discover.pageTitle').toUpperCase()}
          </div>

          <div className=" flex w-full flex-col items-center justify-center text-dark-gray">
            <div>{t('discover.description')}</div>
          </div>

          <div className="relative mt-6">
            <InputText
              icon={<PiMagnifyingGlass />}
              placeholder={t('discover.search.placeholder')}
              value={inputValue}
              onChange={handleInputChange}
            />
            {inputValue && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark-gray"
                onClick={handleClearSearch}>
                <PiX size={20} />
              </button>
            )}
          </div>

          {/* Search Results */}
          <BotSearchResults
            results={searchResults}
            isSearching={isSearching}
            hasSearched={hasSearched}
            searchQuery={displayQuery}
            onBackToHome={handleClearSearch}
          />

          {showRegularContent && (
            <>
              <div
                className={twMerge(
                  isLoadingPinnedBots || (pinnedBots.length === 0 && !isAdmin)
                    ? 'invisible h-0 scale-y-0'
                    : 'mt-6',
                  'transition-all duration-300'
                )}>
                <div className="flex items-center text-2xl font-bold">
                  <PiCertificate className="mr-2" />
                  {t('discover.essential.label')}
                </div>
                <div className="mt-1 text-sm text-gray">
                  {t('discover.essential.description')}
                </div>

                {pinnedBots.length === 0 && isAdmin && (
                  <div className="mt-2">
                    <Alert
                      className="flex"
                      severity="info"
                      title={t(
                        'discover.essential.noEssentialBotsMessage.title'
                      )}>
                      <Trans
                        className="inline-flex"
                        i18nKey="discover.essential.noEssentialBotsMessage.content"
                        components={{
                          MenuButton: (
                            <div className="inline-flex">
                              <MenuBot
                                className="h-6 bg-transparent"
                                disabled
                              />
                            </div>
                          ),
                        }}
                      />
                    </Alert>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
                  {pinnedBots.map((bot) => (
                    <CardBotForDiscover key={bot.id} bot={bot} hidePinnedIcon />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center text-2xl font-bold">
                  <PiRanking className="mr-2" />
                  {t('discover.trending.label')}
                </div>
                <div className="mt-1 text-sm text-gray">
                  {t('discover.trending.description')}
                </div>

                <div className="mt-3 grid min-h-96 grid-cols-1 gap-6 md:grid-cols-2">
                  {isLoadingPopularBots && (
                    <>
                      <SkeletonBot />
                      <SkeletonBot />
                    </>
                  )}
                  {currentTrendingBots.map((bot, idx) => (
                    <div className="flex w-full" key={bot.id}>
                      <div className="mr-2 shrink-0 text-xl font-bold">
                        {(trendingCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1}.
                      </div>
                      <div className="w-full min-w-0 flex-1">
                        <CardBotForDiscover bot={bot} />
                      </div>
                    </div>
                  ))}
                </div>

                {popularBots.length > 0 && (
                  <Pagination
                    currentPage={trendingCurrentPage}
                    totalPages={trendingTotalPages}
                    onPageChange={(page) =>
                      handlePageChange(page, setTrendingCurrentPage)
                    }
                  />
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center text-2xl font-bold">
                  <PiBinoculars className="mr-2" />
                  {t('discover.discover.label')}
                </div>
                <div className="mt-1 text-sm text-gray">
                  {t('discover.discover.description')}
                </div>

                <div className="mt-3 grid min-h-96 grid-cols-1 gap-6 md:grid-cols-2">
                  {isLoadingPickupBots && (
                    <>
                      <SkeletonBot />
                      <SkeletonBot />
                    </>
                  )}
                  {currentDiscoverBots.map((bot) => (
                    <CardBotForDiscover key={bot.id} bot={bot} />
                  ))}
                </div>

                {/* ディスカバーボットのページネーション */}
                {pickupBots.length > 0 && (
                  <Pagination
                    currentPage={discoverCurrentPage}
                    totalPages={discoverTotalPages}
                    onPageChange={(page) =>
                      handlePageChange(page, setDiscoverCurrentPage)
                    }
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BotDiscoverPage;
