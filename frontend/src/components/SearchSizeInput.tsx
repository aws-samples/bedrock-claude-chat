import React from 'react';
import { useTranslation } from 'react-i18next';
import Help from './Help';
import useChat from '../hooks/useChat';

const SearchSizeInput: React.FC = () => {
  const { t } = useTranslation();
  const { searchSize, setSearchSize } = useChat();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= 100) {
      setSearchSize(value);
    } else {
      setSearchSize(100); // If value exceeds 100, set it to 100
    }
  };

  return (
    <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center">
      <label htmlFor="searchSizeInput" className="mr-2 text-sm font-semibold">{t('SearchParams.searchSize.label')}</label>
      <input
        id="searchSizeInput"
        type="number"
        value={searchSize}
        onChange={handleChange}
        className="p-1 border rounded-lg text-sm w-16"
        min={1}
        max={100}
      />
      <Help
        direction="left"
        message={t('SearchParams.searchSize.help')}
      />
    </div>
  );
};

export default SearchSizeInput;
