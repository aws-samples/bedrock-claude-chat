import useFeedbackApi from './useFeedbackApi';
import { PutFeedbackRequest } from '../@types/conversation';
import useConversationApi from './useConversationApi';

const useFeedback = (conversationId: string, messageId: string) => {
  const { putFeedback } = useFeedbackApi();
  const conversationApi = useConversationApi();

  const { mutate } = conversationApi.getConversation(conversationId);

  const giveFeedback = (feedback: PutFeedbackRequest) => {
    putFeedback(conversationId, messageId, feedback)
      .then(() => {
        mutate();
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return {
    giveFeedback,
  };
};

export default useFeedback;
