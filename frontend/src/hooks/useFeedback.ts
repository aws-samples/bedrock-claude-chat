import useFeedbackApi from './useFeedbackApi';
import { PutFeedbackRequest } from '../@types/conversation';
import useConversationApi from './useConversationApi';

const useFeedback = (conversationId: string, messageId: string) => {
  const { putFeedback } = useFeedbackApi();
  const conversationApi = useConversationApi();

  const { mutate, data } = conversationApi.getConversation(conversationId);

  const feedback = data?.messageMap[messageId].feedback;

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
    feedback,
  };
};

export default useFeedback;
