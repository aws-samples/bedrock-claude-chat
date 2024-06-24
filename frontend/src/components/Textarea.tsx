import React, { useEffect, useRef, useState } from 'react';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';

type Props = BaseProps & {
  value?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  noBorder?: boolean;
  rows?: number;
  onChange?: (value: string) => void;
};

const MAX_HEIGHT = 300;

const Textarea: React.FC<Props> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [isMax, setIsMax] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.style.height = 'auto';

    if (ref.current.scrollHeight > MAX_HEIGHT) {
      ref.current.style.height = MAX_HEIGHT + 'px';
      setIsMax(true);
    } else {
      ref.current.style.height = ref.current.scrollHeight + 'px';
      setIsMax(false);
    }
  }, [props.value]);

  useEffect(() => {
    const activeCodes: { [key in KeyboardEvent['code']]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      activeCodes[event.code] = true;
      if (
        activeCodes['Escape'] &&
        (activeCodes['ShiftLeft'] || activeCodes['ShiftRight'])
      ) {
        ref.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className={`${props.className ?? ''} flex w-full flex-col`}>
      <textarea
        ref={ref}
        className={twMerge(
          'peer w-full resize-none rounded p-1.5 outline-none',
          isMax ? 'overflow-y-auto' : 'overflow-hidden',
          props.noBorder ? '' : 'border border-aws-font-color/50',
          props.className
        )}
        rows={props.rows ?? 1}
        placeholder={props.placeholder}
        disabled={props.disabled}
        value={props.value}
        onChange={(e) => {
          props.onChange ? props.onChange(e.target.value) : null;
        }}
      />
      {props.label && (
        <div className="order-first text-sm text-dark-gray peer-focus:font-semibold peer-focus:italic peer-focus:text-aws-font-color">
          {props.label}
        </div>
      )}
      {props.hint && (
        <div className="mt-0.5 text-xs text-gray">{props.hint}</div>
      )}
    </div>
  );
};

export default Textarea;
