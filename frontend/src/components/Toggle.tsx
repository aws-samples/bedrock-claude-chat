import React from 'react';

type Props = {
  className?: string;
  label?: string;
  value: boolean;
  onChange: (b: boolean) => void;
};

const Toggle: React.FC<Props> = (props) => {
  return (
    <div className="my-2 flex justify-end pr-3">
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          value=""
          className="peer sr-only"
          checked={props.value}
          onChange={() => {
            props.onChange(!props.value);
          }}
        />
        <div className="peer h-6 w-11 rounded-full bg-light-gray after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray after:bg-white after:transition-all after:content-[''] peer-checked:bg-aws-sea-blue peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"></div>
        <span className="ml-1 text-xs font-medium">{props.label}</span>
      </label>
    </div>
  );
};

export default Toggle;
