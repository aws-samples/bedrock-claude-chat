import { Fragment, useCallback, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { PiCaretUpDown, PiCheck, PiX } from 'react-icons/pi';
import ButtonIcon from './ButtonIcon';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps & {
  label?: string;
  value: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
  clearable?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
};

const Select: React.FC<Props> = (props) => {
  const selectedLabel = useMemo(() => {
    return props.options.find((o) => o.value === props.value)?.label ?? '';
  }, [props.options, props.value]);

  const onClear = useCallback(() => {
    props.onChange('');
  }, [props]);

  return (
    <div className={props.className}>
      {props.label && (
        <div>
          <span className="text-sm dark:text-aws-font-color-dark">{props.label}</span>
        </div>
      )}
      <Listbox
        value={props.value}
        disabled={props.disabled}
        onChange={props.onChange}>
        <div className={twMerge('relative')}>
          <Listbox.Button
            className={twMerge(
              'relative h-9 w-full cursor-default rounded-sm border border-aws-font-color-light/50 dark:border-aws-font-color-dark/50 py-1 pl-3 pr-10 text-left dark:text-aws-font-color-dark focus:outline-hidden',
              !props.disabled && 'bg-white dark:bg-aws-ui-color-dark'
            )}>
            <span className="block truncate">{selectedLabel}</span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <PiCaretUpDown className="size-5 text-gray" />
            </span>
          </Listbox.Button>
          {props.clearable && props.value !== '' && (
            <span className="absolute inset-y-0 right-6 flex items-center pr-2">
              <ButtonIcon onClick={onClear}>
                <PiX className="size-5 text-gray" />
              </ButtonIcon>
            </span>
          )}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-aws-ui-color-dark py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm">
              {props.options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-aws-smile/10 text-aws-smile dark:bg-aws-font-color-dark/10 dark:text-aws-font-color-dark'
                        : 'text-aws-font-color-light dark:text-aws-font-color-dark'
                    }`
                  }
                  value={option.value}>
                  {({ selected }) => (
                    <>
                      <span
                        className={`flex flex-col truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}>
                        <span className="flex-1">{option.label}</span>
                        {option.description && (
                          <span className="flex-1 whitespace-pre-wrap text-aws-font-color-light/60 dark:text-aws-font-color-dark/60">
                            {option.description}
                          </span>
                        )}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <PiCheck className="size-5" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default Select;
