import React, { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

const PopoverItem: React.FC<Props> = (props) => {
  return (
    <div
      className={`${
        props.className ?? ''
      } flex cursor-pointer items-center gap-1 border-b border-aws-font-color/50 bg-aws-paper px-2 py-1 first:rounded-t last:rounded-b last:border-b-0 hover:brightness-75`}
      onClick={props.onClick}>
      {props.children}
    </div>
  );
};

export default PopoverItem;
