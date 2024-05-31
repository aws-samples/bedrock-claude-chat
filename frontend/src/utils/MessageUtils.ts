import { DisplayMessageContent, MessageMap } from '../@types/conversation';

export const convertMessageMapToArray = (
  messageMap: MessageMap,
  currentMessageId: string
): DisplayMessageContent[] => {
  if (Object.keys(messageMap).length === 0) {
    return [];
  }

  const messageArray: DisplayMessageContent[] = [];
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
      // 参照が途中で切れている場合は処理中断
      if (!messageContent) {
        messageArray[0].parent = null;
        break;
      }

      // 既に配列上に存在する場合は循環参照状態なので処理中断
      if (
        messageArray.some((a) => {
          return a.id === key || a.children.includes(key ?? '');
        })
      ) {
        messageArray[0].parent = null;
        break;
      }

      messageArray.unshift({
        id: key,
        model: messageContent.model,
        role: messageContent.role,
        content: messageContent.content,
        parent: messageContent.parent,
        children: messageContent.children,
        sibling: [],
        feedback: messageContent.feedback,
        usedChunks: messageContent.usedChunks,
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
      // 参照が途中で切れている場合は処理中断
      if (!messageContent) {
        messageArray[messageArray.length - 1].children = [];
        break;
      }

      // 既に配列上に存在する場合は循環参照状態なので処理中断
      if (
        messageArray.some((a) => {
          return a.id === key;
        })
      ) {
        messageArray[messageArray.length - 1].children = [];
        break;
      }

      messageArray.push({
        id: key,
        model: messageContent.model,
        role: messageContent.role,
        content: messageContent.content,
        parent: messageContent.parent,
        children: messageContent.children,
        sibling: [],
        feedback: messageContent.feedback,
        usedChunks: messageContent.usedChunks,
      });
      key = messageContent.children[0];
    }
  }

  // 兄弟ノードの設定
  messageArray[0].sibling = [messageArray[0].id];
  messageArray.forEach((m, idx) => {
    if (m.children.length > 0) {
      messageArray[idx + 1].sibling = [...m.children];
    }
  });
  // 先頭にsystemノードが設定されている場合は、それを除去する
  if (messageArray[0].id === 'system') {
    messageArray.shift();
  }

  return messageArray;
};
