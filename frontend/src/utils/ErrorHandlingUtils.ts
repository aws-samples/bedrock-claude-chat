export const ErrorPattern = {
  validation: 'validation',
  sync: 'sync',
};

export type TErrorPattern = keyof typeof ErrorPattern;

export type ValidationError = {
  type: 'validation';
  message: string;
};

export type SyncError = {
  type: 'sync';
  message: string;
};

export const valicationErrorFunctor = (message: string): ValidationError => ({
  type: 'validation',
  message,
});

export const syncErrorFunctor = (message: string): SyncError => ({
  type: 'sync',
  message,
});

export type SystemError = ValidationError | SyncError;

export const fuctorOfError = (
  type: TErrorPattern,
  message: string
): SystemError => {
  switch (type) {
    case 'validation':
      return valicationErrorFunctor(message);
    case 'sync':
      return syncErrorFunctor(message);
    default:
      throw new Error('invalid error type');
  }
};
