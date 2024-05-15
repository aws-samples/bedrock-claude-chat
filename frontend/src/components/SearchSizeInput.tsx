import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const SearchSizeInput: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="search-size-input">
      <label className="block text-sm font-medium text-gray-700">
        {t('SearchParams.searchSize.label')}
      </label>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min="1"
        max="100"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
      <p className="mt-2 text-sm text-gray-500">
        {t('SearchParams.searchSize.hint')}
      </p>
    </div>
  );
};

export default SearchSizeInput;
