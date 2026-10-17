import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type Props = {
  className?: string;
  isActive?: boolean;
  isBlur?: boolean;
  to: string;
  icon: ReactNode;
  labelComponent: ReactNode;
  actionComponent?: ReactNode;
  onClick?: () => void;
};

const DrawerItem: React.FC<Props> = (props) => {
  return (
    <Link
      className={twMerge(
        'group mx-2 my-1 flex h-10 items-center  rounded-sm px-2',
        (props.isActive ?? true)
          ? 'bg-aws-sea-blue-light dark:bg-aws-sea-blue-dark'
          : 'hover:bg-aws-sea-blue-hover-light dark:hover:bg-aws-paper-dark',
        props.className
      )}
      to={props.to}
      onClick={props.onClick}>
      <div className={`flex h-8 max-h-5 w-full justify-start overflow-hidden`}>
        <div className="mr-2 pt-0.5">{props.icon}</div>
        <div className="relative flex-1 text-ellipsis break-all">
          {props.labelComponent}
          {(props.isBlur ?? true) && (
            <div
              className={twMerge(
                'absolute inset-y-0 right-0 w-8 bg-linear-to-l',
                props.isActive
                  ? 'from-aws-sea-blue-light dark:from-aws-sea-blue-dark'
                  : 'from-aws-squid-ink-light group-hover:from-aws-sea-blue-hover-light dark:from-aws-squid-ink-dark dark:group-hover:from-aws-paper-dark'
              )}
            />
          )}
        </div>

        <div className="flex">{props.actionComponent}</div>
      </div>
    </Link>
  );
};

export default DrawerItem;
