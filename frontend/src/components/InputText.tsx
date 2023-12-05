import React from 'react';

type Props = {
  className?: string;
  label?: string;
  value: string;
  onChange: (s: string) => void;
};

const InputText: React.FC<Props> = (props) => {
  return (
    <div className={`flex flex-col ${props.className ?? ''}`}>
      <input
        type="email"
        className="peer rounded border border-aws-font-color/50 p-1 "
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      {props.label && (
        <div className="order-first peer-focus:font-semibold peer-focus:italic">
          {props.label}
        </div>
      )}
    </div>
  );
};

export default InputText;
