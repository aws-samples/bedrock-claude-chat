import React, { forwardRef } from 'react';
import { BaseProps } from '../@types/common';

type Props = BaseProps & {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  text?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  return (
    <button
      ref={ref}
      className={`${
        props.className ?? ''
      } flex items-center justify-center rounded-lg ${
        props.text ? '' : 'border'
      } p-1 px-3  ${
        (props.className?.indexOf('bg-') ?? -1) < 0
          ? ' bg-aws-sea-blue text-aws-font-color-white'
          : ''
      }  ${props.disabled ? 'opacity-30' : 'hover:brightness-75'} `}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.onClick();
      }}
      disabled={props.disabled}>
      {props.icon && <div className="mr-2">{props.icon}</div>}
      {props.children}
      {props.rightIcon && <div className="mr-2">{props.rightIcon}</div>}
    </button>
  );
});

export default Button;
