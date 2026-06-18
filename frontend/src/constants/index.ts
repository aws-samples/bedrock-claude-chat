import { GenerationParams } from '../@types/bot';

export const EDGE_GENERATION_PARAMS = {
  maxTokens: {
    // Claude 3.7 with extend thinking can generate up to 64k tokens
    // Ref: https://docs.anthropic.com/en/docs/about-claude/models/all-models#model-comparison
    MAX: 64000,
    MIN: 1,
    STEP: 10,
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
    MAX: 500,
    MIN: 0,
    STEP: 1,
  },
  budgetTokens: {
    MIN: 1024,
    MAX: 64000,
    STEP: 10,
  },
};

export const DEFAULT_GENERATION_CONFIG: GenerationParams = {
  maxTokens: 2000,
  topK: 128,
  topP: 0.999,
  temperature: 0.6,
  stopSequences: [],
  reasoningParams: {
    budgetTokens: 1024,
  },
};

export const SyncStatus = {
  QUEUED: 'QUEUED',
  FAILED: 'FAILED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
} as const;

export const TooltipDirection = {
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export type Direction =
  (typeof TooltipDirection)[keyof typeof TooltipDirection];

export const PostStreamingStatus = {
  START: 'START',
  BODY: 'BODY',
  STREAMING: 'STREAMING',
  STREAMING_END: 'STREAMING_END',
  AGENT_THINKING: 'AGENT_THINKING',
  AGENT_TOOL_RESULT: 'AGENT_TOOL_RESULT',
  AGENT_RELATED_DOCUMENT: 'AGENT_RELATED_DOCUMENT',
  REASONING: 'REASONING',
  ERROR: 'ERROR',
  END: 'END',
} as const;

export const GUARDRAILS_FILTERS_THRESHOLD = {
  MAX: 3,
  MIN: 0,
  STEP: 1,
};

export const GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD = {
  MAX: 1,
  MIN: 0,
  STEP: 0.1,
};

export const AVAILABLE_MODEL_KEYS = [
  'claude-v4-opus',
  'claude-v4.1-opus',
  'claude-v4.5-opus',
  'claude-v4.6-opus',
  'claude-v4.7-opus',
  'claude-v4-sonnet',
  'claude-v4.5-sonnet',
  'claude-v4.6-sonnet',
  'claude-v4.5-haiku',
  'claude-v3-opus',
  'claude-v3.5-sonnet',
  'claude-v3.5-sonnet-v2',
  'claude-v3.7-sonnet',
  'claude-v3-haiku',
  'claude-v3.5-haiku',
  'mistral-7b-instruct',
  'mixtral-8x7b-instruct',
  'mistral-large',
  'mistral-large-2',
  'amazon-nova-pro',
  'amazon-nova-lite',
  'amazon-nova-micro',
  'deepseek-r1',
  'llama3-3-70b-instruct',
  'llama3-2-1b-instruct',
  'llama3-2-3b-instruct',
  'llama3-2-11b-instruct',
  'llama3-2-90b-instruct',
  'gpt-oss-20b',
  'gpt-oss-120b',
  'qwen3-235b-a22b-2507',
  'qwen3-coder-30b-a3b',
] as const;
