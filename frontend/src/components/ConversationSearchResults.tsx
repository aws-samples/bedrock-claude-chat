import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConversationSearchMeta } from '../@types/conversation';
import { PiArrowLeft, PiMagnifyingGlass } from 'react-icons/pi';
import Button from './Button';
import Skeleton from './Skeleton';

type ConversationItemProps = {
  conversation: ConversationSearchMeta;
  onClick: (id: string) => void;
  searchQuery: string;
};

const renderEmphasizedText = (text: string) => {
  // Split text with <em> tags
  const parts = text.split(/(<em>.*?<\/em>)/);

  return parts.map((part, index) => {
    if (part.startsWith('<em>') && part.endsWith('</em>')) {
      // Highlighted by extracting only the contents of the <em> tag
      const emphasizedText = part.replace(/<em>(.*?)<\/em>/, '$1');
      return <em key={index}>{emphasizedText}</em>;
    }
    return part;
  });
};

// Helper function to highlight search terms in the text
const highlightSearchTerms = (text: string, searchQuery: string) => {
  if (!searchQuery.trim()) {
    return text;
  }

  // Escape special characters in the search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create a regex to match the search query (case insensitive)
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // Replace matches with highlighted version
  const a = text.replace(regex, '<em>$1</em>');
  return renderEmphasizedText(a);
};

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onClick,
  searchQuery,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to render highlight fragments
  const renderHighlights = () => {
    if (!conversation.highlights || conversation.highlights.length === 0) {
      return null;
    }

    //Highlight the messageBody field according to the response from the backend
    const messageHighlights = conversation.highlights.filter(
      (h) => h.fieldName === 'MessageBody'
    );

    if (messageHighlights.length === 0) {
      return null;
    }

    return (
      <div className="mt-1">
        {messageHighlights.map((highlight, highlightIndex) => (
          <div key={highlightIndex}>
            {highlight.fragments.map((fragment, fragmentIndex) => (
              <div
                key={fragmentIndex}
                className="mt-1 line-clamp-2 border-l-2 border-gray p-1 text-sm text-dark-gray dark:text-gray">
                <span className="[&_em]:bg-light-yellow dark:[&_em]:bg-yellow">
                  {`...`}
                  {renderEmphasizedText(fragment)}
                  {`...`}
                </span>

                {}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="group flex cursor-pointer flex-col border-b border-gray p-2 hover:bg-light-gray dark:border-dark-gray dark:hover:bg-aws-squid-ink-light"
      onClick={() => onClick(conversation.id)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-base font-medium">
            <span className="[&_em]:bg-light-yellow dark:[&_em]:bg-yellow">
              {highlightSearchTerms(conversation.title, searchQuery)}
            </span>
          </div>
          <div className="text-xs text-gray">
            {formatDate(conversation.lastUpdatedTime)}
          </div>
        </div>
      </div>
      {/* Display highlight fragments */}
      {renderHighlights()}
    </div>
  );
};

export const SkeletonConversation: React.FC = () => {
  return <Skeleton className="h-16 w-full rounded-sm" />;
};

type ConversationSearchResultsProps = {
  results: ConversationSearchMeta[];
  isSearching: boolean;
  hasSearched: boolean;
  searchQuery: string;
  onbackToConversationHistory: () => void;
  onSelectConversation: (id: string) => void;
};

const ConversationSearchResults: React.FC<ConversationSearchResultsProps> = ({
  results,
  isSearching,
  hasSearched,
  searchQuery,
  onbackToConversationHistory,
  onSelectConversation,
}) => {
  const { t } = useTranslation();

  if (!hasSearched) {
    return null;
  }

  if (isSearching) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-2xl font-bold">
            <PiMagnifyingGlass className="mr-2" />
            {t(
              'conversationHistory.searchConversation.searching',
              'Searching...'
            )}
          </div>
          <Button
            className="text-sm"
            outlined
            icon={<PiArrowLeft />}
            onClick={onbackToConversationHistory}>
            {t('button.backToConversationHistory', 'Back to History')}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          <SkeletonConversation />
          <SkeletonConversation />
          <SkeletonConversation />
        </div>
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="mt-6">
        <div className="mt-6">
          <div className="text-lg font-bold">
            {t('conversationHistory.searchConversation.noResults', {
              query: searchQuery,
            })}
          </div>
          <div className="mt-1 text-sm text-gray">
            {t('conversationHistory.searchConversation.tryDifferentKeywords')}
          </div>
        </div>
        <Button
          className="mt-4"
          outlined
          icon={<PiArrowLeft />}
          onClick={onbackToConversationHistory}>
          {t('button.backToConversationHistory', 'Back to History')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="text-lg font-bold">
        {t('conversationHistory.searchConversation.results', {
          count: results.length,
          query: searchQuery,
        })}
      </div>

      <div>
        {results.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={onSelectConversation}
            searchQuery={searchQuery}
          />
        ))}
      </div>
      <Button
        className="mt-4"
        outlined
        icon={<PiArrowLeft />}
        onClick={onbackToConversationHistory}>
        {t('button.backToHistory', 'Back to History')}
      </Button>
    </div>
  );
};

export default ConversationSearchResults;
