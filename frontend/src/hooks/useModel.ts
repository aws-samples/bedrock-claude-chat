import { create } from 'zustand';
import { Model } from '../@types/conversation';
import { useMemo } from 'react';

const availableModels: {
  modelId: Model;
  label: string;
  supportMediaType: string[];
}[] = [
  {
    modelId: 'claude-instant-v1',
    label: 'Claude Instant',
    supportMediaType: [],
  },
  {
    modelId: 'claude-v2',
    label: 'Claude v2',
    supportMediaType: [],
  },
  {
    modelId: 'claude-v3-sonnet',
    label: 'Claude v3',
    supportMediaType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
];

const useModelState = create<{
  modelId: Model;
  setModelId: (m: Model) => void;
}>((set) => ({
  modelId: 'claude-instant-v1',
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
      model?.supportMediaType.map(
        (mediaType) => `.${mediaType.split('/')[1]}`
      ) ?? [],
    availableModels,
  };
};

export default useModel;
