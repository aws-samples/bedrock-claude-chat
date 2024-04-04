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
          <span className="text-sm">{props.label}</span>
        </div>
      )}
      <Listbox
        value={props.value}
        disabled={props.disabled}
        onChange={props.onChange}>
        <div className={twMerge('relative')}>
          <Listbox.Button
            className={twMerge(
              'relative h-9 w-full cursor-default rounded border border-aws-font-color/50 py-1 pl-3 pr-10 text-left focus:outline-none',
              !props.disabled && 'bg-white'
            )}>
            <span className="block truncate">{selectedLabel}</span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <PiCaretUpDown className="h-5 w-5 text-gray" />
            </span>
          </Listbox.Button>
          {props.clearable && props.value !== '' && (
            <span className="absolute inset-y-0 right-6 flex items-center pr-2">
              <ButtonIcon onClick={onClear}>
                <PiX className="h-5 w-5 text-gray" />
              </ButtonIcon>
            </span>
          )}
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {props.options.map((option, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-aws-smile/10 text-aws-smile'
                        : 'text-aws-font-color'
                    }`
                  }
                  value={option.value}>
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}>
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <PiCheck className="h-5 w-5" />
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
