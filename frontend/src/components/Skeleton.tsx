import React from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps;

const Skeleton: React.FC<Props> = (props) => {
  return (
    <div
      className={twMerge(
        `h-4 w-2/3 animate-pulse rounded-sm bg-aws-font-color-light/20 dark:bg-aws-font-color-dark/20`,
        props.className
      )}></div>
  );
};

export default Skeleton;
