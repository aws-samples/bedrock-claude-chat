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
  return (
    <div className="my-2 flex flex-col pr-3">
      <label
        className={twMerge(
          'relative inline-flex items-center',
          props.disabled ? '' : 'cursor-pointer'
        )}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={props.value}
          disabled={props.disabled}
          onChange={() => {
            props.onChange ? props.onChange(!props.value) : null;
          }}
        />
        <div
          className={twMerge(
            "peer h-6 w-11 rounded-full bg-light-gray after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray after:bg-white after:transition-all after:content-[''] peer-checked:bg-aws-sea-blue peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full",
            props.disabled ? 'opacity-20' : ''
          )}></div>
        {props.label && (
          <div className=" ml-2">
            <div className="text-sm">{props.label}</div>
          </div>
        )}
      </label>
      {props.hint && (
        <div className="ml-11 w-full pl-2 text-xs text-gray">{props.hint}</div>
      )}
    </div>
  );
};

export default Toggle;
