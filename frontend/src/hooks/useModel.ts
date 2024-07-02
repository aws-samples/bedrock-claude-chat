import { create } from 'zustand';
import { Model } from '../@types/conversation';
import { useMemo } from 'react';

const MISTRAL_ENABLED: boolean = import.meta.env.VITE_APP_ENABLE_MISTRAL === 'true';
const availableModels: {
  modelId: Model;
  label: string;
  supportMediaType: string[];
}[] = !MISTRAL_ENABLED ? [
  {
    modelId: 'claude-v3-haiku',
    label: 'Claude 3 (Haiku)',
    supportMediaType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  {
    modelId: 'claude-v3-sonnet',
    label: 'Claude 3 (Sonnet)',
    supportMediaType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  {
    modelId: 'claude-v3.5-sonnet',
    label: 'Claude 3.5 (Sonnet)',
    supportMediaType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  {
    modelId: 'claude-v3-opus',
    label: 'Claude 3 (Opus)',
    supportMediaType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
] : [
    {
      modelId: 'mistral-7b-instruct',
      label: 'Mistral 7B',
      supportMediaType: [],
    },
    {
      modelId: 'mixtral-8x7b-instruct',
      label: 'Mixtral-8x7B',
      supportMediaType: [],
    },
    {
      modelId: 'mistral-large',
      label: 'Mistral Large',
      supportMediaType: [],
    },
  ]

const useModelState = create<{
  modelId: Model;
  setModelId: (m: Model) => void;
}>((set) => ({
  modelId: 'claude-v3-haiku',
  setModelId: (m) => {
    set({
      modelId: m,
    });
  },
}));

const useModel = () => {
  const { modelId, setModelId } = useModelState();

  const model = useMemo(() => {
    return availableModels.find((model) => model.modelId === modelId);
  }, [modelId]);

  return {
    modelId,
    setModelId,
    model,
    disabledImageUpload: (model?.supportMediaType.length ?? 0) === 0,
    acceptMediaType:
      model?.supportMediaType.flatMap((mediaType) => {
        const ext = mediaType.split('/')[1];
        return ext === 'jpeg' ? ['.jpg', '.jpeg'] : [`.${ext}`];
      }) ?? [],
    availableModels,
  };
};

export default useModel;
