import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useCallback } from 'react';
import { BaseProps } from '../@types/common';

type Props = BaseProps & {
  isOpen: boolean;
  title?: string;
  widthFromContent?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  onAfterLeave?: () => void;
};

const ModalDialog: React.FC<Props> = (props) => {
  const onClose = useCallback(() => {
    if (props.onClose) {
      props.onClose();
    }
  }, [props]);

  const onAfterLeave = useCallback(() => {
    if (props.onAfterLeave) {
      props.onAfterLeave();
    }
  }, [props]);

  return (
    <>
      <Transition
        appear
        show={props.isOpen}
        as={Fragment}
        afterLeave={onAfterLeave}>
        <Dialog as="div" className="relative z-50" onClose={() => onClose()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div
              className={`mx-auto flex min-h-full items-center justify-center p-4 text-center ${
                props.className ?? ''
              }`}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95">
                <Dialog.Panel
                  className={`rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${
                    !props.widthFromContent && 'w-full max-w-md'
                  }`}>
                  {props.title && (
                    <Dialog.Title
                      as="h3"
                      className="border-b pb-2 text-lg font-medium leading-6 text-aws-font-color">
                      {props.title}
                    </Dialog.Title>
                  )}

                  <div className="mt-3">
                    <div className="text-sm text-aws-font-color/70">
                      {props.children}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ModalDialog;
