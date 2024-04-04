import { produce } from 'immer';
import { create } from 'zustand';

const useErrorMessageState = create<{
  errorMessages: Record<string, string>;
  setErrorMessage: (key: string, message: string) => void;
  clear: (key: string) => void;
  clearAll: () => void;
}>((set, get) => {
  return {
    errorMessages: {},
    setErrorMessage: (key, message) => {
      set({
        errorMessages: produce(get().errorMessages, (draft) => {
          draft[key] = message;
        }),
      });
    },
    clear: (key) => {
      set({
        errorMessages: produce(get().errorMessages, (draft) => {
          delete draft[key];
        }),
      });
    },
    clearAll: () => {
      set({
        errorMessages: {},
      });
    },
  };
});

const useErrorMessage = () => {
  const { errorMessages, setErrorMessage, clear, clearAll } =
    useErrorMessageState();
  return {
    hasError: Object.keys(errorMessages).length > 0,
    errorMessages,
    setErrorMessage,
    clear,
    clearAll,
  };
};

export default useErrorMessage;
