import useFeedbackApi from './useFeedbackApi';
import { PostFeedbackRequest } from '../@types/conversation';

const useFeedback = () => {
  const { postFeedback } = useFeedbackApi();

  const handlePostFeedback = (
    conversationId: string,
    messageId: string,
    feedback: PostFeedbackRequest
  ) => {
    return postFeedback(conversationId, messageId, feedback);
  };

  return {
    postFeedback: handlePostFeedback,
  };
};

export default useFeedback;
