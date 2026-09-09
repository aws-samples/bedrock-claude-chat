export type BedrockKnowledgeBaseType = "dedicated" | "shared" | undefined;

export type BedrockKnowledgeBase = {
  type?: BedrockKnowledgeBaseType;
  knowledgeBaseId: string | null;
  existKnowledgeBaseId: string | null;
  dataSourceIds?: string[]; // only present after bot is ready
  embeddingsModel: EmbeddingsModel;
  chunkingConfiguration: ChunkingConfiguration;
  openSearch: OpenSearchParams;
  searchParams: SearchParams;
  parsingModel?: ParsingModel;
  webCrawlingScope?: WebCrawlingScope;
  webCrawlingFilters?: WebCrawlingFilters;
};

export type EmbeddingsModel = 'titan_v2' | 'cohere_multilingual_v3';

export type ParsingModel = 'anthropic.claude-3-haiku-v1' | 'disabled';

export type ChunkingStrategy = 'default' | 'fixed_size' | 'hierarchical' | 'semantic' | 'none';

export type WebCrawlingScope = 'DEFAULT' | 'SUBDOMAINS' | 'HOST_ONLY';

export type WebCrawlingFilters = {
  excludePatterns: string[];
  includePatterns: string[];
};

export type ChunkingConfiguration = DefaultParams | FixedSizeParams | HierarchicalParams | SemanticParams | NoneParams;

export type OpenSearchParams = {
  analyzer: {
    characterFilters: CharacterFilter[];
    tokenizer: Tokenizer;
    tokenFilters: TokenFilter[];
  } | null;
};

export type DefaultParams = {
  chunkingStrategy: 'default';
};

export type FixedSizeParams = {
  chunkingStrategy: 'fixed_size';
  maxTokens: number;
  overlapPercentage: number;
};

export type HierarchicalParams = {
  chunkingStrategy: 'hierarchical';
  overlapTokens: number;
  maxParentTokenSize: number;
  maxChildTokenSize: number;
};

export type SemanticParams = {
  chunkingStrategy: 'semantic';
  maxTokens: number;
  bufferSize: number;
  breakpointPercentileThreshold: number;
};

export type NoneParams = {
  chunkingStrategy: 'none';
};

export type CharacterFilter = 'icu_normalizer'; // static

export type Tokenizer = 'kuromoji_tokenizer' | 'icu_tokenizer';

export type TokenFilter =
  | 'kuromoji_baseform'
  | 'kuromoji_part_of_speech'
  | 'kuromoji_stemmer'
  | 'cjk_width'
  | 'ja_stop'
  | 'lowercase'
  | 'icu_folding';

export type SearchParams = {
  maxResults: number;
  searchType: SearchType;
};

export type SearchType = 'hybrid' | 'semantic';
