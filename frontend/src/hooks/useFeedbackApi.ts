import useHttp from './useHttp';
import {
  PostFeedbackRequest,
  PostFeedbackResponse,
} from '../@types/conversation';

const useFeedbackApi = () => {
  const http = useHttp();

  return {
    postFeedback: (
      conversationId: string,
      messageId: string,
      req: PostFeedbackRequest
    ) => {
      return http.put<PostFeedbackResponse, PostFeedbackRequest>(
        `/conversation/${conversationId}/${messageId}/feedback`,
        req
      );
    },
  };
};

export default useFeedbackApi;
