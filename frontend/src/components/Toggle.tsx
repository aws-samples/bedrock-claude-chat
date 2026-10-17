import React from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  className?: string;
  label?: string;
  value: boolean;
  disabled?: boolean;
  hint?: string;
  onChange?: (b: boolean) => void;
};

const Toggle: React.FC<Props> = (props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (props.onChange) {
      props.onChange(!props.value);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={twMerge('my-2 flex flex-col pr-3', props.className)}>
      <label
        className={twMerge(
          'relative inline-flex items-center',
          props.disabled ? '' : 'cursor-pointer'
        )}
        onClick={handleClick}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={props.value}
          disabled={props.disabled}
          onChange={handleChange}
        />
        <div
          className={twMerge(
            "peer h-6 w-11 rounded-full bg-light-gray after:absolute after:inset-s-[2px] after:top-[2px] after:rounded-full after:border after:border-gray after:bg-white after:transition-all after:content-[''] peer-checked:bg-aws-sea-blue-light peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-aws-font-color-gray dark:after:bg-aws-ui-color-dark dark:peer-checked:bg-white peer-checked:rtl:after:-translate-x-full after:size-5",
            props.disabled ? 'opacity-20' : ''
          )}></div>
        {props.label && (
          <div className=" ml-2">
            <div className="text-sm">{props.label}</div>
          </div>
        )}
      </label>
      {props.hint && (
        <div className="ml-11 w-full pl-2 text-xs text-gray dark:text-aws-font-color-dark">
          {props.hint}
        </div>
      )}
    </div>
  );
};

export default Toggle;
