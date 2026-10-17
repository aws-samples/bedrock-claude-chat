import React from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';
type Props = BaseProps & {
  progress?: number;
  thin?: boolean;
};

const Progress: React.FC<Props> = (props) => {
  return (
    <div
      className={twMerge(
        'w-full rounded-full bg-gray transition-all',
        !props.progress && 'overflow-hidden',
        props.thin ? 'h-1' : 'h-2.5'
      )}>
      <div
        className={twMerge(
          `rounded-full bg-aws-aqua`,
          !props.progress && 'animate-liner-progress',
          props.thin ? 'h-1' : 'h-2.5'
        )}
        style={props.progress ? { width: `${props.progress}%` } : {}}
      />
    </div>
  );
};

export default Progress;
