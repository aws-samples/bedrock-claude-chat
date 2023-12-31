import React from 'react';

type Props = {
  className?: string;
  label?: string;
  value: string;
  disabled?: boolean;
  onChange: (s: string) => void;
};

const InputText: React.FC<Props> = (props) => {
  return (
    <div className={`flex flex-col ${props.className ?? ''}`}>
      <input
        type="text"
        className="peer rounded border border-aws-font-color/50 p-1 "
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      {props.label && (
        <div className="order-first text-sm text-gray-500 peer-focus:font-semibold peer-focus:italic peer-focus:text-aws-font-color">
          {props.label}
        </div>
      )}
    </div>
  );
};

export default InputText;
