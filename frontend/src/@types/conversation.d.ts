export type Role = 'system' | 'assistant' | 'user';
export type Model = 'titan' | 'claude';
export type Content = {
  contentType: 'text';
  body: string;
};

export type MessageContent = {
  role: Role;
  content: Content;
  model: Model;
};

export type MessageContentWithChildren = MessageContent & {
  id: string;
  parent: null | string;
  children: string[];
  sibling: string[];
};

export type PostMessageRequest = {
  conversationId?: string;
  stream: boolean;
  message: MessageContent & {
    parentMessageId: null | string;
  };
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
  lastMessageId: string;
};

export type MessageMap = {
  [messageId: string]: MessageContent & {
    children: string[];
    parent: null | string;
  };
};

export type Conversation = ConversationMeta & {
  messageMap: MessageMap;
};
