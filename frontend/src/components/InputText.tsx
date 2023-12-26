import React, { HTMLInputTypeAttribute } from 'react';

type Props = {
  className?: string;
  label?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  disabled?: boolean;
  hint?: string;
  onChange: (s: string) => void;
};

const InputText: React.FC<Props> = (props) => {
  return (
    <div className={`flex flex-col ${props.className ?? ''}`}>
      <input
        type={props.type ?? 'text'}
        className="peer rounded border border-aws-font-color/50 p-1 "
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      {props.label && (
        <div className="order-first text-sm text-dark-gray peer-focus:font-semibold peer-focus:italic peer-focus:text-aws-font-color">
          {props.label}
        </div>
      )}
      {props.hint && (
        <div className="mt-0.5 text-xs text-gray">{props.hint}</div>
      )}
    </div>
  );
};

export default InputText;
