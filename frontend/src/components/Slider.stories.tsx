import type { Meta } from '@storybook/react-vite';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_SEARCH_CONFIG,
  EDGE_SEARCH_PARAMS,
} from '../features/knowledgeBase/constants';
import { Slider } from './Slider';
import { useState } from 'react';
import { SearchParams } from '../features/knowledgeBase/types';

export default { component: Slider } satisfies Meta<typeof Slider>;

export const Ideal = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    maxResults: DEFAULT_SEARCH_CONFIG.maxResults,
    searchType: DEFAULT_SEARCH_CONFIG.searchType,
  });
  return (
    <Slider
      value={searchParams.maxResults}
      hint={t('searchSettings.maxResults.hint')}
      label={t('searchSettings.maxResults.label')}
      range={{
        min: EDGE_SEARCH_PARAMS.maxResults.MIN,
        max: EDGE_SEARCH_PARAMS.maxResults.MAX,
        step: EDGE_SEARCH_PARAMS.maxResults.STEP,
      }}
      onChange={(maxResults) =>
        setSearchParams((params) => ({
          ...params,
          maxResults: maxResults,
        }))
      }
    />
  );
};

export const IdealDisabled = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    maxResults: DEFAULT_SEARCH_CONFIG.maxResults,
    searchType: DEFAULT_SEARCH_CONFIG.searchType,
  });
  return (
    <Slider
      value={searchParams.maxResults}
      hint={t('searchSettings.maxResults.hint')}
      label={t('searchSettings.maxResults.label')}
      range={{
        min: EDGE_SEARCH_PARAMS.maxResults.MIN,
        max: EDGE_SEARCH_PARAMS.maxResults.MAX,
        step: EDGE_SEARCH_PARAMS.maxResults.STEP,
      }}
      onChange={(maxResults) =>
        setSearchParams((params) => ({
          ...params,
          maxResults: maxResults,
        }))
      }
      disabled={true}
    />
  );
};

export const Error = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    maxResults: DEFAULT_SEARCH_CONFIG.maxResults,
    searchType: DEFAULT_SEARCH_CONFIG.searchType,
  });
  return (
    <Slider
      value={searchParams.maxResults}
      hint={t('searchSettings.maxResults.hint')}
      label={t('searchSettings.maxResults.label')}
      range={{
        min: EDGE_SEARCH_PARAMS.maxResults.MIN,
        max: EDGE_SEARCH_PARAMS.maxResults.MAX,
        step: EDGE_SEARCH_PARAMS.maxResults.STEP,
      }}
      onChange={(maxResults) =>
        setSearchParams((params) => ({
          ...params,
          maxResults: maxResults,
        }))
      }
      errorMessage="error"
    />
  );
};
