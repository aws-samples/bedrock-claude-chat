import type { Meta } from '@storybook/react-vite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from './Select';

export default { component: Select } satisfies Meta<typeof Select>;

export const Ideal = () => {
  const { t } = useTranslation();
  const categoryOptions = t('feedbackDialog.categories', {
    returnObjects: true,
  });
  const [category, setCategory] = useState(categoryOptions[0].value);

  return (
    <Select
      label={t('feedbackDialog.categoryLabel')}
      value={category}
      options={categoryOptions}
      onChange={setCategory}
    />
  );
};

export const IdealDisabled = () => {
  const { t } = useTranslation();
  const categoryOptions = t('feedbackDialog.categories', {
    returnObjects: true,
  });

  return (
    <Select
      label={t('feedbackDialog.categoryLabel')}
      value={categoryOptions[0].value}
      options={categoryOptions}
      disabled={true}
      onChange={() => {}}
    />
  );
};

export const Clearable = () => {
  const { t } = useTranslation();
  const categoryOptions = t('feedbackDialog.categories', {
    returnObjects: true,
  });
  const [category, setCategory] = useState(categoryOptions[0].value);

  return (
    <Select
      label={t('feedbackDialog.categoryLabel')}
      value={category}
      options={categoryOptions}
      clearable={true}
      onChange={setCategory}
    />
  );
};

export const ClearableDisabled = () => {
  const { t } = useTranslation();
  const categoryOptions = t('feedbackDialog.categories', {
    returnObjects: true,
  });

  return (
    <Select
      label={t('feedbackDialog.categoryLabel')}
      value={categoryOptions[0].value}
      options={categoryOptions}
      clearable={true}
      disabled={true}
      onChange={() => {}}
    />
  );
};

export const Descriptive = () => {
  const { t } = useTranslation();
  const options: {
    label: string;
    value: string;
    description: string;
  }[] = [
    {
      label: t('searchSettings.searchType.hybrid.label'),
      value: 'hybrid',
      description: t('searchSettings.searchType.hybrid.hint'),
    },
    {
      label: t('searchSettings.searchType.semantic.label'),
      value: 'semantic',
      description: t('searchSettings.searchType.semantic.hint'),
    },
  ];
  const [value, setValue] = useState<string>(options[0].value);

  return (
    <Select
      label={t('searchSettings.searchType.label')}
      value={value}
      options={options}
      onChange={setValue}
    />
  );
};

export const DescriptiveDisabled = () => {
  const { t } = useTranslation();
  const options: {
    label: string;
    value: string;
    description: string;
  }[] = [
    {
      label: t('searchSettings.searchType.hybrid.label'),
      value: 'hybrid',
      description: t('searchSettings.searchType.hybrid.hint'),
    },
    {
      label: t('searchSettings.searchType.semantic.label'),
      value: 'semantic',
      description: t('searchSettings.searchType.semantic.hint'),
    },
  ];

  return (
    <Select
      label={t('searchSettings.searchType.label')}
      value={options[0].value}
      options={options}
      disabled={true}
      onChange={() => {}}
    />
  );
};
