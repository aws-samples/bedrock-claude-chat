import { MessageContentWithChildren, MessageMap } from '../@types/conversation';

export const convertMessageMapToArray = (
  messageMap: MessageMap,
  currentMessageId: string
): MessageContentWithChildren[] => {
  if (Object.keys(messageMap).length === 0) {
    return [];
  }

  const messageArray: MessageContentWithChildren[] = [];
  let key: string | null = currentMessageId;
  let messageContent: MessageMap[string] = messageMap[key];

  //  指定のKeyが存在する場合
  if (messageContent) {
    //末端のKeyを取得
    while (messageContent.children.length > 0) {
      key = messageContent.children[0];
      messageContent = messageMap[key];
    }

    // 末端から順にArrayに設定してく
    while (key) {
      messageContent = messageMap[key];

      messageArray.unshift({
        id: key,
        model: messageContent.model,
        role: messageContent.role,
        content: messageContent.content,
        parent: messageContent.parent,
        children: messageContent.children,
        sibling: [],
      });

      key = messageContent.parent;
    }

    // 存在しないKeyが指定された場合
  } else {
    // 最上位のKeyを取得
    key = Object.keys(messageMap).filter(
      (k) => messageMap[k].parent === null
    )[0];

    // 上から順にArrayに設定する
    while (key) {
      messageContent = messageMap[key];

      messageArray.push({
        id: key,
        model: messageContent.model,
        role: messageContent.role,
        content: messageContent.content,
        parent: messageContent.parent,
        children: messageContent.children,
        sibling: [],
      });
      key = messageContent.children[0];
    }
  }

  messageArray[0].sibling = [messageArray[0].id];
  messageArray.forEach((m, idx) => {
    if (m.children.length > 0) {
      messageArray[idx + 1].sibling = [...m.children];
    }
  });

  return messageArray;
};
