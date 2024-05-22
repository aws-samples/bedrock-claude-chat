import { EmdeddingParams, GenerationParams, SearchParams } from '../@types/bot';

export const DEFAULT_EMBEDDING_CONFIG: EmdeddingParams = {
  chunkSize: 1000,
  chunkOverlap: 200,
  enablePartitionPdf: false
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

export const EDGE_GENERATION_PARAMS = {
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

export const EDGE_MISTRAL_GENERATION_PARAMS = {
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

export const EDGE_SEARCH_PARAMS = {
  maxResults: {
    MAX: 100,
    MIN: 1,
    STEP: 1,
  }
}

export const DEFAULT_GENERATION_CONFIG: GenerationParams = {
  maxTokens: 2000,
  topK: 250,
  topP: 0.999,
  temperature: 0.6,
  stopSequences: ["Human: ", "Assistant: "],
}

export const DEFAULT_MISTRAL_GENERATION_CONFIG: GenerationParams = {
  maxTokens: 4096,
  topK: 50,
  topP: 0.9,
  temperature: 0.5,
  stopSequences: ["[INST]", "[/INST]"],
}

export const DEFAULT_SEARCH_CONFIG: SearchParams = {
  maxResults: 20,
}


