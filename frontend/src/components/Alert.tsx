import React from 'react';
import { BaseProps } from '../@types/common';
import { PiWarningFill } from 'react-icons/pi';

type Props = BaseProps & {
  children: React.ReactNode;
};

const Alert: React.FC<Props> = (props) => {
  return (
    <div className="flex gap-2 rounded border border-aws-squid-ink bg-aws-squid-ink p-3 text-white shadow-lg">
      <PiWarningFill className="w-12 text-2xl" />
      <div>{props.children}</div>
    </div>
  );
};

export default Alert;
