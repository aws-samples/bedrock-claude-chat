import useBotApi from './useBotApi';

const useBotSummary = (botId?: string) => {
  const { botSummary } = useBotApi();
  const response = botSummary(botId);

  return response;
};

export default useBotSummary;
