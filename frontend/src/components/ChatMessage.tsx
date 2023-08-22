import React, { useMemo } from "react";
import Markdown from "./Markdown";
import ButtonCopy from "./ButtonCopy";
import { PiChatCircleDotsFill, PiUserFill } from "react-icons/pi";
import { BaseProps } from "../@types/common";
import MLIcon from "../assets/ML-icon.svg";
import { MessageContent } from "../@types/conversation";

type Props = BaseProps & {
  chatContent?: MessageContent;
  loading?: boolean;
};

const ChatMessage: React.FC<Props> = (props) => {
  const chatContent = useMemo<MessageContent | undefined>(() => {
    if (props.loading) {
      return {
        model: "claude",
        content: {
          body: "",
          contentType: "text",
        },
        role: "assistant",
      };
    }
    return props.chatContent;
  }, [props]);

  return (
    <div className="flex justify-center">
      <div
        className={`${
          props.className ?? ""
        } m-3 flex w-full flex-col justify-between md:w-11/12 lg:-ml-24 lg:w-4/6 lg:flex-row xl:w-3/6`}
      >
        <div className="flex">
          {chatContent?.role === "user" && (
            <div className="h-min rounded bg-aws-sea-blue p-2 text-xl text-white">
              <PiUserFill />
            </div>
          )}
          {chatContent?.role === "assistant" && (
            <div className="min-w-[2.5rem] max-w-[2.5rem]">
              <img src={MLIcon} />
            </div>
          )}

          <div className="ml-5 grow ">
            {chatContent?.role === "user" && (
              <div className="break-all">
                {chatContent.content.body.split("\n").map((c, idx) => (
                  <div key={idx}>{c}</div>
                ))}
              </div>
            )}
            {chatContent?.role === "assistant" && !props.loading && (
              <Markdown>{chatContent.content.body}</Markdown>
            )}
            {props.loading && (
              <div className="animate-pulse text-2xl text-gray-400">
                <PiChatCircleDotsFill />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start justify-end lg:-mr-24">
          {chatContent?.role === "user" && <div className="lg:w-8"></div>}
          {chatContent?.role === "assistant" && !props.loading && (
            <>
              <ButtonCopy
                className="mr-0.5 text-gray-400"
                text={chatContent.content.body}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
