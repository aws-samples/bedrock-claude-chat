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
          'text-sm text-dark-gray',
          props.errorMessage && 'border-red text-red'
        )}>
        {props.label}
      </label>
      <div className="flex gap-2">
        <input
          className="w-full cursor-pointer"
          type="range"
          min={props.range.min}
          max={props.range.max}
          step={props.range.step}
          value={props.value}
          onChange={handleChange}
        />
        <input
          className={twMerge(
            'peer h-9 w-16 rounded border p-1 text-center',
            props.errorMessage
              ? 'border-2 border-red'
              : 'border-aws-font-color/50 '
          )}
          value={value}
          max={props.range.max}
          min={props.range.min}
          onChange={handleChange}
        />
      </div>
      {props.hint && !props.errorMessage && (
        <span className={'mt-0.5 text-xs text-gray'}>{props.hint}</span>
      )}
      {props.errorMessage && (
        <div className="mt-0.5 text-xs text-red">{props.errorMessage}</div>
      )}
    </div>
  );
};
