import React from "react";
import { PiPaperPlaneRightFill, PiSpinnerGap } from "react-icons/pi";
import { BaseProps } from "../@types/common";

type Props = BaseProps & {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

const ButtonSend: React.FC<Props> = (props) => {
  return (
    <button
      className={`${
        props.className ?? ""
      } flex items-center justify-center rounded-xl border p-2 text-xl border-aws-sea-blue text-aws-sea-blue  ${
        props.disabled ? "opacity-30" : ""
      }`}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
    >
      {props.loading ? (
        <PiSpinnerGap className="animate-spin" />
      ) : (
        <PiPaperPlaneRightFill />
      )}
    </button>
  );
};

export default ButtonSend;
