import React, { HTMLInputTypeAttribute } from 'react';
import { InputLabel } from './InputLabel';

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
        <InputLabel>{props.label}</InputLabel>
      )}
      {props.hint && (
        <div className="mt-0.5 text-xs text-gray">{props.hint}</div>
      )}
    </div>
  );
};

export default InputText;
