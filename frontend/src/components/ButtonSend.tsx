import { PiPaperPlaneRightFill } from 'react-icons/pi';
import { BaseProps } from '../@types/common';
import { twMerge } from 'tailwind-merge';
import { FaStop } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

type Props = BaseProps & {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  onClickLoading: () => void;
};

const ButtonSend: React.FC<Props> = (props) => {

  return (
    <>
      {props.loading ?
        <button
          className={twMerge(
            'flex items-center justify-center rounded-xl border border-aws-sea-blue bg-white p-2 text-xl text-aws-sea-blue',
            props.className
          )}
          onClick={props.onClickLoading}>
          <div className="flex items-center justify-center">
            <ImSpinner8 className="animate-spin p-n1" />
            <FaStop className=" absolute text-[0.5rem]" />
          </div>
        </button>
        :
        <button
          className={twMerge(
            'flex items-center justify-center rounded-xl border border-aws-sea-blue bg-white p-2 text-xl text-aws-sea-blue',
            props.disabled ? 'opacity-30' : '',
            props.className
          )}
          onClick={props.onClick}
          disabled={props.disabled}>
          <PiPaperPlaneRightFill />
        </button>
      }
    </>
  );
};

export default ButtonSend;
