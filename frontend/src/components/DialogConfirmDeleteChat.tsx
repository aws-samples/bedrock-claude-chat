import React from "react";
import { BaseProps } from "../@types/common";
import { ConversationMeta } from "../@types/conversation";
import Button from "./Button";
import ModalDialog from "./ModalDialog";

type Props = BaseProps & {
  isOpen: boolean;
  target?: ConversationMeta;
  onDelete: (conversationId: string) => void;
  onClose: () => void;
};

const DialogConfirmDeleteChat: React.FC<Props> = (props) => {
  return (
    <ModalDialog {...props} title="削除確認">
      <div>
        チャット
        <span className="font-bold">「{props.target?.title}」</span>
        を削除しますか？
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          onClick={props.onClose}
          className="bg-transparent text-aws-font-color p-2"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            props.onDelete(props.target?.id ?? "");
          }}
          className="bg-red-500 text-aws-font-color-white p-2"
        >
          削除
        </Button>
      </div>
    </ModalDialog>
  );
};

export default DialogConfirmDeleteChat;
