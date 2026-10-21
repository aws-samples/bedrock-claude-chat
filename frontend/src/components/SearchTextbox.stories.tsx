import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import SearchTextBox from './SearchTextBox';

export default { component: SearchTextBox } satisfies Meta<
  typeof SearchTextBox
>;

const suggestions = [
  'Amazon Bedrock',
  'Amazon SageMaker',
  'Amazon Comprehend',
  'Amazon Rekognition',
  'Amazon Textract',
];

export const Default = () => {
  const [value, setValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockApiCall = (searchText: string) => {
    console.log(`API triggered with searchText: ${searchText}`); // API発火ログ
    setIsLoading(true);
    // Simulate API delay of 0.3 seconds
    setTimeout(() => {
      setFilteredSuggestions(
        suggestions.filter((s) =>
          s.toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setIsLoading(false);
    }, 300);
  };

  return (
    <SearchTextBox
      value={value}
      placeholder="Search services..."
      suggestions={filteredSuggestions}
      isLoading={isLoading}
      onChange={(text) => {
        setValue(text);
      }}
      onSearch={mockApiCall} // debounceの確認
      onSelect={setValue}
      onClear={() => {
        setValue('');
        setFilteredSuggestions([]);
      }}
    />
  );
};

export const Disabled = () => {
  return (
    <SearchTextBox
      value="Amazon"
      placeholder="Search services..."
      suggestions={[]}
      disabled={true}
      onChange={() => {}}
      onSearch={() => {}}
      onSelect={() => {}}
      onClear={() => {}}
    />
  );
};
