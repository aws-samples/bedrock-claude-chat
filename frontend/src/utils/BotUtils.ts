import copy from 'copy-to-clipboard';

export const getBotUrl = (botId: string) => {
  return `${window.location.origin}/bot/${botId}`;
};

export const copyBotUrl = (botId: string) => {
  copy(getBotUrl(botId));
};
