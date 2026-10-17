import React from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type RadioButtonVariant = 'default' | 'outlined' | 'colored';

type Props = BaseProps & {
  label?: string;
  value: string;
  checked: boolean;
  name: string;
  disabled?: boolean;
  hint?: string;
  variant?: RadioButtonVariant;
  onChange?: (value: string) => void;
};

const variantStyles: Record<RadioButtonVariant, string> = {
  default: 'border-aws-font-color-light/50 dark:border-aws-font-color-dark/50 after:bg-aws-sea-blue-light dark:after:bg-aws-sea-blue-dark',
  outlined: 'border-gray-300 dark:border-aws-font-color-dark after:bg-aws-sea-blue-light dark:after:bg-aws-sea-blue-dark',
  colored: 'border-aws-sea-blue-light dark:border-aws-sea-blue-dark after:bg-aws-sea-blue-light dark:after:bg-aws-sea-blue-dark',
};

const RadioButton: React.FC<Props> = ({
  label,
  value,
  checked,
  name,
  disabled = false,
  hint,
  variant = 'default',
  className,
  onChange,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.(e.target.value);
    }
  };

  return (
    <div className={twMerge('my-2 flex flex-col pr-3', className)} {...rest}>
      <label
        className={twMerge(
          'relative inline-flex items-center gap-3',
          disabled ? '' : 'cursor-pointer'
        )}>
        <div className="relative shrink-0">
          <input
            type="radio"
            className="peer sr-only"
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
          />
          <div
            className={twMerge(
              'rounded-full border size-5',
              'after:absolute after:left-1/2 after:top-1/2 after:rounded-full after:size-3 after:-translate-1/2',
              'after:transition-all after:content-[""]',
              variantStyles[variant],
              'dark:bg-aws-ui-color-dark peer-checked:border-aws-sea-blue-light dark:after:bg-white dark:peer-checked:border-white peer-checked:after:opacity-100',
              'after:opacity-0',
              disabled ? 'opacity-30' : 'hover:brightness-90'
            )}
          />
        </div>
        {label && (
          <div className="grow">
            <div className="text-sm dark:text-aws-font-color-dark">{label}</div>
          </div>
        )}
      </label>
      {hint && (
        <div className="ml-8 w-full pl-2 text-xs text-gray">{hint}</div>
      )}
    </div>
  );
};

export default RadioButton;
