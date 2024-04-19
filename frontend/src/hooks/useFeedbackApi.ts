import useHttp from './useHttp';
import { PutFeedbackRequest, Feedback } from '../@types/conversation';

const useFeedbackApi = () => {
  const http = useHttp();

  return {
    putFeedback: (
      conversationId: string,
      messageId: string,
      req: PutFeedbackRequest
    ) => {
      return http.put<Feedback, PutFeedbackRequest>(
        `/conversation/${conversationId}/${messageId}/feedback`,
        req
      );
    },
  };
};

export default useFeedbackApi;
