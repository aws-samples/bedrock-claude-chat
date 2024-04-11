import { EmdeddingPrams } from '../@types/bot';

export const DEFAULT_EMBEDDING_CONFIG: EmdeddingPrams = {
  chunkSize: 1000,
  chunkOverlap: 200,
};

export const EDGE_EMBEDDING_PARAMS = {
  chunkSize: {
    MAX: 2048,
    MIN: 512,
    STEP: 2,
  },
  chunkOverlap: {
    MAX: 1024,
    MIN: 128,
    STEP: 2,
  },
};
