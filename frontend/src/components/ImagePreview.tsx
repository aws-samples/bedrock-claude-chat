import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { BaseProps } from '../@types/common';

type ImagePreviewProps = BaseProps & {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onAfterLeave: () => void;
};

const ImagePreview: React.FC<ImagePreviewProps> = (props) => {
  return (
    <>
      <Transition
        appear
        show={props.isOpen}
        as={Fragment}
        afterLeave={props.onAfterLeave}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => props.onClose()}>
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
                <Dialog.Panel className="rounded-2xl bg-white p-6 align-middle shadow-xl transition-all">
                  <img
                    src={props.imageUrl}
                    className="mx-auto max-h-[80vh] max-w-full rounded-md"
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ImagePreview;
