import React from 'react';
import { useTranslation } from 'react-i18next';
import Help from './Help';
import useChat from '../hooks/useChat';

const SearchSizeInput: React.FC = () => {
  const { t } = useTranslation();
  const { searchSize, setSearchSize } = useChat();

  return (
    <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center">
      <label htmlFor="searchSizeInput" className="mr-2 text-sm font-semibold">{t('SearchParams.searchSize.label')}</label>
      <input
        id="searchSizeInput"
        type="number"
        value={searchSize}
        onChange={(e) => setSearchSize(Number(e.target.value))}
        className="p-1 border rounded-lg text-sm w-16"
        min={1}
        max={100}
      />
      <Help
        direction="right"
        message={t('SearchParams.searchSize.help')}
      />
    </div>
  );
};

export default SearchSizeInput;
