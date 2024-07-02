import React, { useCallback, useEffect, useState } from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps & {
  fileName: string;
  onClick?: () => void;
};

const UploadedFileText: React.FC<Props> = (props) => {
  const onClick = useCallback(() => {
    if (props.onClick) {
      props.onClick();
    }
  }, [props]);

  const [shortFileName, setShortFileName] = useState('');

  useEffect(() => {
    const truncateFileName = (name: string | undefined, maxLength = 24) => {
      if (name === undefined) {
        return '';
      }
      if (name.length <= maxLength) {
        return name;
      }
      const halfLength = Math.floor((maxLength - 3) / 2);
      return `${name.slice(0, halfLength)}...${name.slice(-halfLength)}`;
    };

    const name = truncateFileName(props.fileName);

    setShortFileName(name);
  }, [props.fileName]);

  return (
    <div
      className={twMerge(
        'relative mx-2 flex flex-col items-center',
        props.onClick ? 'cursor-pointer hover:brightness-75' : ''
      )}
      onClick={() => onClick()}>
      <div className="flex w-full ">
        <div className="w-full rounded-tl-lg border-l border-t border-gray bg-aws-paper "></div>
        <svg
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-4 w-4 shrink-0 drop-shadow">
          <path
            d="M0 0L16 16H0V0Z"
            className="fill-aws-paper stroke-gray"
            strokeWidth="0.5"></path>
        </svg>
      </div>
      <div className="flex h-20 items-center justify-center rounded-b-lg border-x border-b border-gray bg-aws-paper p-2 ">
        <div className="w-16 break-words text-center text-xs font-bold text-dark-gray">
          {shortFileName}
        </div>
      </div>
    </div>
  );
};

export default UploadedFileText;
