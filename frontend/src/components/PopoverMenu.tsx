import { Popover, Transition } from '@headlessui/react';
import React, { Fragment, ReactNode, useMemo } from 'react';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';

type Props = {
  className?: string;
  target?: 'bottom-left' | 'bottom-right';
  children: ReactNode;
};

const PopoverMenu: React.FC<Props> = (props) => {
  const origin = useMemo(() => {
    if (props.target === 'bottom-left') {
      return 'left-0';
    } else if (props.target === 'bottom-right') {
      return 'right-0';
    }
    return 'left-3';
  }, [props.target]);

  return (
    <Popover className="relative">
      {() => (
        <>
          <Popover.Button
            className={`${
              props.className ?? ''
            } group inline-flex items-center rounded-lg border border-aws-squid-ink/50 bg-aws-paper p-1 px-3 text-base hover:brightness-75`}>
            <PiDotsThreeOutlineFill />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1">
            <Popover.Panel className={`absolute z-10 ${origin}`}>
              <div className="mt-0.5 overflow-hidden shadow-lg">
                <div className="flex flex-col whitespace-nowrap rounded border border-aws-font-color/50 bg-aws-paper text-sm">
                  {props.children}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default PopoverMenu;
