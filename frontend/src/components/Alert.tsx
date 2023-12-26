import React, { useMemo } from 'react';
import { BaseProps } from '../@types/common';
import { PiWarningCircleFill, PiWarningFill } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps & {
  severity: 'warning' | 'error';
  title: string;
  children: React.ReactNode;
};

const Alert: React.FC<Props> = (props) => {
  const icon = useMemo(() => {
    return props.severity === 'warning' ? (
      <PiWarningFill className="text-2xl" />
    ) : (
      <PiWarningCircleFill className="text-2xl" />
    );
  }, [props.severity]);

  return (
    <div
      className={twMerge(
        'flex flex-col rounded border border-aws-squid-ink  shadow-lg',
        props.severity === 'error' && 'bg-red/10',
        props.className
      )}>
      <div
        className={twMerge(
          'flex gap-2 p-2 font-bold',
          props.severity === 'error' && 'text-red'
        )}>
        {icon}
        <div>{props.title}</div>
      </div>

      <div className="px-2 pb-2">{props.children}</div>
    </div>
  );
};

export default Alert;
