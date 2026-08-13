import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import InputText from '../../../components/InputText';
import Button from '../../../components/Button';
import useBot from '../../../hooks/useBot';
import { useNavigate, useParams } from 'react-router-dom';
import { PiCaretLeft, PiNote, PiPlus, PiTrash } from 'react-icons/pi';
import Textarea from '../../../components/Textarea';
import DialogInstructionsSamples from '../../../components/DialogInstructionsSamples';
import ButtonIcon from '../../../components/ButtonIcon';
import { produce } from 'immer';
import Alert from '../../../components/Alert';
import KnowledgeFileUploader from '../../../components/KnowledgeFileUploader';
import GenerationConfig from '../../../components/GenerationConfig';
import Select from '../../../components/Select';
import {
  BotFile,
  ConversationQuickStarter,
  ActiveModels,
} from '../../../@types/bot';
import { BedrockKnowledgeBaseType, ParsingModel } from '../types';
import { ulid } from 'ulid';
import {
  EDGE_GENERATION_PARAMS,
  DEFAULT_GENERATION_CONFIG,
  TooltipDirection,
} from '../../../constants';
import { Slider } from '../../../components/Slider';
import ExpandableDrawerGroup from '../../../components/ExpandableDrawerGroup';
import useErrorMessage from '../../../hooks/useErrorMessage';
import Help from '../../../components/Help';
import Toggle from '../../../components/Toggle';
import RadioButton from '../../../components/RadioButton';
import { useAgent } from '../../../features/agent/hooks/useAgent';
import { AgentTool } from '../../../features/agent/types';
import {
  isInternetTool,
  isBedrockAgentTool,
} from '../../../features/agent/utils/typeGuards';
import { AvailableTools } from '../../../features/agent/components/AvailableTools';
import {
  DEFAULT_FIXED_CHUNK_PARAMS,
  DEFAULT_HIERARCHICAL_CHUNK_PARAMS,
  DEFAULT_SEMANTIC_CHUNK_PARAMS,
  EDGE_FIXED_CHUNK_PARAMS,
  EDGE_HIERARCHICAL_CHUNK_PARAMS,
  EDGE_SEMANTIC_CHUNK_PARAMS,
  EDGE_SEARCH_PARAMS,
  OPENSEARCH_ANALYZER,
  DEFAULT_SEARCH_CONFIG,
  DEFAULT_OPENSEARCH_ANALYZER,
} from '../constants';
import {
  GUARDRAILS_FILTERS_THRESHOLD,
  GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD,
} from '../../../constants';
import { Model } from '../../../@types/conversation';
import { AVAILABLE_MODEL_KEYS } from '../../../constants/index';
import {
  ChunkingStrategy,
  FixedSizeParams,
  HierarchicalParams,
  SemanticParams,
  EmbeddingsModel,
  OpenSearchParams,
  SearchParams,
  SearchType,
  WebCrawlingScope,
} from '../types';
import { toCamelCase } from '../../../utils/StringUtils';
import useGlobalConfig from '../../../hooks/useGlobalConfig';
import useKnowledgeBaseApi from '../../../hooks/useKnowledgeBaseApi';

const edgeGenerationParams = EDGE_GENERATION_PARAMS;

const defaultGenerationConfig = DEFAULT_GENERATION_CONFIG;

const BotKbEditPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const { botId: paramsBotId } = useParams();
  const { getMyBot, registerBot, updateBot } = useBot();
  const { availableTools } = useAgent();
  const { getGlobalConfig } = useGlobalConfig();
  const { data: globalConfig } = getGlobalConfig();
  const { listKnowledgeBases } = useKnowledgeBaseApi();
  const {
    data: knowledgeBasesData,
    isLoading: isLoadingKnowledgeBases,
    error: knowledgeBasesError,
  } = listKnowledgeBases();

  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [urls, setUrls] = useState<string[]>(['']);
  const [s3Urls, setS3Urls] = useState<string[]>(['']);
  const [files, setFiles] = useState<BotFile[]>([]);
  const [addedFilenames, setAddedFilenames] = useState<string[]>([]);
  const [unchangedFilenames, setUnchangedFilenames] = useState<string[]>([]);
  const [deletedFilenames, setDeletedFilenames] = useState<string[]>([]);
  const [displayRetrievedChunks, setDisplayRetrievedChunks] = useState(true);
  const [maxTokens, setMaxTokens] = useState<number>(
    defaultGenerationConfig.maxTokens
  );
  const [topK, setTopK] = useState<number>(defaultGenerationConfig.topK);
  const [topP, setTopP] = useState<number>(defaultGenerationConfig.topP);
  const [temperature, setTemperature] = useState<number>(
    defaultGenerationConfig.temperature
  );
  const [stopSequences, setStopSequences] = useState<string>(
    defaultGenerationConfig.stopSequences?.join(',') || ''
  );
  const [budgetTokens, setBudgetTokens] = useState<number>(
    defaultGenerationConfig.reasoningParams?.budgetTokens ??
      EDGE_GENERATION_PARAMS.budgetTokens.MIN
  );
  const [promptCachingEnabled, setPromptCachingEnabled] = useState<boolean>(false);
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [conversationQuickStarters, setConversationQuickStarters] = useState<
    ConversationQuickStarter[]
  >([
    {
      title: '',
      example: '',
    },
  ]);
  const [webCrawlingScope, setWebCrawlingScope] =
    useState<WebCrawlingScope>('DEFAULT');

  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null); // Send null when creating a new bot
  const [existKnowledgeBaseId, setExistKnowledgeBaseId] = useState<
    string | null
  >(null);
  const [knowledgeBaseType, setKnowledgeBaseType] = useState<
    'new' | 'shared' | 'existing'
  >('shared');

  const bedrockKnowledgeBaseType = useMemo<BedrockKnowledgeBaseType>(() => {
    if (existKnowledgeBaseId != null) {
      return undefined;
    }
    switch (knowledgeBaseType) {
      case 'new': {
        if (files.length === 0 && urls.length === 0 && s3Urls.length === 0) {
          return undefined;
        }
        return 'dedicated';
      }
      case 'shared': {
        if (files.length === 0) {
          return undefined;
        }
        return 'shared';
      }
      case 'existing': {
        return undefined;
      }
    }
  }, [existKnowledgeBaseId, knowledgeBaseType, files, urls, s3Urls]);

  // When loading an existing bot that already has a knowledge base id(s),
  // default the radio selection to 'existing' so the UI reflects the bot state.
  useEffect(() => {
    if (existKnowledgeBaseId && knowledgeBaseType !== 'existing') {
      setKnowledgeBaseType('existing');
    }
  }, [existKnowledgeBaseId, knowledgeBaseType]);

  const disabledKnowledgeEdit = useMemo(() => {
    return !!existKnowledgeBaseId;
  }, [existKnowledgeBaseId]);

  const [embeddingsModel, setEmbeddingsModel] =
    useState<EmbeddingsModel>('titan_v2');

  const [hateThreshold, setHateThreshold] = useState<number>(0);
  const [insultsThreshold, setInsultsThreshold] = useState<number>(0);
  const [sexualThreshold, setSexualThreshold] = useState<number>(0);
  const [violenceThreshold, setViolenceThreshold] = useState<number>(0);
  const [misconductThreshold, setMisconductThreshold] = useState<number>(0);
  const [groundingThreshold, setGroundingThreshold] = useState<number>(0);
  const [relevanceThreshold, setRelevanceThreshold] = useState<number>(0);
  const [guardrailArn, setGuardrailArn] = useState<string>('');
  const [guardrailVersion, setGuardrailVersion] = useState<string>('');

  const isGuardrailEnabled = useMemo(() => (
    hateThreshold > 0 ||
    insultsThreshold > 0 ||
    sexualThreshold > 0 ||
    violenceThreshold > 0 ||
    misconductThreshold > 0 ||
    groundingThreshold > 0 ||
    relevanceThreshold > 0
  ), [hateThreshold, insultsThreshold, sexualThreshold, violenceThreshold, misconductThreshold, groundingThreshold, relevanceThreshold]);

  const [parsingModel, setParsingModel] = useState<ParsingModel | undefined>(
    undefined
  );
  const [webCrawlingFilters, setWebCrawlingFilters] = useState<{
    includePatterns: string[];
    excludePatterns: string[];
  }>({
    includePatterns: [''],
    excludePatterns: [''],
  });

  const [activeModels, setActiveModels] = useState<ActiveModels>(() => {
    const initialState = AVAILABLE_MODEL_KEYS.reduce(
      (acc: ActiveModels, key: Model) => {
        acc[toCamelCase(key) as keyof ActiveModels] = true;
        return acc;
      },
      {} as ActiveModels
    );
    return initialState;
  });

  const activeModelsOptions: {
    key: Model;
    label: string;
    description: string;
  }[] = (() => {
    const getGeneralModels = () => {
      let availableKeys = [...AVAILABLE_MODEL_KEYS];
      
      // Filter by global configuration if available
      if (globalConfig?.globalAvailableModels && globalConfig.globalAvailableModels.length > 0) {
        availableKeys = availableKeys.filter(key => 
          globalConfig.globalAvailableModels!.includes(key)
        );
      }
      
      return availableKeys.map((key) => ({
        key: key as Model,
        label: t(`model.${key}.label`) as string,
        description: t(`model.${key}.description`) as string,
      }));
    };

    return getGeneralModels();
  })();

  const embeddingsModelOptions: {
    label: string;
    value: EmbeddingsModel;
  }[] = [
    {
      label: t('knowledgeBaseSettings.embeddingModel.titan_v2.label'),
      value: 'titan_v2',
    },
    {
      label: t(
        'knowledgeBaseSettings.embeddingModel.cohere_multilingual_v3.label'
      ),
      value: 'cohere_multilingual_v3',
    },
  ];

  const [chunkingStrategy, setChunkingStrategy] =
    useState<ChunkingStrategy>('default');

  const webCrawlingScopeOptions: {
    label: string;
    value: WebCrawlingScope;
    description: string;
  }[] = [
    {
      label: t(
        'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.default.label'
      ),
      value: 'DEFAULT',
      description: t(
        'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.default.hint'
      ),
    },
    {
      label: t(
        'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.subdomains.label'
      ),
      value: 'SUBDOMAINS',
      description: t(
        'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.subdomains.hint'
      ),
    },
    {
      label: t(
        'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.hostOnly.label'
      ),
      value: 'HOST_ONLY',
      description: t(
        'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.hostOnly.hint'
      ),
    },
  ];

  const chunkingStrategyOptions: {
    label: string;
    value: ChunkingStrategy;
    description: string;
  }[] = [
    {
      label: t('knowledgeBaseSettings.chunkingStrategy.default.label'),
      value: 'default',
      description: t('knowledgeBaseSettings.chunkingStrategy.default.hint'),
    },
    {
      label: t('knowledgeBaseSettings.chunkingStrategy.fixed_size.label'),
      value: 'fixed_size',
      description: t('knowledgeBaseSettings.chunkingStrategy.fixed_size.hint'),
    },
    {
      label: t('knowledgeBaseSettings.chunkingStrategy.hierarchical.label'),
      value: 'hierarchical',
      description: t(
        'knowledgeBaseSettings.chunkingStrategy.hierarchical.hint'
      ),
    },
    {
      label: t('knowledgeBaseSettings.chunkingStrategy.semantic.label'),
      value: 'semantic',
      description: t('knowledgeBaseSettings.chunkingStrategy.semantic.hint'),
    },
    {
      label: t('knowledgeBaseSettings.chunkingStrategy.none.label'),
      value: 'none',
      description: t('knowledgeBaseSettings.chunkingStrategy.none.hint'),
    },
  ];

  const parsingModelOptions: {
    label: string;
    value: ParsingModel;
    description: string;
  }[] = [
    {
      label: t('knowledgeBaseSettings.parsingModel.none.label'),
      value: 'disabled',
      description: t('knowledgeBaseSettings.parsingModel.none.hint'),
    },
    {
      label: t('knowledgeBaseSettings.parsingModel.claude_3_5_sonnet_v1.label'),
      value: 'anthropic.claude-3-5-sonnet-v1',
      description: t(
        'knowledgeBaseSettings.parsingModel.claude_3_5_sonnet_v1.hint'
      ),
    },
    {
      label: t('knowledgeBaseSettings.parsingModel.claude_3_haiku_v1.label'),
      value: 'anthropic.claude-3-haiku-v1',
      description: t(
        'knowledgeBaseSettings.parsingModel.claude_3_haiku_v1.hint'
      ),
    },
  ];

  const [fixedSizeParams, setFixedSizeParams] = useState<FixedSizeParams>(
    DEFAULT_FIXED_CHUNK_PARAMS
  );

  const [hierarchicalParams, setHierarchicalParams] =
    useState<HierarchicalParams>(DEFAULT_HIERARCHICAL_CHUNK_PARAMS);

  const [semanticParams, setSemanticParams] = useState<SemanticParams>(
    DEFAULT_SEMANTIC_CHUNK_PARAMS
  );

  const [analyzer, setAnalyzer] = useState<string>(
    DEFAULT_OPENSEARCH_ANALYZER[i18n.language] ?? 'none'
  );

  const [openSearchParams, setOpenSearchParams] = useState<OpenSearchParams>(
    DEFAULT_OPENSEARCH_ANALYZER[i18n.language]
      ? OPENSEARCH_ANALYZER[DEFAULT_OPENSEARCH_ANALYZER[i18n.language]]
      : OPENSEARCH_ANALYZER['none']
  );

  const analyzerOptions: {
    label: string;
    value: string;
    description: string;
  }[] = [
    {
      label: t('knowledgeBaseSettings.opensearchAnalyzer.icu.label'),
      value: 'icu',
      description: t('knowledgeBaseSettings.opensearchAnalyzer.icu.hint', {
        tokenizer: OPENSEARCH_ANALYZER['icu'].analyzer!.tokenizer,
        normalizer: OPENSEARCH_ANALYZER['icu'].analyzer!.characterFilters,
      }),
    },
    {
      label: t('knowledgeBaseSettings.opensearchAnalyzer.kuromoji.label'),
      value: 'kuromoji',
      description: t('knowledgeBaseSettings.opensearchAnalyzer.kuromoji.hint', {
        tokenizer: OPENSEARCH_ANALYZER['kuromoji'].analyzer!.tokenizer,
        normalizer: OPENSEARCH_ANALYZER['icu'].analyzer!.characterFilters,
      }),
    },
    {
      label: t('knowledgeBaseSettings.opensearchAnalyzer.none.label'),
      value: 'none',
      description: t('knowledgeBaseSettings.opensearchAnalyzer.none.hint'),
    },
  ];

  const [searchParams, setSearchParams] = useState<SearchParams>(
    DEFAULT_SEARCH_CONFIG
  );

  const searchTypeOptions: {
    label: string;
    value: SearchType;
    description: string;
  }[] = [
    {
      label: t('searchSettings.searchType.hybrid.label'),
      value: 'hybrid',
      description: t('searchSettings.searchType.hybrid.hint'),
    },
    {
      label: t('searchSettings.searchType.semantic.label'),
      value: 'semantic',
      description: t('searchSettings.searchType.semantic.hint'),
    },
  ];

  const {
    errorMessages,
    setErrorMessage: setErrorMessages,
    clearAll: clearErrorMessages,
  } = useErrorMessage();

  const isNewBot = useMemo(() => {
    return paramsBotId ? false : true;
  }, [paramsBotId]);

  const botId = useMemo(() => {
    return isNewBot ? ulid() : (paramsBotId ?? '');
  }, [isNewBot, paramsBotId]);

  const onChangeIncludePattern = useCallback(
    (pattern: string, idx: number) => {
      setWebCrawlingFilters(
        produce(webCrawlingFilters, (draft) => {
          draft.includePatterns[idx] = pattern;
        })
      );
    },
    [webCrawlingFilters]
  );

  const onClickAddIncludePattern = useCallback(() => {
    setWebCrawlingFilters(
      produce(webCrawlingFilters, (draft) => {
        draft.includePatterns.push('');
      })
    );
  }, [webCrawlingFilters]);

  const onClickRemoveIncludePattern = useCallback(
    (idx: number) => {
      setWebCrawlingFilters(
        produce(webCrawlingFilters, (draft) => {
          draft.includePatterns.splice(idx, 1);
          if (draft.includePatterns.length === 0) {
            draft.includePatterns.push('');
          }
        })
      );
    },
    [webCrawlingFilters]
  );

  const onChangeExcludePattern = useCallback(
    (pattern: string, idx: number) => {
      setWebCrawlingFilters(
        produce(webCrawlingFilters, (draft) => {
          draft.excludePatterns[idx] = pattern;
        })
      );
    },
    [webCrawlingFilters]
  );

  const onClickAddExcludePattern = useCallback(() => {
    setWebCrawlingFilters(
      produce(webCrawlingFilters, (draft) => {
        draft.excludePatterns.push('');
      })
    );
  }, [webCrawlingFilters]);

  const onClickRemoveExcludePattern = useCallback(
    (idx: number) => {
      setWebCrawlingFilters(
        produce(webCrawlingFilters, (draft) => {
          draft.excludePatterns.splice(idx, 1);
          if (draft.excludePatterns.length === 0) {
            draft.excludePatterns.push('');
          }
        })
      );
    },
    [webCrawlingFilters]
  );

  useEffect(() => {
    if (!isNewBot) {
      setIsLoading(true);
      getMyBot(botId)
        .then((bot) => {
          setTools(bot.agent.tools);
          setTitle(bot.title);
          setDescription(bot.description);
          setInstruction(bot.instruction);
          setUrls(
            bot.knowledge.sourceUrls.length === 0
              ? ['']
              : bot.knowledge.sourceUrls
          );
          setS3Urls(
            bot.knowledge.s3Urls.length === 0 ? [''] : bot.knowledge.s3Urls
          );
          switch (bot.bedrockKnowledgeBase.type) {
            case 'dedicated':
              setKnowledgeBaseType('new');
              break;

            case 'shared':
              setKnowledgeBaseType('shared');
              break;

            default:
              break;
          }
          setFiles(
            bot.knowledge.filenames.map((filename) => ({
              filename,
              status: 'UPLOADED',
            }))
          );
          setTopK(bot.generationParams.topK);
          setTopP(bot.generationParams.topP);
          setTemperature(bot.generationParams.temperature);
          setMaxTokens(bot.generationParams.maxTokens);
          setStopSequences(bot.generationParams.stopSequences.join(','));
          setBudgetTokens(bot.generationParams.reasoningParams.budgetTokens);
          setUnchangedFilenames([...bot.knowledge.filenames]);
          setDisplayRetrievedChunks(bot.displayRetrievedChunks);
          setPromptCachingEnabled(bot.promptCachingEnabled);
          if (bot.syncStatus === 'FAILED') {
            setErrorMessages(
              isSyncChunkError(bot.syncStatusReason)
                ? 'syncChunkError'
                : 'syncError',
              bot.syncStatusReason
            );
          }
          setConversationQuickStarters(
            bot.conversationQuickStarters.length > 0
              ? bot.conversationQuickStarters
              : [
                  {
                    title: '',
                    example: '',
                  },
                ]
          );
          setKnowledgeBaseId(bot.bedrockKnowledgeBase.knowledgeBaseId);
          setExistKnowledgeBaseId(
            bot.bedrockKnowledgeBase.existKnowledgeBaseId
          );
          setEmbeddingsModel(bot.bedrockKnowledgeBase!.embeddingsModel);
          setChunkingStrategy(
            bot.bedrockKnowledgeBase!.chunkingConfiguration.chunkingStrategy
          );
          if (
            bot.bedrockKnowledgeBase!.chunkingConfiguration.chunkingStrategy ==
            'fixed_size'
          ) {
            setFixedSizeParams(
              (bot.bedrockKnowledgeBase!
                .chunkingConfiguration as FixedSizeParams) ??
                DEFAULT_FIXED_CHUNK_PARAMS
            );
          } else if (
            bot.bedrockKnowledgeBase!.chunkingConfiguration.chunkingStrategy ==
            'hierarchical'
          ) {
            setHierarchicalParams(
              (bot.bedrockKnowledgeBase!
                .chunkingConfiguration as HierarchicalParams) ??
                DEFAULT_HIERARCHICAL_CHUNK_PARAMS
            );
          } else if (
            bot.bedrockKnowledgeBase!.chunkingConfiguration.chunkingStrategy ==
            'semantic'
          ) {
            setSemanticParams(
              (bot.bedrockKnowledgeBase!
                .chunkingConfiguration as SemanticParams) ??
                DEFAULT_SEMANTIC_CHUNK_PARAMS
            );
          }

          setOpenSearchParams(bot.bedrockKnowledgeBase!.openSearch);
          setSearchParams(bot.bedrockKnowledgeBase!.searchParams);
          setGuardrailArn(bot.bedrockGuardrails.guardrailArn);
          setGuardrailVersion(
            bot.bedrockGuardrails.guardrailVersion
              ? bot.bedrockGuardrails.guardrailVersion
              : ''
          );
          setHateThreshold(
            bot.bedrockGuardrails.hateThreshold
              ? bot.bedrockGuardrails.hateThreshold
              : 0
          );
          setInsultsThreshold(
            bot.bedrockGuardrails.insultsThreshold
              ? bot.bedrockGuardrails.insultsThreshold
              : 0
          );
          setSexualThreshold(
            bot.bedrockGuardrails.sexualThreshold
              ? bot.bedrockGuardrails.sexualThreshold
              : 0
          );
          setViolenceThreshold(
            bot.bedrockGuardrails.violenceThreshold
              ? bot.bedrockGuardrails.violenceThreshold
              : 0
          );
          setMisconductThreshold(
            bot.bedrockGuardrails.misconductThreshold
              ? bot.bedrockGuardrails.misconductThreshold
              : 0
          );
          setGroundingThreshold(
            bot.bedrockGuardrails.groundingThreshold
              ? bot.bedrockGuardrails.groundingThreshold
              : 0
          );
          setRelevanceThreshold(
            bot.bedrockGuardrails.relevanceThreshold
              ? bot.bedrockGuardrails.relevanceThreshold
              : 0
          );
          setParsingModel(bot.bedrockKnowledgeBase.parsingModel);
          setWebCrawlingScope(
            bot.bedrockKnowledgeBase.webCrawlingScope ?? 'DEFAULT'
          );
          setWebCrawlingFilters({
            includePatterns: bot.bedrockKnowledgeBase.webCrawlingFilters
              ?.includePatterns || [''],
            excludePatterns: bot.bedrockKnowledgeBase.webCrawlingFilters
              ?.excludePatterns || [''],
          });
          setActiveModels(bot.activeModels);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewBot, botId]);

  const isSyncChunkError = useCallback((syncErrorMessage: string) => {
    const pattern =
      /Got a larger chunk overlap \(\d+\) than chunk size \(\d+\), should be smaller\./;
    return pattern.test(syncErrorMessage);
  }, []);

  const onChangeActiveModels = useCallback((key: string, value: boolean) => {
    setActiveModels((prevState) => {
      const camelKey = toCamelCase(key) as keyof ActiveModels;
      const newState = { ...prevState };
      newState[camelKey] = value;
      return newState;
    });
  }, []);

  const onChangeS3Url = useCallback(
    (s3Url: string, idx: number) => {
      setS3Urls(
        produce(s3Urls, (draft) => {
          draft[idx] = s3Url;
        })
      );
    },
    [s3Urls]
  );

  const onClickAddS3Url = useCallback(() => {
    setS3Urls([...s3Urls, '']);
  }, [s3Urls]);

  const onClickRemoveS3Url = useCallback(
    (idx: number) => {
      setS3Urls(
        produce(s3Urls, (draft) => {
          draft.splice(idx, 1);
          if (draft.length === 0) {
            draft.push('');
          }
          return;
        })
      );
    },
    [s3Urls]
  );

  const onChangeUrls = useCallback(
    (url: string, idx: number) => {
      setUrls(
        produce(urls, (draft) => {
          draft[idx] = url;
        })
      );
    },
    [urls]
  );

  const onClickAddUrls = useCallback(() => {
    setUrls([...urls, '']);
  }, [urls]);

  const onClickRemoveUrls = useCallback(
    (idx: number) => {
      setUrls(
        produce(urls, (draft) => {
          draft.splice(idx, 1);
          if (draft.length === 0) {
            draft.push('');
          }
          return;
        })
      );
    },
    [urls]
  );

  const removeUnchangedFilenames = useCallback(
    (filename: string) => {
      const idx = unchangedFilenames.findIndex(
        (unchangedFilename) => unchangedFilename === filename
      );
      if (idx > -1) {
        setUnchangedFilenames(
          produce(unchangedFilenames, (draft) => {
            draft.splice(idx, 1);
            return;
          })
        );
      }
    },
    [unchangedFilenames]
  );

  const removeAddedFilenames = useCallback(
    (filename: string) => {
      const idx = addedFilenames.findIndex(
        (addedFilename) => addedFilename === filename
      );
      if (idx > -1) {
        setAddedFilenames(
          produce(addedFilenames, (draft) => {
            draft.splice(idx, 1);
            return;
          })
        );
      }
    },
    [addedFilenames]
  );

  const removeDeletedFilenames = useCallback(
    (filename: string) => {
      const idx = deletedFilenames.findIndex(
        (deletedFilename) => deletedFilename === filename
      );
      if (idx > -1) {
        setDeletedFilenames(
          produce(deletedFilenames, (draft) => {
            draft.splice(idx, 1);
          })
        );
      }
    },
    [deletedFilenames]
  );

  const onAddFiles = useCallback(
    (botFiles: BotFile[]) => {
      setFiles(botFiles);
      setAddedFilenames(
        produce(addedFilenames, (draft) => {
          botFiles.forEach((file) => {
            if (file.status === 'UPLOADING') {
              if (!draft.includes(file.filename)) {
                draft.push(file.filename);
              }
              removeUnchangedFilenames(file.filename);
              removeDeletedFilenames(file.filename);
            }
          });
        })
      );
    },
    [addedFilenames, removeDeletedFilenames, removeUnchangedFilenames]
  );

  const onUpdateFiles = useCallback((botFiles: BotFile[]) => {
    setFiles(botFiles);
  }, []);

  const onDeleteFiles = useCallback(
    (botFiles: BotFile[], deletedFilename: string) => {
      setFiles(botFiles);

      if (!deletedFilenames.includes(deletedFilename)) {
        setDeletedFilenames(
          produce(deletedFilenames, (draft) => {
            draft.push(deletedFilename);
          })
        );
      }
      removeAddedFilenames(deletedFilename);
      removeUnchangedFilenames(deletedFilename);
    },
    [deletedFilenames, removeAddedFilenames, removeUnchangedFilenames]
  );

  const addQuickStarter = useCallback(() => {
    setConversationQuickStarters(
      produce(conversationQuickStarters, (draft) => {
        draft.push({
          title: '',
          example: '',
        });
      })
    );
  }, [conversationQuickStarters]);

  const updateQuickStarter = useCallback(
    (quickStart: ConversationQuickStarter, index: number) => {
      setConversationQuickStarters(
        produce(conversationQuickStarters, (draft) => {
          draft[index] = quickStart;
        })
      );
    },
    [conversationQuickStarters]
  );

  const removeQuickStarter = useCallback(
    (index: number) => {
      setConversationQuickStarters(
        produce(conversationQuickStarters, (draft) => {
          draft.splice(index, 1);
          if (draft.length === 0) {
            draft.push({
              title: '',
              example: '',
            });
          }
        })
      );
    },
    [conversationQuickStarters]
  );

  const onChangeEmbeddingsModel = useCallback(
    (value: EmbeddingsModel) => {
      setEmbeddingsModel(value);
      // Update maxTokens based on the selected embeddings model
      const maxEdgeFixed = EDGE_FIXED_CHUNK_PARAMS.maxTokens.MAX[value];
      const maxEdgeSemantic = EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MAX[value];
      if (
        chunkingStrategy == 'fixed_size' &&
        fixedSizeParams.maxTokens > maxEdgeFixed
      ) {
        setFixedSizeParams((params) => ({
          ...params,
          maxTokens: maxEdgeFixed,
        }));
      } else if (
        chunkingStrategy == 'semantic' &&
        semanticParams.maxTokens > maxEdgeSemantic
      ) {
        setSemanticParams((params) => ({
          ...params,
          maxTokens: maxEdgeSemantic,
        }));
      }
    },
    [chunkingStrategy, fixedSizeParams.maxTokens, semanticParams.maxTokens]
  );

  const onClickBack = useCallback(() => {
    history.back();
  }, []);

  const isValidGenerationConfigParam = useCallback(
    (value: number, key: 'maxTokens' | 'topK' | 'topP' | 'temperature') => {
      if (value < edgeGenerationParams[key].MIN) {
        setErrorMessages(
          key,
          t('validation.minRange.message', {
            size: edgeGenerationParams[key].MIN,
          })
        );
        return false;
      } else if (value > edgeGenerationParams[key].MAX) {
        setErrorMessages(
          key,
          t('validation.maxRange.message', {
            size: edgeGenerationParams[key].MAX,
          })
        );
        return false;
      }

      return true;
    },
    [setErrorMessages, t]
  );

  const isValidBudgetTokens = useCallback(
    (value: number) => {
      if (value < EDGE_GENERATION_PARAMS.budgetTokens.MIN) {
        setErrorMessages(
          'budgetTokens',
          t('validation.minRange.message', {
            size: EDGE_GENERATION_PARAMS.budgetTokens.MIN,
          })
        );
        return false;
      } else if (value > maxTokens) {
        setErrorMessages(
          'budgetTokens',
          t('validation.maxBudgetTokens.message', {
            size: maxTokens,
          })
        );
        return false;
      }
      return true;
    },
    [setErrorMessages, t, maxTokens]
  );
  const isToolValid = useCallback((): boolean => {
    clearErrorMessages();

    // Early return if no tools
    if (!tools.length) {
      return true;
    }

    // Use some() instead of every() since we want to find invalid tools
    const hasInvalidTool = tools.some((tool, idx) => {
      // BedrockAgentTool validation
      if (isBedrockAgentTool(tool) && !tool.bedrockAgentConfig?.agentId) {
        setErrorMessages(
          `tools-${idx}-bedrockAgentConfig.agent_id`,
          t('input.validationError.required')
        );
        return true;
      }

      if (isBedrockAgentTool(tool) && !tool.bedrockAgentConfig?.aliasId) {
        setErrorMessages(
          `tools-${idx}-bedrockAgentConfig.alias_id`,
          t('input.validationError.required')
        );
        return true;
      }

      // Firecrawl tool validation
      if (
        isInternetTool(tool) &&
        tool.searchEngine === 'firecrawl' &&
        (!tool.firecrawlConfig || !tool.firecrawlConfig.apiKey)
      ) {
        setErrorMessages(
          `tools-${idx}-firecrawlConfig.apiKey`,
          t('input.validationError.required')
        );
        return true;
      }

      return false; // Tool is valid
    });

    return !hasInvalidTool;
  }, [clearErrorMessages, tools, setErrorMessages, t]);

  const isValid = useCallback((): boolean => {
    clearErrorMessages();

    // S3 URLs validation - s3://example-bucket/path/to/data-source/
    const isS3UrlsValid = s3Urls.every((url, idx) => {
      if (url && !/^s3:\/\/[a-z0-9.-]+\/.+/.test(url)) {
        setErrorMessages(`s3Urls-${idx}`, 'S3 URL is invalid');
        return false;
      } else {
        return true;
      }
    });
    if (!isS3UrlsValid) {
      return false;
    }

    if (!isToolValid()) {
      return false;
    }

    // Chunking Strategy params validation
    if (chunkingStrategy === 'fixed_size') {
      if (fixedSizeParams.maxTokens < EDGE_FIXED_CHUNK_PARAMS.maxTokens.MIN) {
        setErrorMessages(
          'fixedSizeParams.maxTokens',
          t('validation.minRange.message', {
            size: EDGE_FIXED_CHUNK_PARAMS.maxTokens.MIN,
          })
        );
        return false;
      } else if (
        fixedSizeParams.maxTokens >
        EDGE_FIXED_CHUNK_PARAMS.maxTokens.MAX[embeddingsModel]
      ) {
        setErrorMessages(
          'fixedSizeParams.maxTokens',
          t('validation.maxRange.message', {
            size: EDGE_FIXED_CHUNK_PARAMS.maxTokens.MAX[embeddingsModel],
          })
        );
        return false;
      }

      if (
        fixedSizeParams.overlapPercentage <
        EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.MIN
      ) {
        setErrorMessages(
          'fixedSizeParams.overlapPercentage',
          t('validation.minRange.message', {
            size: EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.MIN,
          })
        );
        return false;
      } else if (
        fixedSizeParams.overlapPercentage >
        EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.MAX
      ) {
        setErrorMessages(
          'fixedSizeParams.overlapPercentage',
          t('validation.maxRange.message', {
            size: EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.MAX,
          })
        );
        return false;
      }
    } else if (chunkingStrategy === 'hierarchical') {
      if (
        hierarchicalParams.overlapTokens <
        EDGE_HIERARCHICAL_CHUNK_PARAMS.overlapTokens.MIN
      ) {
        setErrorMessages(
          'hierarchicalParams.overlapTokens',
          t('validation.minRange.message', {
            size: EDGE_HIERARCHICAL_CHUNK_PARAMS.overlapTokens.MIN,
          })
        );
        return false;
      }

      if (
        hierarchicalParams.maxParentTokenSize <
        EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize.MIN
      ) {
        setErrorMessages(
          'hierarchicalParams.maxParentTokenSize',
          t('validation.minRange.message', {
            size: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize.MIN,
          })
        );
        return false;
      } else if (
        hierarchicalParams.maxParentTokenSize >
        EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize.MAX[embeddingsModel]
      ) {
        setErrorMessages(
          'hierarchicalParams.maxParentTokenSize',
          t('validation.maxRange.message', {
            size: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize.MAX[
              embeddingsModel
            ],
          })
        );
        return false;
      }

      if (
        hierarchicalParams.maxChildTokenSize <
        EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize.MIN
      ) {
        setErrorMessages(
          'hierarchicalParams.maxChildTokenSize',
          t('validation.minRange.message', {
            size: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize.MIN,
          })
        );
        return false;
      } else if (
        hierarchicalParams.maxChildTokenSize >
        EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize.MAX[embeddingsModel]
      ) {
        setErrorMessages(
          'hierarchicalParams.maxChildTokenSize',
          t('validation.maxRange.message', {
            size: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize.MAX[
              embeddingsModel
            ],
          })
        );
        return false;
      }

      if (
        hierarchicalParams.maxParentTokenSize <
        hierarchicalParams.maxChildTokenSize
      ) {
        setErrorMessages(
          'hierarchicalParams.maxParentTokenSize',
          t('validation.parentTokenRange.message')
        );
        return false;
      }
    } else if (chunkingStrategy === 'semantic') {
      if (semanticParams.maxTokens < EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MIN) {
        setErrorMessages(
          'semanticParams.maxTokenss',
          t('validation.minRange.message', {
            size: EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MIN,
          })
        );
        return false;
      } else if (
        semanticParams.maxTokens >
        EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MAX[embeddingsModel]
      ) {
        setErrorMessages(
          'semanticParams.maxTokens',
          t('validation.maxRange.message', {
            size: EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MAX[embeddingsModel],
          })
        );
        return false;
      }

      if (
        semanticParams.bufferSize < EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.MIN
      ) {
        setErrorMessages(
          'semanticParams.bufferSize',
          t('validation.minRange.message', {
            size: EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.MIN,
          })
        );
        return false;
      } else if (
        semanticParams.bufferSize > EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.MAX
      ) {
        setErrorMessages(
          'semanticParams.bufferSize',
          t('validation.maxRange.message', {
            size: EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.MAX,
          })
        );
        return false;
      }

      if (
        semanticParams.breakpointPercentileThreshold <
        EDGE_SEMANTIC_CHUNK_PARAMS.breakpointPercentileThreshold.MIN
      ) {
        setErrorMessages(
          'semanticParams.breakpointPercentileThreshold',
          t('validation.minRange.message', {
            size: EDGE_SEMANTIC_CHUNK_PARAMS.breakpointPercentileThreshold.MIN,
          })
        );
        return false;
      } else if (
        semanticParams.breakpointPercentileThreshold >
        EDGE_SEMANTIC_CHUNK_PARAMS.breakpointPercentileThreshold.MAX
      ) {
        setErrorMessages(
          'semanticParams.breakpointPercentileThreshold',
          t('validation.maxRange.message', {
            size: EDGE_SEMANTIC_CHUNK_PARAMS.breakpointPercentileThreshold.MAX,
          })
        );
        return false;
      }
    }

    if (searchParams.maxResults < EDGE_SEARCH_PARAMS.maxResults.MIN) {
      setErrorMessages(
        'maxResults',
        t('validation.minRange.message', {
          size: EDGE_SEARCH_PARAMS.maxResults.MIN,
        })
      );
      return false;
    } else if (searchParams.maxResults > EDGE_SEARCH_PARAMS.maxResults.MAX) {
      setErrorMessages(
        'maxResults',
        t('validation.maxRange.message', {
          size: EDGE_SEARCH_PARAMS.maxResults.MAX,
        })
      );
      return false;
    }

    const isQsValid = conversationQuickStarters.every((rs, idx) => {
      if ((!rs.title && !!rs.example) || (!!rs.title && !rs.example)) {
        setErrorMessages(
          `conversationQuickStarter${idx}`,
          t('validation.quickStarter.message')
        );
        return false;
      } else {
        return true;
      }
    });
    if (!isQsValid) {
      return false;
    }

    if (!isValidBudgetTokens(budgetTokens)) {
      return false;
    }

    return (
      isValidGenerationConfigParam(maxTokens, 'maxTokens') &&
      isValidGenerationConfigParam(topK, 'topK') &&
      isValidGenerationConfigParam(topP, 'topP') &&
      isValidGenerationConfigParam(temperature, 'temperature')
    );
  }, [
    clearErrorMessages,
    s3Urls,
    searchParams.maxResults,
    conversationQuickStarters,
    isToolValid,
    isValidGenerationConfigParam,
    budgetTokens,
    isValidBudgetTokens,
    maxTokens,
    topK,
    topP,
    temperature,
    setErrorMessages,
    embeddingsModel,
    chunkingStrategy,
    fixedSizeParams,
    hierarchicalParams,
    semanticParams,
    t,
  ]);

  const onClickCreate = useCallback(() => {
    if (!isValid()) {
      return;
    }
    setIsLoading(true);
    registerBot({
      agent: {
        tools,
      },
      id: botId,
      title,
      description,
      instruction,
      generationParams: {
        maxTokens,
        temperature,
        topK,
        topP,
        stopSequences: stopSequences.split(','),
        reasoningParams: {
          budgetTokens,
        },
      },
      knowledge: {
        sourceUrls: urls.filter((s) => s !== ''),
        // Sitemap cannot be used yet.
        sitemapUrls: [],
        s3Urls: s3Urls.filter((s) => s !== ''),
        filenames: files.map((f) => f.filename),
      },
      displayRetrievedChunks,
      promptCachingEnabled: promptCachingEnabled,
      conversationQuickStarters: conversationQuickStarters.filter(
        (qs) => qs.title !== '' && qs.example !== ''
      ),
      bedrockKnowledgeBase: {
        type: bedrockKnowledgeBaseType,
        knowledgeBaseId: null,
        existKnowledgeBaseId,
        embeddingsModel,
        chunkingConfiguration: (() => {
          switch (chunkingStrategy) {
            case 'default':
              return { chunkingStrategy: 'default' };
            case 'fixed_size':
              return fixedSizeParams;
            case 'hierarchical':
              return hierarchicalParams;
            case 'semantic':
              return semanticParams;
            default:
              return { chunkingStrategy: 'none' };
          }
        })(),
        openSearch: openSearchParams,
        searchParams: searchParams,
        parsingModel,
        webCrawlingScope,
        webCrawlingFilters,
      },
      bedrockGuardrails: {
        isGuardrailEnabled,
        hateThreshold: hateThreshold,
        insultsThreshold: insultsThreshold,
        sexualThreshold: sexualThreshold,
        violenceThreshold: violenceThreshold,
        misconductThreshold: misconductThreshold,
        groundingThreshold: groundingThreshold,
        relevanceThreshold: relevanceThreshold,
        guardrailArn: '',
        guardrailVersion: '',
      },
      activeModels,
    })
      .then(() => {
        navigate('/bot/my');
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [
    isValid,
    registerBot,
    tools,
    botId,
    title,
    description,
    instruction,
    maxTokens,
    temperature,
    topK,
    topP,
    stopSequences,
    budgetTokens,
    searchParams,
    urls,
    s3Urls,
    files,
    displayRetrievedChunks,
    promptCachingEnabled,
    conversationQuickStarters,
    navigate,
    bedrockKnowledgeBaseType,
    existKnowledgeBaseId,
    embeddingsModel,
    chunkingStrategy,
    fixedSizeParams,
    hierarchicalParams,
    semanticParams,
    openSearchParams,
    isGuardrailEnabled,
    hateThreshold,
    insultsThreshold,
    sexualThreshold,
    violenceThreshold,
    misconductThreshold,
    groundingThreshold,
    relevanceThreshold,
    parsingModel,
    webCrawlingScope,
    webCrawlingFilters,
    activeModels,
  ]);

  const onClickEdit = useCallback(() => {
    if (!isValid()) {
      return;
    }
    if (!isNewBot) {
      setIsLoading(true);
      updateBot(botId, {
        agent: {
          tools,
        },
        title,
        description,
        instruction,
        generationParams: {
          maxTokens,
          temperature,
          topK,
          topP,
          stopSequences: stopSequences.split(','),
          reasoningParams: {
            budgetTokens,
          },
        },
        knowledge: {
          sourceUrls: urls.filter((s) => s !== ''),
          // Sitemap cannot be used yet.
          sitemapUrls: [],
          s3Urls: s3Urls.filter((s) => s !== ''),
          addedFilenames,
          deletedFilenames,
          unchangedFilenames,
        },
        displayRetrievedChunks,
        promptCachingEnabled: promptCachingEnabled,
        conversationQuickStarters: conversationQuickStarters.filter(
          (qs) => qs.title !== '' && qs.example !== ''
        ),
        bedrockKnowledgeBase: {
          type: bedrockKnowledgeBaseType,
          knowledgeBaseId: (bedrockKnowledgeBaseType != null) ? knowledgeBaseId : null,
          existKnowledgeBaseId,
          embeddingsModel,
          chunkingConfiguration: (() => {
            switch (chunkingStrategy) {
              case 'default':
                return { chunkingStrategy: 'default' };
              case 'fixed_size':
                return fixedSizeParams;
              case 'hierarchical':
                return hierarchicalParams;
              case 'semantic':
                return semanticParams;
              default:
                return { chunkingStrategy: 'none' };
            }
          })(),
          openSearch: openSearchParams,
          searchParams: searchParams,
          parsingModel,
          webCrawlingScope,
          webCrawlingFilters,
        },
        bedrockGuardrails: {
          isGuardrailEnabled,
          hateThreshold: hateThreshold,
          insultsThreshold: insultsThreshold,
          sexualThreshold: sexualThreshold,
          violenceThreshold: violenceThreshold,
          misconductThreshold: misconductThreshold,
          groundingThreshold: groundingThreshold,
          relevanceThreshold: relevanceThreshold,
          guardrailArn: (isGuardrailEnabled) ? guardrailArn : '',
          guardrailVersion: (isGuardrailEnabled) ? guardrailVersion : '',
        },
        activeModels,
      })
        .then(() => {
          navigate('/bot/my');
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [
    isValid,
    isNewBot,
    updateBot,
    botId,
    tools,
    title,
    description,
    instruction,
    maxTokens,
    temperature,
    topK,
    topP,
    stopSequences,
    budgetTokens,
    searchParams,
    urls,
    s3Urls,
    addedFilenames,
    deletedFilenames,
    unchangedFilenames,
    displayRetrievedChunks,
    promptCachingEnabled,
    conversationQuickStarters,
    navigate,
    bedrockKnowledgeBaseType,
    knowledgeBaseId,
    existKnowledgeBaseId,
    embeddingsModel,
    chunkingStrategy,
    fixedSizeParams,
    hierarchicalParams,
    semanticParams,
    openSearchParams,
    isGuardrailEnabled,
    hateThreshold,
    insultsThreshold,
    sexualThreshold,
    violenceThreshold,
    misconductThreshold,
    groundingThreshold,
    relevanceThreshold,
    guardrailArn,
    guardrailVersion,
    parsingModel,
    webCrawlingScope,
    webCrawlingFilters,
    activeModels,
  ]);

  const [isOpenSamples, setIsOpenSamples] = useState(false);

  const disabledRegister = useMemo(() => {
    return title === '' || files.findIndex((f) => f.status !== 'UPLOADED') > -1;
  }, [files, title]);

  return (
    <>
      <DialogInstructionsSamples
        isOpen={isOpenSamples}
        onClose={() => {
          setIsOpenSamples(false);
        }}
      />
      <div className="mb-20 flex justify-center">
        <div className="w-2/3">
          <div className="mt-5 w-full">
            <div className="text-xl font-bold">
              {isNewBot ? t('bot.create.pageTitle') : t('bot.edit.pageTitle')}
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <InputText
                label={t('bot.item.title')}
                disabled={isLoading}
                value={title}
                onChange={setTitle}
                hint={t('input.hint.required')}
              />
              <InputText
                label={t('bot.item.description')}
                disabled={isLoading}
                value={description}
                onChange={setDescription}
              />
              <div className="relative mt-3">
                <Button
                  className="absolute -top-3 right-0 text-xs"
                  outlined
                  onClick={() => {
                    setIsOpenSamples(true);
                  }}>
                  <PiNote className="mr-1" />
                  {t('bot.button.instructionsSamples')}
                </Button>
                <Textarea
                  label={t('bot.item.instruction')}
                  disabled={isLoading}
                  rows={5}
                  hint={t('bot.help.instructions')}
                  value={instruction}
                  onChange={setInstruction}
                />
              </div>

              <div className="mt-3" />
              <AvailableTools
                availableTools={availableTools}
                tools={tools}
                setTools={setTools}
              />

              <div className="mt-3">
                <div className="flex items-center gap-1">
                  <div className="text-lg font-bold">
                    {t('bot.label.knowledge')}
                  </div>
                </div>

                <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                  {t('bot.help.knowledge.overview')}
                </div>

                <div className="mt-2 flex gap-4">
                  <RadioButton
                    name="knowledgeBaseType"
                    value="new"
                    checked={knowledgeBaseType === 'new'}
                    label={t(
                      'knowledgeBaseSettings.advancedConfigration.createDedicatedKnowledgeBase.label'
                    )}
                    onChange={() => {
                      setKnowledgeBaseType('new');
                      setExistKnowledgeBaseId(null);
                    }}
                  />
                  <RadioButton
                    name="knowledgeBaseType"
                    value="shared"
                    checked={knowledgeBaseType === 'shared'}
                    label={t(
                      'knowledgeBaseSettings.advancedConfigration.createTenantInSharedKnowledgeBase.label'
                    )}
                    onChange={() => {
                      setKnowledgeBaseType('shared');
                      setExistKnowledgeBaseId(null);
                    }}
                  />
                  <RadioButton
                    name="knowledgeBaseType"
                    value="existing"
                    checked={knowledgeBaseType === 'existing'}
                    label={t(
                      'knowledgeBaseSettings.advancedConfigration.useExistingKnowledgeBase.label'
                    )}
                    disabled={!!knowledgeBasesError}
                    onChange={() => setKnowledgeBaseType('existing')}
                  />
                </div>

                {
                  errorMessages['syncError'] && (
                    <Alert
                      className="mt-2"
                      severity="error"
                      title={t('bot.alert.sync.error.title')}>
                      <>
                        <div className="mb-1 text-sm">
                          <div>{t('bot.alert.sync.error.body')}</div>
                          <div> {errorMessages['syncError']}</div>
                        </div>
                      </>
                    </Alert>
                  )
                }

                {(() => {
                  if (knowledgeBaseType === 'existing') {
                    // Prepare knowledge base options for the dropdown
                    const knowledgeBaseOptions = (
                      knowledgeBasesData?.knowledgeBases || []
                    ).map((kb) => ({
                      value: kb.knowledgeBaseId,
                      label: `${kb.name} (${kb.knowledgeBaseId})`,
                      description: kb.description || kb.status,
                    }));

                    return (
                      <div className="mt-3 rounded-lg border border-aws-font-color-light/30 p-4 dark:border-aws-font-color-dark/30">
                        <Select
                          label={t(
                            'knowledgeBaseSettings.advancedConfigration.existingKnowledgeBaseId.label'
                          )}
                          value={existKnowledgeBaseId ?? ''}
                          options={knowledgeBaseOptions}
                          onChange={setExistKnowledgeBaseId}
                          disabled={
                            isLoadingKnowledgeBases ||
                            !!knowledgeBasesError
                          }
                        />
                        {isLoadingKnowledgeBases && (
                          <div className="mt-2 text-sm text-aws-font-color-light dark:text-aws-font-color-dark">
                            {t('bot.label.loadingKnowledgeBases')}
                          </div>
                        )}
                        {knowledgeBasesError && (
                          <div className="mt-2 text-sm text-red">
                            {t('bot.label.failedToLoadKnowledgeBases')}
                          </div>
                        )}
                        {!isLoadingKnowledgeBases &&
                          !knowledgeBasesError &&
                          knowledgeBaseOptions.length === 0 && (
                            <div className="mt-2 text-sm text-red">
                              {t(
                                'knowledgeBaseSettings.advancedConfigration.existingKnowledgeBaseId.noKnowledgeBasesFound'
                              )}
                            </div>
                          )}
                        <div className="mt-2 text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                          {t(
                            'knowledgeBaseSettings.advancedConfigration.existingKnowledgeBaseId.description'
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (knowledgeBaseType === 'new' || knowledgeBaseType === 'shared') {
                    return (
                      <div className="mt-3 rounded-lg border border-aws-font-color-light/30 p-4 dark:border-aws-font-color-dark/30">
                        <div className="mt-3">
                          <div className="font-semibold">
                            {t('bot.label.file')}
                          </div>
                          <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                            {t('bot.help.knowledge.file')}
                          </div>
                          <div className="mt-2 flex w-full flex-col gap-1">
                            <KnowledgeFileUploader
                              className="h-48"
                              botId={botId}
                              files={files}
                              onAdd={onAddFiles}
                              onUpdate={onUpdateFiles}
                              onDelete={onDeleteFiles}
                              disabled={disabledKnowledgeEdit}
                            />
                          </div>
                        </div>

                        {knowledgeBaseType === 'new' && (
                          <>
                            <div className="mt-4">
                              <div className="font-semibold">
                                {t('bot.label.s3url')}
                              </div>
                              <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                                {t('bot.help.knowledge.s3url')}
                              </div>
                              <div className="mt-2 flex w-full flex-col gap-1">
                                {s3Urls.map((s3Url, idx) => (
                                  <div className="flex w-full gap-2" key={idx}>
                                    <InputText
                                      className="w-full"
                                      type="text"
                                      disabled={isLoading || disabledKnowledgeEdit}
                                      value={s3Url}
                                      placeholder={
                                        's3://example-bucket/path/to/data-source/'
                                      }
                                      onChange={(s) => {
                                        onChangeS3Url(s, idx);
                                      }}
                                      errorMessage={errorMessages[`s3Urls-${idx}`]}
                                    />
                                    <ButtonIcon
                                      className="text-red"
                                      disabled={
                                        (s3Urls.length === 1 && !s3Url[0]) ||
                                        isLoading ||
                                        disabledKnowledgeEdit
                                      }
                                      onClick={() => {
                                        onClickRemoveS3Url(idx);
                                      }}>
                                      <PiTrash />
                                    </ButtonIcon>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2">
                                <Button
                                  outlined
                                  icon={<PiPlus />}
                                  disabled={
                                    s3Urls.length >= 4 || disabledKnowledgeEdit
                                  }
                                  onClick={onClickAddS3Url}>
                                  {t('button.add')}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="font-semibold">
                                {t('bot.label.url')}
                              </div>
                              <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                                {t('bot.help.knowledge.url')}
                              </div>
                              <div className="mt-2 flex w-full flex-col gap-1">
                                {urls.map((url, idx) => (
                                  <div className="flex w-full gap-2" key={idx}>
                                    <InputText
                                      className="w-full"
                                      type="text"
                                      disabled={isLoading || disabledKnowledgeEdit}
                                      value={url}
                                      placeholder="https://example.com"
                                      onChange={(s) => {
                                        onChangeUrls(s, idx);
                                      }}
                                      errorMessage={errorMessages[`urls-${idx}`]}
                                    />
                                    <ButtonIcon
                                      className="text-red"
                                      disabled={
                                        (urls.length === 1 && !url[0]) ||
                                        isLoading ||
                                        disabledKnowledgeEdit
                                      }
                                      onClick={() => {
                                        onClickRemoveUrls(idx);
                                      }}>
                                      <PiTrash />
                                    </ButtonIcon>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2">
                                <Button
                                  outlined
                                  icon={<PiPlus />}
                                  disabled={
                                    urls.length >= 10 || disabledKnowledgeEdit
                                  }
                                  onClick={onClickAddUrls}>
                                  {t('button.add')}
                                </Button>
                              </div>

                              <ExpandableDrawerGroup
                                isDefaultShow={false}
                                label={t(
                                  'knowledgeBaseSettings.webCrawlerConfig.title'
                                )}
                                className="py-2">
                                <div className="mt-3">
                                  <Select
                                    label={t(
                                      'knowledgeBaseSettings.webCrawlerConfig.crawlingScope.label'
                                    )}
                                    value={webCrawlingScope}
                                    options={webCrawlingScopeOptions}
                                    onChange={(val) => {
                                      setWebCrawlingScope(val as WebCrawlingScope);
                                    }}
                                    disabled={disabledKnowledgeEdit}
                                  />
                                </div>

                                <div className="mt-4">
                                  <div className="font-semibold">
                                    {t(
                                      'knowledgeBaseSettings.webCrawlerConfig.includePatterns.label'
                                    )}
                                  </div>
                                  <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                                    {t(
                                      'knowledgeBaseSettings.webCrawlerConfig.includePatterns.hint'
                                    )}
                                  </div>
                                  <div className="mt-2 flex w-full flex-col gap-1">
                                    {webCrawlingFilters.includePatterns.map(
                                      (pattern, idx) => (
                                        <div
                                          className="flex w-full gap-2"
                                          key={idx}>
                                          <InputText
                                            className="w-full"
                                            type="text"
                                            disabled={isLoading}
                                            value={pattern}
                                            placeholder=".*\.html$"
                                            onChange={(s) => {
                                              onChangeIncludePattern(s, idx);
                                            }}
                                          />
                                          <ButtonIcon
                                            className="text-red"
                                            disabled={
                                              (webCrawlingFilters.includePatterns
                                                .length === 1 &&
                                                !pattern) ||
                                              isLoading
                                            }
                                            onClick={() => {
                                              onClickRemoveIncludePattern(idx);
                                            }}>
                                            <PiTrash />
                                          </ButtonIcon>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <Button
                                      outlined
                                      icon={<PiPlus />}
                                      onClick={onClickAddIncludePattern}>
                                      {t('button.add')}
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <div className="font-semibold">
                                    {t(
                                      'knowledgeBaseSettings.webCrawlerConfig.excludePatterns.label'
                                    )}
                                  </div>
                                  <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                                    {t(
                                      'knowledgeBaseSettings.webCrawlerConfig.excludePatterns.hint'
                                    )}
                                  </div>
                                  <div className="mt-2 flex w-full flex-col gap-1">
                                    {webCrawlingFilters.excludePatterns.map(
                                      (pattern, idx) => (
                                        <div
                                          className="flex w-full gap-2"
                                          key={idx}>
                                          <InputText
                                            className="w-full"
                                            type="text"
                                            disabled={isLoading}
                                            value={pattern}
                                            placeholder=".*\.pdf$"
                                            onChange={(s) => {
                                              onChangeExcludePattern(s, idx);
                                            }}
                                          />
                                          <ButtonIcon
                                            className="text-red"
                                            disabled={
                                              (webCrawlingFilters.excludePatterns
                                                .length === 1 &&
                                                !pattern) ||
                                              isLoading
                                            }
                                            onClick={() => {
                                              onClickRemoveExcludePattern(idx);
                                            }}>
                                            <PiTrash />
                                          </ButtonIcon>
                                        </div>
                                      )
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <Button
                                      outlined
                                      icon={<PiPlus />}
                                      onClick={onClickAddExcludePattern}>
                                      {t('button.add')}
                                    </Button>
                                  </div>
                                </div>
                              </ExpandableDrawerGroup>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                })()}

                <div className="mt-4">
                  <div className="font-semibold">
                    {t('bot.label.citeRetrievedContexts')}
                  </div>
                  <div className="flex">
                    <Toggle
                      value={displayRetrievedChunks}
                      onChange={setDisplayRetrievedChunks}
                    />
                    <div className="whitespace-pre-wrap text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                      {t('bot.help.knowledge.citeRetrievedContexts')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-1">
                  <div className="text-lg font-bold">
                    {t('bot.label.quickStarter.title')}
                  </div>
                </div>

                <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                  {t('bot.help.quickStarter.overview')}
                </div>

                <div className="mt-2">
                  <div className="mt-2 flex w-full flex-col gap-1">
                    {conversationQuickStarters.map(
                      (conversationQuickStarter, idx) => (
                        <div
                          className="flex w-full flex-col gap-2 rounded border border-aws-font-color-light/50 p-2 dark:border-aws-font-color-dark/50"
                          key={idx}>
                          <InputText
                            className="w-full"
                            placeholder={t(
                              'bot.label.quickStarter.exampleTitle'
                            )}
                            disabled={isLoading}
                            value={conversationQuickStarter.title}
                            onChange={(s) => {
                              updateQuickStarter(
                                {
                                  ...conversationQuickStarter,
                                  title: s,
                                },
                                idx
                              );
                            }}
                            errorMessage={
                              errorMessages[`conversationQuickStarter${idx}`]
                            }
                          />

                          <Textarea
                            className="w-full"
                            label={t('bot.label.quickStarter.example')}
                            disabled={isLoading}
                            rows={3}
                            value={conversationQuickStarter.example}
                            onChange={(s) => {
                              updateQuickStarter(
                                {
                                  ...conversationQuickStarter,
                                  example: s,
                                },
                                idx
                              );
                            }}
                          />
                          <div className="flex justify-end">
                            <Button
                              className="bg-red"
                              disabled={
                                (conversationQuickStarters.length === 1 &&
                                  !conversationQuickStarters[0].title &&
                                  !conversationQuickStarters[0].example) ||
                                isLoading
                              }
                              icon={<PiTrash />}
                              onClick={() => {
                                removeQuickStarter(idx);
                              }}>
                              {t('button.delete')}
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-2">
                    <Button
                      outlined
                      icon={<PiPlus />}
                      onClick={addQuickStarter}>
                      {t('button.add')}
                    </Button>
                  </div>
                </div>
              </div>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('generationConfig.title')}
                className="py-2">
                <GenerationConfig
                  topK={topK}
                  setTopK={setTopK}
                  topP={topP}
                  setTopP={setTopP}
                  temperature={temperature}
                  setTemperature={setTemperature}
                  maxTokens={maxTokens}
                  setMaxTokens={setMaxTokens}
                  stopSequences={stopSequences}
                  setStopSequences={setStopSequences}
                  budgetTokens={budgetTokens}
                  setBudgetTokens={setBudgetTokens}
                  isLoading={isLoading}
                  errorMessages={errorMessages}
                />
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('knowledgeBaseSettings.title')}
                className="py-2">
                <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                  {t('knowledgeBaseSettings.description')}
                </div>

                <div className="mt-3">
                  <Select
                    label={t('knowledgeBaseSettings.embeddingModel.label')}
                    value={embeddingsModel}
                    options={embeddingsModelOptions}
                    onChange={(val) => {
                      onChangeEmbeddingsModel(val as EmbeddingsModel);
                    }}
                    disabled={!isNewBot}
                  />
                </div>

                <div className="mt-3">
                  <Select
                    label={t('knowledgeBaseSettings.advancedParsing.label')}
                    value={parsingModel || 'disabled'}
                    options={parsingModelOptions}
                    onChange={(val) => {
                      setParsingModel(val as ParsingModel);
                    }}
                    disabled={!isNewBot}
                  />
                  <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                    {t('knowledgeBaseSettings.advancedParsing.hint')}
                  </div>
                </div>

                <div className="mt-3">
                  <Select
                    label={t('knowledgeBaseSettings.chunkingStrategy.label')}
                    value={chunkingStrategy}
                    options={chunkingStrategyOptions}
                    onChange={(val) => {
                      setChunkingStrategy(val as ChunkingStrategy);
                    }}
                    disabled={!isNewBot}
                  />
                </div>
                {chunkingStrategy === 'fixed_size' && (
                  <>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={fixedSizeParams.maxTokens}
                        hint={t('knowledgeBaseSettings.chunkingMaxTokens.hint')}
                        label={
                          <div className="flex items-center gap-1">
                            {t('knowledgeBaseSettings.chunkingMaxTokens.label')}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t('embeddingSettings.help.chunkSize')}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_FIXED_CHUNK_PARAMS.maxTokens.MIN,
                          max: EDGE_FIXED_CHUNK_PARAMS.maxTokens.MAX[
                            embeddingsModel
                          ],
                          step: EDGE_FIXED_CHUNK_PARAMS.maxTokens.STEP,
                        }}
                        onChange={(value) =>
                          setFixedSizeParams((params) => ({
                            ...params,
                            maxTokens: value,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages['fixedSizeParams.maxTokens']
                        }
                      />
                    </div>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={fixedSizeParams.overlapPercentage}
                        hint={t(
                          'knowledgeBaseSettings.chunkingOverlapPercentage.hint'
                        )}
                        label={
                          <div className="flex items-center gap-1">
                            {t(
                              'knowledgeBaseSettings.chunkingOverlapPercentage.label'
                            )}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t('embeddingSettings.help.chunkOverlap')}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.MIN,
                          max: EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.MAX,
                          step: EDGE_FIXED_CHUNK_PARAMS.overlapPercentage.STEP,
                        }}
                        onChange={(percentage) =>
                          setFixedSizeParams((params) => ({
                            ...params,
                            overlapPercentage: percentage,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages['fixedSizeParams.overlapPercentage']
                        }
                      />
                    </div>
                  </>
                )}
                {chunkingStrategy === 'hierarchical' && (
                  <>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={hierarchicalParams.overlapTokens}
                        hint={t('knowledgeBaseSettings.overlapTokens.hint')}
                        label={
                          <div className="flex items-center gap-1">
                            {t('knowledgeBaseSettings.overlapTokens.label')}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t(
                                'embeddingSettings.help.overlapTokens'
                              )}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_HIERARCHICAL_CHUNK_PARAMS.overlapTokens.MIN,
                          max: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize
                            .MAX[embeddingsModel],
                          step: EDGE_HIERARCHICAL_CHUNK_PARAMS.overlapTokens
                            .STEP,
                        }}
                        onChange={(value) =>
                          setHierarchicalParams((params) => ({
                            ...params,
                            overlapTokens: value,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages['hierarchicalParams.overlapTokens']
                        }
                      />
                    </div>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={hierarchicalParams.maxParentTokenSize}
                        hint={t(
                          'knowledgeBaseSettings.maxParentTokenSize.hint'
                        )}
                        label={
                          <div className="flex items-center gap-1">
                            {t(
                              'knowledgeBaseSettings.maxParentTokenSize.label'
                            )}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t(
                                'embeddingSettings.help.maxParentTokenSize'
                              )}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize
                            .MIN,
                          max: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxParentTokenSize
                            .MAX[embeddingsModel],
                          step: EDGE_HIERARCHICAL_CHUNK_PARAMS
                            .maxParentTokenSize.STEP,
                        }}
                        onChange={(value) =>
                          setHierarchicalParams((params) => ({
                            ...params,
                            maxParentTokenSize: value,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages['hierarchicalParams.maxParentTokenSize']
                        }
                      />
                    </div>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={hierarchicalParams.maxChildTokenSize}
                        hint={t('knowledgeBaseSettings.maxChildTokenSize.hint')}
                        label={
                          <div className="flex items-center gap-1">
                            {t('knowledgeBaseSettings.maxChildTokenSize.label')}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t(
                                'embeddingSettings.help.maxChildTokenSize'
                              )}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize
                            .MIN,
                          max: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize
                            .MAX[embeddingsModel],
                          step: EDGE_HIERARCHICAL_CHUNK_PARAMS.maxChildTokenSize
                            .STEP,
                        }}
                        onChange={(value) =>
                          setHierarchicalParams((params) => ({
                            ...params,
                            maxChildTokenSize: value,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages['hierarchicalParams.maxChildTokenSize']
                        }
                      />
                    </div>
                  </>
                )}
                {chunkingStrategy === 'semantic' && (
                  <>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={semanticParams.maxTokens}
                        hint={t('knowledgeBaseSettings.chunkingMaxTokens.hint')}
                        label={
                          <div className="flex items-center gap-1">
                            {t('knowledgeBaseSettings.chunkingMaxTokens.label')}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t('embeddingSettings.help.chunkSize')}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MIN,
                          max: EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.MAX[
                            embeddingsModel
                          ],
                          step: EDGE_SEMANTIC_CHUNK_PARAMS.maxTokens.STEP,
                        }}
                        onChange={(value) =>
                          setSemanticParams((params) => ({
                            ...params,
                            maxTokens: value,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={errorMessages['semanticParams.maxTokens']}
                      />
                    </div>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={semanticParams.bufferSize}
                        hint={t('knowledgeBaseSettings.bufferSize.hint')}
                        label={
                          <div className="flex items-center gap-1">
                            {t('knowledgeBaseSettings.bufferSize.label')}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t('embeddingSettings.help.bufferSize')}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.MIN,
                          max: EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.MAX,
                          step: EDGE_SEMANTIC_CHUNK_PARAMS.bufferSize.STEP,
                        }}
                        onChange={(value) =>
                          setSemanticParams((params) => ({
                            ...params,
                            bufferSize: value,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages['semanticParams.bufferSize']
                        }
                      />
                    </div>
                    <div className="mx-4 mt-2">
                      <Slider
                        value={semanticParams.breakpointPercentileThreshold}
                        hint={t(
                          'knowledgeBaseSettings.breakpointPercentileThreshold.hint'
                        )}
                        label={
                          <div className="flex items-center gap-1">
                            {t(
                              'knowledgeBaseSettings.breakpointPercentileThreshold.label'
                            )}
                            <Help
                              direction={TooltipDirection.RIGHT}
                              message={t(
                                'embeddingSettings.help.breakpointPercentileThreshold'
                              )}
                            />
                          </div>
                        }
                        range={{
                          min: EDGE_SEMANTIC_CHUNK_PARAMS
                            .breakpointPercentileThreshold.MIN,
                          max: EDGE_SEMANTIC_CHUNK_PARAMS
                            .breakpointPercentileThreshold.MAX,
                          step: EDGE_SEMANTIC_CHUNK_PARAMS
                            .breakpointPercentileThreshold.STEP,
                        }}
                        onChange={(percentage) =>
                          setSemanticParams((params) => ({
                            ...params,
                            breakpointPercentileThreshold: percentage,
                          }))
                        }
                        disabled={!isNewBot}
                        errorMessage={
                          errorMessages[
                            'semanticParams.breakpointPercentileThreshold'
                          ]
                        }
                      />
                    </div>
                  </>
                )}

                {isNewBot && (
                  <div className="mt-3 grid gap-1">
                    <Select
                      label={t(
                        'knowledgeBaseSettings.opensearchAnalyzer.label'
                      )}
                      value={analyzer}
                      options={analyzerOptions}
                      onChange={(val) => {
                        setAnalyzer(val);
                        setOpenSearchParams(OPENSEARCH_ANALYZER[val]);
                      }}
                      className="mt-2"
                    />
                    <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                      {t('knowledgeBaseSettings.opensearchAnalyzer.hint')}
                    </div>
                  </div>
                )}
                {!isNewBot && (
                  <div className="mt-3 grid gap-1">
                    <div className="text-sm">
                      {t('knowledgeBaseSettings.opensearchAnalyzer.label')}
                    </div>
                    <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                      {t('knowledgeBaseSettings.opensearchAnalyzer.hint')}
                    </div>
                    <div
                      className="grid grid-cols-[auto_1fr] gap-2 rounded 
                      border border-aws-font-color-light/50 p-4 text-sm dark:border-aws-font-color-dark/50">
                      <div>
                        {t(
                          'knowledgeBaseSettings.opensearchAnalyzer.tokenizer'
                        )}
                      </div>
                      <div>
                        {openSearchParams.analyzer?.tokenizer ??
                          t(
                            'knowledgeBaseSettings.opensearchAnalyzer.not_specified'
                          )}
                      </div>
                      <div>
                        {t(
                          'knowledgeBaseSettings.opensearchAnalyzer.normalizer'
                        )}
                      </div>
                      <div>
                        {openSearchParams.analyzer?.characterFilters ??
                          t(
                            'knowledgeBaseSettings.opensearchAnalyzer.not_specified'
                          )}
                      </div>
                      <div>
                        {t(
                          'knowledgeBaseSettings.opensearchAnalyzer.token_filter'
                        )}
                      </div>
                      <div className="grid gap-2">
                        {openSearchParams.analyzer?.tokenFilters.join(', ') ??
                          t(
                            'knowledgeBaseSettings.opensearchAnalyzer.not_specified'
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('searchSettings.title')}
                className="py-2">
                <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                  {t('searchSettings.description')}
                </div>
                <div className="mt-3">
                  <Slider
                    value={searchParams.maxResults}
                    hint={t('searchSettings.maxResults.hint')}
                    label={t('searchSettings.maxResults.label')}
                    range={{
                      min: EDGE_SEARCH_PARAMS.maxResults.MIN,
                      max: EDGE_SEARCH_PARAMS.maxResults.MAX,
                      step: EDGE_SEARCH_PARAMS.maxResults.STEP,
                    }}
                    onChange={(maxResults) =>
                      setSearchParams((params) => ({
                        ...params,
                        maxResults,
                      }))
                    }
                    errorMessage={errorMessages['maxResults']}
                  />
                </div>
                <div className="mt-3">
                  <Select
                    label={t('searchSettings.searchType.label')}
                    value={searchParams.searchType}
                    options={searchTypeOptions}
                    onChange={(searchType) => {
                      setSearchParams(
                        (params) =>
                          ({
                            ...params,
                            searchType,
                          }) as SearchParams
                      );
                    }}
                  />
                </div>
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('guardrails.harmfulCategories.label')}
                className="py-2">
                <div className="mt-2">
                  <Slider
                    value={hateThreshold}
                    hint={t('guardrails.harmfulCategories.hate.hint')}
                    label={t('guardrails.harmfulCategories.hate.label')}
                    range={{
                      min: GUARDRAILS_FILTERS_THRESHOLD.MIN,
                      max: GUARDRAILS_FILTERS_THRESHOLD.MAX,
                      step: GUARDRAILS_FILTERS_THRESHOLD.STEP,
                    }}
                    onChange={(hateThreshold) => {
                      setHateThreshold(hateThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['hateThreshold']}
                  />
                </div>
                <div className="mt-2">
                  <Slider
                    value={insultsThreshold}
                    hint={t('guardrails.harmfulCategories.insults.hint')}
                    label={t('guardrails.harmfulCategories.insults.label')}
                    range={{
                      min: GUARDRAILS_FILTERS_THRESHOLD.MIN,
                      max: GUARDRAILS_FILTERS_THRESHOLD.MAX,
                      step: GUARDRAILS_FILTERS_THRESHOLD.STEP,
                    }}
                    onChange={(insultsThreshold) => {
                      setInsultsThreshold(insultsThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['insultsThreshold']}
                  />
                </div>
                <div className="mt-2">
                  <Slider
                    value={sexualThreshold}
                    hint={t('guardrails.harmfulCategories.sexual.hint')}
                    label={t('guardrails.harmfulCategories.sexual.label')}
                    range={{
                      min: GUARDRAILS_FILTERS_THRESHOLD.MIN,
                      max: GUARDRAILS_FILTERS_THRESHOLD.MAX,
                      step: GUARDRAILS_FILTERS_THRESHOLD.STEP,
                    }}
                    onChange={(sexualThreshold) => {
                      setSexualThreshold(sexualThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['sexualThreshold']}
                  />
                </div>
                <div className="mt-2">
                  <Slider
                    value={violenceThreshold}
                    hint={t('guardrails.harmfulCategories.violence.hint')}
                    label={t('guardrails.harmfulCategories.violence.label')}
                    range={{
                      min: GUARDRAILS_FILTERS_THRESHOLD.MIN,
                      max: GUARDRAILS_FILTERS_THRESHOLD.MAX,
                      step: GUARDRAILS_FILTERS_THRESHOLD.STEP,
                    }}
                    onChange={(violenceThreshold) => {
                      setViolenceThreshold(violenceThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['violenceThreshold']}
                  />
                </div>
                <div className="mt-2">
                  <Slider
                    value={misconductThreshold}
                    hint={t('guardrails.harmfulCategories.misconduct.hint')}
                    label={t('guardrails.harmfulCategories.misconduct.label')}
                    range={{
                      min: GUARDRAILS_FILTERS_THRESHOLD.MIN,
                      max: GUARDRAILS_FILTERS_THRESHOLD.MAX,
                      step: GUARDRAILS_FILTERS_THRESHOLD.STEP,
                    }}
                    onChange={(misconductThreshold) => {
                      setMisconductThreshold(misconductThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['misconductThreshold']}
                  />
                </div>
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('guardrails.contextualGroundingCheck.label')}
                className="py-2">
                <div className="mt-2">
                  <Slider
                    value={groundingThreshold}
                    hint={t(
                      'guardrails.contextualGroundingCheck.groundingThreshold.hint'
                    )}
                    label={t(
                      'guardrails.contextualGroundingCheck.groundingThreshold.label'
                    )}
                    range={{
                      min: GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD.MIN,
                      max: GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD.MAX,
                      step: GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD.STEP,
                    }}
                    onChange={(groundingThreshold) => {
                      setGroundingThreshold(groundingThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['groundingThreshold']}
                  />
                </div>
                <div className="mt-2">
                  <Slider
                    value={relevanceThreshold}
                    hint={t(
                      'guardrails.contextualGroundingCheck.relevanceThreshold.hint'
                    )}
                    label={t(
                      'guardrails.contextualGroundingCheck.relevanceThreshold.label'
                    )}
                    range={{
                      min: GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD.MIN,
                      max: GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD.MAX,
                      step: GUARDRAILS_CONTEXTUAL_GROUNDING_THRESHOLD.STEP,
                    }}
                    onChange={(relevanceThreshold) => {
                      setRelevanceThreshold(relevanceThreshold);
                    }}
                    enableDecimal={true}
                    errorMessage={errorMessages['relevanceThreshold']}
                  />
                </div>
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('bot.activeModels.title')}
                className="py-2">
                <div className="text-sm text-aws-font-color-light/50 dark:text-aws-font-color-dark">
                  {t('bot.activeModels.description')}
                </div>

                <div className="mt-4">
                  <div className="mt-2 space-y-2">
                    {activeModelsOptions.map(({ key, label, description }) => (
                      <div key={key} className="flex items-start">
                        <Toggle
                          value={
                            activeModels[
                              toCamelCase(key) as keyof ActiveModels
                            ] ?? true
                          }
                          onChange={(value) => onChangeActiveModels(key, value)}
                        />
                        <div>
                          <div>{label}</div>
                          <div className="text-sm text-dark-gray dark:text-light-gray">
                            {description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                isDefaultShow={false}
                label={t('bot.promptCaching.title')}
                className="py-2"
              >
                <div className="flex mt-4 items-start">
                  <Toggle
                    value={promptCachingEnabled}
                    onChange={setPromptCachingEnabled}
                  />
                  <div>
                    <Trans t={t} i18nKey="bot.promptCaching.promptCachingEnabled.title" />
                    <div className="text-sm text-dark-gray dark:text-light-gray">
                      <Trans t={t} i18nKey="bot.promptCaching.promptCachingEnabled.description" />
                    </div>
                  </div>
                </div>
              </ExpandableDrawerGroup>

              {errorMessages['syncChunkError'] && (
                <Alert
                  className="mt-2"
                  severity="error"
                  title={t('embeddingSettings.alert.sync.error.title')}>
                  <>
                    <div className="mb-1 text-sm">
                      {t('embeddingSettings.alert.sync.error.body')}
                    </div>
                  </>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button outlined icon={<PiCaretLeft />} onClick={onClickBack}>
                  {t('button.back')}
                </Button>

                {isNewBot ? (
                  <Button
                    onClick={onClickCreate}
                    loading={isLoading}
                    disabled={disabledRegister}>
                    {t('bot.button.create')}
                  </Button>
                ) : (
                  <Button
                    onClick={onClickEdit}
                    loading={isLoading}
                    disabled={disabledRegister}>
                    {t('bot.button.save')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BotKbEditPage;
