export type Role = "system" | "assistant" | "user";
export type Model = "titan" | "claude";
export type Content = {
  contentType: "text";
  body: string;
};

export type MessageContent = {
  role: Role;
  content: Content;
  model: Model;
};

export type PostMessageRequest = {
  conversationId?: string;
  stream: boolean;
  message: MessageContent;
};

export type PostMessageResponse = {
  conversationId: string;
  createTime: number;
  message: MessageContent;
};

export type ConversationMeta = {
  id: string;
  title: string;
  createTime: number;
};

export type Conversation = ConversationMeta & {
  messages: MessageContent[];
};
