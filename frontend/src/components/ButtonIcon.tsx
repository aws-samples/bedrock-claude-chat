import React from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps & {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const ButtonIcon: React.FC<Props> = (props) => {
  return (
    <button
      className={twMerge(
        'flex items-center justify-center rounded-full p-2 text-xl hover:shadow',
        props.disabled ? 'opacity-30' : 'hover:brightness-75',
        props.className
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.onClick();
      }}
      disabled={props.disabled}>
      {props.children}
    </button>
  );
};

export default ButtonIcon;
