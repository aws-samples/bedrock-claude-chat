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

export const DEFAULT_GENERATION_CONFIG_PARAMS = {
  maxTokens: {
    MAX: 4096,
    MIN: 1,
    STEP: 1,
  },
  temperature: {
    MAX: 1,
    MIN: 0,
    STEP: .05,
  },
  topP: {
    MAX: 1,
    MIN: 0,
    STEP: 0.001,
  },
  topK: {
    MAX: 500,
    MIN: 0,
    STEP: 1,
  },
};

export const MISTRAL_GENERATION_CONFIG_PARAMS = {
  maxTokens: {
    MAX: 8192,
    MIN: 1,
    STEP: 1,
  },
  temperature: {
    MAX: 1,
    MIN: 0,
    STEP: 0.05,
  },
  topP: {
    MAX: 1,
    MIN: 0,
    STEP: 0.001,
  },
  topK: {
    MAX: 200,
    MIN: 0,
    STEP: 1,
  },
};

