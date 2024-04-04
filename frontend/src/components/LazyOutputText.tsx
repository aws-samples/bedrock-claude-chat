import React, { useEffect, useState } from 'react';
import { BaseProps } from '../@types/common';
import { PiRectangleFill } from 'react-icons/pi';

type Props = BaseProps & {
  text: string;
};

const LazyOutputText: React.FC<Props> = (props) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const functions: NodeJS.Timeout[] = [];
    props.text.split('').forEach((_, idx) => {
      functions.push(
        setTimeout(() => {
          setDisplayText(() => {
            return props.text.substring(0, idx + 1);
          });
        }, idx * 200)
      );
    });

    return () => {
      // 多重読み込み対策でクリアする
      functions.forEach((f) => {
        clearTimeout(f);
      });
    };
  }, [props.text]);

  return (
    <div className={`${props.className ?? ''} flex items-center`}>
      {displayText}
      {props.text !== displayText && (
        <PiRectangleFill className="rotate-90 -scale-y-75 animate-fastPulse text-xl" />
      )}
    </div>
  );
};

export default LazyOutputText;
