import { FC, Dispatch } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
  title: string;
  value: number;
  description: string;
  range: {
    min: number;
    max: number;
    div: number;
  };
  onChange: Dispatch<number>;
  errorMessage?: string;
}

export const Slider: FC<Props> = (props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    const newValue = parseInt(
      event.target.value != '' ? event.target.value : '0'
    );
    props.onChange(newValue);
  };

  return (
    <div className="flex flex-col py-2">
      <label
        className={twMerge(
          'mb-2 text-left text-neutral-700 dark:text-neutral-400',
          props.errorMessage && 'border-red text-red'
        )}>
        {props.title}
      </label>
      <div className="flex gap-2">
        <input
          className="w-full cursor-pointer"
          type="range"
          min={props.range.min}
          max={props.range.max}
          step={props.range.div}
          value={props.value}
          onChange={handleChange}
        />
        <span className="text-neutral-900">
          <input
            className={twMerge(
              'w-[72px] text-center',
              props.errorMessage && 'text-red'
            )}
            value={props.value}
            max={props.range.max}
            onChange={handleChange}
          />
        </span>
      </div>

      <span
        className={twMerge(
          'text-sm text-black/50',
          props.errorMessage && 'border-red text-red'
        )}>
        {props.description}
      </span>
      {props.errorMessage && (
        <div className="mt-0.5 text-xs text-red">{props.errorMessage}</div>
      )}
    </div>
  );
};
