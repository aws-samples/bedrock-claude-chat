import { Popover, Transition } from '@headlessui/react';
import React, { Fragment, ReactNode } from 'react';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';

type Props = {
  className?: string;
  children: ReactNode;
};

const ButtonPopover: React.FC<Props> = (props) => {
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
            <Popover.Panel className="absolute z-10">
              <div className="mt-0.5 overflow-hidden shadow-lg">
                {props.children}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default ButtonPopover;
