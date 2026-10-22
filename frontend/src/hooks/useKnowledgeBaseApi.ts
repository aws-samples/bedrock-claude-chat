import { ListKnowledgeBasesResponse } from '../@types/knowledgeBase';
import useHttp from './useHttp';

const useKnowledgeBaseApi = () => {
  const http = useHttp();

  return {
    listKnowledgeBases: () => {
      return http.get<ListKnowledgeBasesResponse>('knowledge-bases');
    },
  };
};

export default useKnowledgeBaseApi;
