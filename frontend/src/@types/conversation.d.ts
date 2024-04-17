export type Role = 'system' | 'assistant' | 'user';
export type Model =
  | 'claude-instant-v1'
  | 'claude-v2'
  | 'claude-v2-1'
  | 'claude-v3-sonnet'
  | 'claude-v3-haiku'
  | 'mistral-7b-instruct'
  | 'mixtral-8x7b-instruct';
export type Content = {
  contentType: 'text' | 'image';
  mediaType?: string;
  body: string;
};

export type MessageContent = {
  role: Role;
  content: Content[];
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
  botId?: string;
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
  model: Model;
  botId?: string;
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
