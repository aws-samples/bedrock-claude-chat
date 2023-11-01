import { create } from 'zustand';
import { Model } from '../@types/conversation';

const useBedrockModelState = create<{
  model: Model;
  setModel: (model: Model) => void;
}>((set) => {
  return {
    model: 'claude-v2',
    setModel: (model) => {
      set(() => ({
        model,
      }));
    },
  };
});

const useBedrockModel = () => {
  const [model, setModel] = useBedrockModelState((state) => [
    state.model,
    state.setModel,
  ]);

  return {
    model,
    setModel,
  };
};

export default useBedrockModel;
