import type { Meta } from '@storybook/react-vite';
import RadioButton from './RadioButton';

export default { component: RadioButton } satisfies Meta<typeof RadioButton>;

export const Default = () => (
  <RadioButton
    label="Radio option"
    value="option1"
    checked={false}
    name="default-radio"
  />
);

export const WithHint = () => (
  <RadioButton
    label="Radio with hint"
    value="option1"
    checked={false}
    name="hint-radio"
    hint="This is a helpful hint text"
  />
);

export const Disabled = () => (
  <RadioButton
    label="Disabled radio"
    value="option1"
    checked={false}
    name="disabled-radio"
    disabled
  />
);

export const Variants = () => (
  <div className="flex flex-col gap-4">
    <RadioButton
      label="Default variant"
      value="default"
      checked={true}
      name="variant-group"
      variant="default"
    />
    <RadioButton
      label="Outlined variant"
      value="outlined"
      checked={true}
      name="variant-group"
      variant="outlined"
    />
    <RadioButton
      label="Colored variant"
      value="colored"
      checked={true}
      name="variant-group"
      variant="colored"
    />
  </div>
);
