import React, { ReactNode, useState } from 'react';
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';

type Props = {
  className?: string;
  label: string;
  children: ReactNode;
};

const ExpandableDrawerGroup: React.FC<Props> = (props) => {
  const [isShow, setIsShow] = useState(true);

  return (
    <div className={`${props.className ?? ''}`}>
      <div className="flex items-center">
        <ButtonIcon
          className="px-2 transition"
          onClick={() => {
            setIsShow(!isShow);
          }}>
          {isShow ? (
            <PiCaretDown className="text-sm" />
          ) : (
            <PiCaretUp className="text-sm" />
          )}
        </ButtonIcon>

        <div className="italic">{props.label}</div>
      </div>
      {/* <div className="">{isShow && props.children}</div> */}
      <div className="">
        <div
          className={`origin-top transition-all ${
            isShow ? 'visible' : 'h-0 scale-y-0'
          }`}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default ExpandableDrawerGroup;
