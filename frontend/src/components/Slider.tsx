import { FC, Dispatch, ReactNode, useEffect, useState, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  label?: ReactNode;
  value: number;
  hint?: string;
  range: {
    min: number;
    max: number;
    step: number;
  };
  onChange: Dispatch<number>;
  disabled?: boolean;
  errorMessage?: string;
  enableDecimal?: boolean;
}

export const Slider: FC<Props> = (props) => {
  const [value, setValue] = useState<string>(String(props.value));

  useEffect(() => {
    setValue(prev => prev === String(props.value) ? prev : String(props.value));
  }, [props.value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const validateReg = props.enableDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    const newValStr = e.target.value;

    if (newValStr === '' || validateReg.test(newValStr)) {
      setValue(newValStr);
      const parseNumber = props.enableDecimal ? parseFloat : parseInt;   
      const newValue = parseNumber(newValStr !== '' ? newValStr : '0');
      props.onChange(newValue); 
    }
  }, [props, setValue]);

  return (
    <div className="flex flex-col">
      <label
        className={twMerge(
          'text-sm text-dark-gray dark:text-light-gray',
          props.errorMessage && 'border-red dark:border-red text-red dark:text-red'
        )}>
        {props.label}
      </label>
      <div className="flex gap-2">
        <input
          className={twMerge(
            'w-full cursor-pointer dark:accent-white',
            props.disabled && 'cursor-default'
          )}
          type="range"
          min={props.range.min}
          max={props.range.max}
          step={props.range.step}
          value={props.value}
          onChange={handleChange}
          disabled={props.disabled}
        />
        <input
          className={twMerge(
            'peer h-9 w-16 rounded-sm border p-1 text-center',
            props.errorMessage
              ? 'dark:bg-aws-ui-color-dark border-2 border-red dark:text-aws-font-color-dark'
              : 'dark:bg-aws-ui-color-dark border-aws-font-color-light/50 dark:border-aws-font-color-dark dark:text-aws-font-color-dark'
          )}
          value={value}
          max={props.range.max}
          min={props.range.min}
          onChange={handleChange}
          disabled={props.disabled}
        />
      </div>
      {props.hint && !props.errorMessage && (
        <span className={'mt-0.5 text-xs text-gray dark:text-aws-font-color-gray'}>{props.hint}</span>
      )}
      {props.errorMessage && (
        <div className="mt-0.5 text-xs text-red">{props.errorMessage}</div>
      )}
    </div>
  );
};
