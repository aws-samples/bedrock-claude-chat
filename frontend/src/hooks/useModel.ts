import { create } from 'zustand';
import { Model } from '../@types/conversation';
import { ModelItem } from '../@types/global-config';
import { AVAILABLE_MODEL_KEYS } from '../constants/index';
import { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from './useLocalStorage';
import useGlobalConfig from './useGlobalConfig';
import { ActiveModels } from '../@types/bot';
import { toCamelCase } from '../utils/StringUtils';

const CLAUDE_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const NOVA_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const LLAMA_SUPPORTED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const useModelState = create<{
  modelId: Model | undefined;
  setModelId: (m: Model) => void;
}>((set) => ({
  modelId: undefined, // Will be set by useEffect based on config/localStorage
  setModelId: (m) => {
    set({
      modelId: m,
    });
  },
}));

// Store the Previous BotId
const usePreviousBotId = (botId: string | null | undefined) => {
  const ref = useRef<string | null | undefined>();

  useEffect(() => {
    ref.current = botId;
  }, [botId]);

  return ref.current;
};

const useModel = (botId?: string | null, activeModels?: ActiveModels) => {
  const { getGlobalConfig } = useGlobalConfig();
  const { data: globalConfig } = getGlobalConfig();

  const processedActiveModels = useMemo(() => {
    // Early return if activeModels is provided and not empty
    if (activeModels && Object.keys(activeModels).length > 0) {
      return activeModels;
    }

    // Create a new object with all models set to true
    return AVAILABLE_MODEL_KEYS.reduce((acc: ActiveModels, model: Model) => {
      // Optimize string replacement by doing it in one operation
      acc[toCamelCase(model) as keyof ActiveModels] = true;
      return acc;
    }, {} as ActiveModels);
  }, [activeModels]);

  const { t } = useTranslation();
  const previousBotId = usePreviousBotId(botId);

  const availableModels = useMemo<ModelItem[]>(() => {
    return [
      {
        modelId: 'claude-v4-opus',
        label: t('model.claude-v4-opus.label'),
        description: t('model.claude-v4-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.1-opus',
        label: t('model.claude-v4.1-opus.label'),
        description: t('model.claude-v4.1-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.5-opus',
        label: t('model.claude-v4.5-opus.label'),
        description: t('model.claude-v4.5-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.6-opus',
        label: t('model.claude-v4.6-opus.label'),
        description: t('model.claude-v4.6-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.7-opus',
        label: t('model.claude-v4.7-opus.label'),
        description: t('model.claude-v4.7-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4-sonnet',
        label: t('model.claude-v4-sonnet.label'),
        description: t('model.claude-v4-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.5-sonnet',
        label: t('model.claude-v4.5-sonnet.label'),
        description: t('model.claude-v4.5-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.6-sonnet',
        label: t('model.claude-v4.6-sonnet.label'),
        description: t('model.claude-v4.6-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v4.5-haiku',
        label: t('model.claude-v4.5-haiku.label'),
        description: t('model.claude-v4.5-haiku.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v3-haiku',
        label: t('model.claude-v3-haiku.label'),
        description: t('model.claude-v3-haiku.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.5-haiku',
        label: t('model.claude-v3.5-haiku.label'),
        description: t('model.claude-v3.5-haiku.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.5-sonnet',
        label: t('model.claude-v3.5-sonnet.label'),
        description: t('model.claude-v3.5-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.5-sonnet-v2',
        label: t('model.claude-v3.5-sonnet-v2.label'),
        description: t('model.claude-v3.5-sonnet-v2.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'claude-v3.7-sonnet',
        label: t('model.claude-v3.7-sonnet.label'),
        description: t('model.claude-v3.7-sonnet.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: true,
      },
      {
        modelId: 'claude-v3-opus',
        label: t('model.claude-v3-opus.label'),
        description: t('model.claude-v3-opus.description'),
        supportMediaType: CLAUDE_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      // New Amazon Nova models
      {
        modelId: 'amazon-nova-pro',
        label: t('model.amazon-nova-pro.label'),
        description: t('model.amazon-nova-pro.description'),
        supportMediaType: NOVA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'amazon-nova-lite',
        label: t('model.amazon-nova-lite.label'),
        description: t('model.amazon-nova-lite.description'),
        supportMediaType: NOVA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'amazon-nova-micro',
        label: t('model.amazon-nova-micro.label'),
        description: t('model.amazon-nova-micro.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      // DeepSeek models
      {
        modelId: 'deepseek-r1',
        label: t('model.deepseek-r1.label'),
        description: t('model.deepseek-r1.description'),
        supportMediaType: [],
        supportReasoning: true,
        forceReasoningEnabled: true, // Deep Seek always return reasoning contents.
      },
      // Meta Llama 3 models
      {
        modelId: 'llama3-3-70b-instruct',
        label: t('model.llama3-3-70b-instruct.label'),
        description: t('model.llama3-3-70b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-1b-instruct',
        label: t('model.llama3-2-1b-instruct.label'),
        description: t('model.llama3-2-1b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-3b-instruct',
        label: t('model.llama3-2-3b-instruct.label'),
        description: t('model.llama3-2-3b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-11b-instruct',
        label: t('model.llama3-2-11b-instruct.label'),
        description: t('model.llama3-2-11b-instruct.description'),
        supportMediaType: LLAMA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      {
        modelId: 'llama3-2-90b-instruct',
        label: t('model.llama3-2-90b-instruct.label'),
        description: t('model.llama3-2-90b-instruct.description'),
        supportMediaType: LLAMA_SUPPORTED_MEDIA_TYPES,
        supportReasoning: false,
      },
      // OpenAI GPT-OSS models
      {
        modelId: 'gpt-oss-20b',
        label: t('model.gpt-oss-20b.label'),
        description: t('model.gpt-oss-20b.description'),
        supportMediaType: [],
        supportReasoning: true,
        forceReasoningEnabled: true, // GPT-OSS always return reasoning contents.
      },
      {
        modelId: 'gpt-oss-120b',
        label: t('model.gpt-oss-120b.label'),
        description: t('model.gpt-oss-120b.description'),
        supportMediaType: [],
        supportReasoning: true,
        forceReasoningEnabled: true, // GPT-OSS always return reasoning contents.
      },
      // Qwen3 models
      {
        modelId: 'qwen3-235b-a22b-2507',
        label: t('model.qwen3-235b-a22b-2507.label'),
        description: t('model.qwen3-235b-a22b-2507.description'),
        supportMediaType: [],
        supportReasoning: true,
      },
      {
        modelId: 'qwen3-coder-30b-a3b',
        label: t('model.qwen3-coder-30b-a3b.label'),
        description: t('model.qwen3-coder-30b-a3b.description'),
        supportMediaType: [],
        supportReasoning: true,
      },
      // Mistral
      {
        modelId: 'mistral-7b-instruct',
        label: t('model.mistral-7b-instruct.label'),
        description: t('model.mistral-7b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'mixtral-8x7b-instruct',
        label: t('model.mixtral-8x7b-instruct.label'),
        description: t('model.mixtral-8x7b-instruct.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'mistral-large',
        label: t('model.mistral-large.label'),
        description: t('model.mistral-large.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
      {
        modelId: 'mistral-large-2',
        label: t('model.mistral-large-2.label'),
        description: t('model.mistral-large-2.description'),
        supportMediaType: [],
        supportReasoning: false,
      },
    ].filter((model) => {
      // Filter based on global configuration if available
      if (
        globalConfig?.globalAvailableModels &&
        globalConfig.globalAvailableModels.length > 0
      ) {
        return globalConfig.globalAvailableModels.includes(model.modelId);
      }
      // If no global config, show all models
      return true;
    }) as ModelItem[];
  }, [t, globalConfig]);

  const [filteredModels, setFilteredModels] = useState(availableModels);
  const { modelId, setModelId } = useModelState();
  const [recentUseModelId, setRecentUseModelId] = useLocalStorage(
    'recentUseModelId',
    '' // Will use getDefaultModel() if localStorage is empty
  );

  // Save the model id by each bot
  const [botModelId, setBotModelId] = useLocalStorage(
    botId ? `bot_model_${botId}` : 'temp_model',
    ''
  );

  // Update filtered models when activeModels changes
  useEffect(() => {
    if (processedActiveModels) {
      const filtered = availableModels.filter((model: ModelItem) => {
        const key = toCamelCase(model.modelId) as keyof ActiveModels;
        return processedActiveModels[key] !== false;
      });
      setFilteredModels(filtered);
    }
  }, [processedActiveModels, availableModels]);

  const getDefaultModel = useCallback((): Model => {
    // Use the default model from global config if available
    const configDefaultModel = globalConfig?.defaultModel as Model | undefined;

    if (configDefaultModel) {
      // Check if the configured default model is available
      const defaultModelAvailable = filteredModels.some(
        (m: ModelItem) => m.modelId === configDefaultModel
      );
      if (defaultModelAvailable) {
        return configDefaultModel;
      }
    }

    // If config default is not available or not set yet, select the first model
    // Returns undefined if no models are available
    return filteredModels[0]?.modelId ?? 'amazon-nova-lite';
  }, [filteredModels, globalConfig?.defaultModel]);

  // select the model via list of activeModels
  const selectModel = useCallback(
    (targetModelId: Model) => {
      const modelExists = filteredModels.some(
        (m: ModelItem) => toCamelCase(m.modelId) === toCamelCase(targetModelId)
      );
      return modelExists ? targetModelId : (getDefaultModel() ?? filteredModels[0]?.modelId ?? 'amazon-nova-lite');
    },
    [filteredModels, getDefaultModel]
  );

  useEffect(() => {
    if (processedActiveModels === undefined) {
      return;
    }

    // botId is changed
    if (previousBotId !== botId) {
      // BotId is undefined, select recent modelId
      if (!botId) {
        setModelId(selectModel(recentUseModelId as Model));
        return;
      }

      // get botModelId from localStorage
      // When acquired from botModelID, settings for previousBotID are acquired, so a key is specified and acquired directly from local storage.
      const botModelId = localStorage.getItem(`bot_model_${botId}`);

      // modelId is in the the LocalStorage. use the saved modelId.
      if (botModelId) {
        setModelId(selectModel(botModelId as Model));
      } else {
        // If there is no bot-specific model ID, check if the last model used can be used
        const lastModelAvailable = filteredModels.some(
          (m: ModelItem) => m.modelId === recentUseModelId
        );

        // If the last model used is available, use it.
        if (lastModelAvailable) {
          setModelId(selectModel(recentUseModelId as Model));
          return;
        } else {
          // Use the default model if not available
          setModelId(selectModel(getDefaultModel()));
        }
      }
    } else {
      // Processing when botId and previousBotID are the same, but there is an update in FilteredModels
      if (botId) {
        const lastModelAvailable = filteredModels.some(
          (m: ModelItem) =>
            toCamelCase(m.modelId) === toCamelCase(recentUseModelId) ||
            toCamelCase(m.modelId) === toCamelCase(botModelId)
        );
        if (!lastModelAvailable) {
          setModelId(selectModel(getDefaultModel()));
        } else {
          setModelId(selectModel(recentUseModelId as Model));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  const model = useMemo(() => {
    if (!modelId) { return undefined; }
    return filteredModels.find(
      (model: ModelItem) => toCamelCase(model.modelId) === toCamelCase(modelId)
    );
  }, [filteredModels, modelId]);

  return {
    modelId: modelId ?? getDefaultModel(),
    setModelId: (model: Model) => {
      setRecentUseModelId(model);
      if (botId) {
        setBotModelId(model);
      }
      setModelId(model);
    },
    model,
    disabledImageUpload: (model?.supportMediaType.length ?? 0) === 0,
    acceptMediaType:
      model?.supportMediaType.flatMap((mediaType: string) => {
        const ext = mediaType.split('/')[1];
        return ext === 'jpeg' ? ['.jpg', '.jpeg'] : [`.${ext}`];
      }) ?? [],
    availableModels: filteredModels,
    forceReasoningEnabled: model?.forceReasoningEnabled ?? false,
    getDefaultModel,
  };
};

export default useModel;
