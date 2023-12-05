import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  className?: string;
  isActive?: boolean;
  to: string;
  icon: ReactNode;
  labelComponent: ReactNode;
  actionComponent?: ReactNode;
  onClick?: () => void;
};

const DrawerItem: React.FC<Props> = (props) => {
  return (
    <Link
      className={`group mx-2 my-1 flex h-10 items-center  rounded px-2 ${
        props.isActive ?? true
          ? 'bg-aws-sea-blue'
          : 'hover:bg-aws-sea-blue-hover'
      } ${props.className ?? ''}`}
      to={props.to}
      onClick={props.onClick}>
      <div
        className={`flex h-8 max-h-5 w-full items-center justify-start overflow-hidden`}>
        <div className="mr-2 text-base">{props.icon}</div>
        <div className="relative flex-1 text-ellipsis break-all">
          {props.labelComponent}
        </div>

        <div className="flex">{props.actionComponent}</div>
      </div>
    </Link>
  );
};

export default DrawerItem;
