// SearchTextBox.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BaseProps } from '../@types/common';
import { PiMagnifyingGlass, PiSpinnerGap, PiX } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';
import ButtonIcon from './ButtonIcon';
import { useDebouncedCallback } from 'use-debounce';

type Props = BaseProps & {
  value: string;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSearch: (searchText: string) => void;
  onSelect: (value: string) => void;
  onClear?: () => void;
};

const SearchTextBox: React.FC<Props> = (props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(props.value);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { suggestions, onSelect, onChange } = props;

  // Debounce for search
  const debouncedSearch = useDebouncedCallback((searchText: string) => {
    props.onSearch(searchText);
  }, 300);

  // Reflected the change in input value immediately and executed the debounced search
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      onChange(value);
      debouncedSearch(value);
    },
    [onChange, debouncedSearch]
  );

  useEffect(() => {
    // Synchronize changes from the outside
    setInputValue(props.value);
  }, [props.value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!suggestions?.length) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions!.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        onSelect(suggestions[selectedIndex]);
        setIsFocused(false);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
      }
    },
    [suggestions, onSelect, selectedIndex]
  );

  useEffect(() => {
    if (selectedIndex >= 0) {
      const selectedElement = document.getElementById(
        `suggestion-${selectedIndex}`
      );
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <div
        className={twMerge(
          'flex items-center rounded-sm border bg-white dark:bg-aws-ui-color-dark',
          props.disabled
            ? 'border-aws-font-color-light/30 dark:border-aws-font-color-dark/30'
            : 'border-aws-font-color-light/50 dark:border-aws-font-color-dark/50'
        )}>
        {props.isLoading ? (
          <PiSpinnerGap className="ml-2 animate-spin text-gray" />
        ) : (
          <PiMagnifyingGlass className="ml-2 text-gray" />
        )}
        <input
          ref={inputRef}
          type="text"
          className={twMerge(
            'w-full bg-transparent p-2 outline-hidden dark:text-aws-font-color-dark dark:placeholder-aws-font-color-gray',
            props.disabled && 'cursor-not-allowed'
          )}
          value={inputValue}
          placeholder={props.placeholder}
          disabled={props.disabled}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        {inputValue && props.onClear && (
          <ButtonIcon
            className="mr-1 text-gray"
            disabled={props.disabled}
            onClick={() => {
              props.onClear?.();
              setInputValue('');
              setSelectedIndex(-1);
            }}>
            <PiX />
          </ButtonIcon>
        )}
      </div>

      {isFocused && suggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-aws-font-color-light/50 bg-white shadow-lg dark:border-aws-font-color-dark/50 dark:bg-aws-ui-color-dark">
          {suggestions.map((suggestion, index) => (
            <div
              id={`suggestion-${index}`}
              key={index}
              className={twMerge(
                'cursor-pointer px-4 py-2 hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark',
                selectedIndex === index &&
                  'bg-aws-sea-blue-hover-light dark:bg-aws-paper-dark'
              )}
              onClick={() => {
                onSelect(suggestion);
                setIsFocused(false);
              }}>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchTextBox;
