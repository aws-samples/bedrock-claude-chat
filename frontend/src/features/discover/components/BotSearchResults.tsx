import React from 'react';
import { useTranslation } from 'react-i18next';
import { BotMeta } from '../../../@types/bot';
import { PiArrowLeft } from 'react-icons/pi';
import Skeleton from '../../../components/Skeleton';
import Button from '../../../components/Button';
import CardBotForDiscover from './CardBotForDiscover';

export const SkeletonBot: React.FC = () => {
  return <Skeleton className="h-30 w-full rounded-xl" />;
};

type BotSearchResultsProps = {
  results: BotMeta[];
  isSearching: boolean;
  hasSearched: boolean;
  searchQuery: string;
  onBackToHome: () => void; // Handler for returning to home view
};

const BotSearchResults: React.FC<BotSearchResultsProps> = ({
  results,
  isSearching,
  hasSearched,
  searchQuery,
  onBackToHome,
}) => {
  const { t } = useTranslation();

  if (isSearching) {
    return (
      <div className="mt-6">
        <div className="text-2xl font-bold">
          {t('discover.search.searching')}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
          <SkeletonBot />
          <SkeletonBot />
          <SkeletonBot />
          <SkeletonBot />
        </div>
        <div className="mt-4">
          <Button
            outlined
            onClick={onBackToHome}
            className="flex items-center gap-2">
            <PiArrowLeft /> {t('discover.search.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="mt-6">
        <div className="text-2xl font-bold">
          {t('discover.search.noResults', { query: searchQuery })}
        </div>
        <div className="mt-1 text-sm text-gray">
          {t('discover.search.tryDifferent')}
        </div>
        <div className="mt-4">
          <Button
            outlined
            onClick={onBackToHome}
            className="flex items-center gap-2">
            <PiArrowLeft /> {t('discover.search.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (hasSearched && results.length > 0) {
    return (
      <div className="mt-6">
        <div className="text-2xl font-bold">
          {t('discover.search.results', {
            count: results.length,
            query: searchQuery,
          })}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
          {results.map((bot) => (
            <CardBotForDiscover key={bot.id} bot={bot} />
          ))}
        </div>
        <div className="mt-4">
          <Button
            outlined
            onClick={onBackToHome}
            className="flex items-center gap-2">
            <PiArrowLeft /> {t('discover.search.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default BotSearchResults;
