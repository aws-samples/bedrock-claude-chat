import React from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps;

const Skeleton: React.FC<Props> = (props) => {
  return (
    <div
      className={twMerge(
        `h-4 w-2/3 animate-pulse rounded bg-aws-font-color/20`,
        props.className
      )}></div>
  );
};

export default Skeleton;
