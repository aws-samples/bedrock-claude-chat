import { create } from 'zustand';

const useSnackbarState = create<{
  isOpen: boolean;
  message: string;
  open: (message: string) => void;
  close: () => void;
}>((set) => {
  return {
    isOpen: false,
    message: '',
    open: (message) => {
      set(() => ({
        isOpen: true,
        message,
      }));
    },
    close: () => {
      set(() => ({
        isOpen: false,
      }));
    },
  };
});

const useSnackbar = () => {
  const { open, close, isOpen, message } = useSnackbarState();

  return {
    open,
    close,
    isOpen,
    message,
  };
};
export default useSnackbar;
