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
      } flex cursor-pointer items-center gap-1 border-b border-aws-font-color-light/50 dark:border-aws-font-color-dark/50 bg-aws-paper-light dark:bg-aws-paper-dark px-2 py-1 first:rounded-t-sm last:rounded-b-sm last:border-b-0 hover:brightness-75`}
      onClick={props.onClick}>
      {props.children}
    </div>
  );
};

export default PopoverItem;
