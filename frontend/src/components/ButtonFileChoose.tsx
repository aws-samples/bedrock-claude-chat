import React, { ReactNode, useCallback } from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps & {
  children: ReactNode;
  disabled?: boolean;
  accept?: string;
  icon?: boolean;
  onChange: (fileList: FileList) => void;
};

const ButtonFileChoose: React.FC<Props> = (props) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.target.files) {
        props.onChange(e.target.files);
      }
    },
    [props]
  );

  return (
    <label
      className={twMerge(
        props.className,
        'flex  items-center justify-center whitespace-nowrap rounded-lg  hover:shadow-sm hover:brightness-75',
        props.icon
          ? 'rounded-full p-2 text-xl text-aws-sea-blue-light dark:text-aws-sea-blue-dark'
          : 'border dark:border-aws-ui-color-dark bg-aws-sea-blue-light dark:bg-aws-ui-color-dark p-1 px-3 text-aws-font-color-white-light dark:text-aws-font-color-white-dark',
        props.disabled ? 'opacity-30 ' : 'cursor-pointer'
      )}>
      {props.children}
      <input
        type="file"
        hidden
        disabled={props.disabled}
        multiple
        value={[]}
        onChange={onChange}
        accept={props.accept}
      />
    </label>
  );
};

export default ButtonFileChoose;
