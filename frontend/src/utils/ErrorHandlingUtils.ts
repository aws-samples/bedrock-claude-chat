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

export const isChunkValidationError = (syncErrorMessage: string) => {
  const pattern =
    /Got a larger chunk overlap \(\d+\) than chunk size \(\d+\), should be smaller\./;
  return pattern.test(syncErrorMessage);
};

export const isSyncError = (errorRecord: SystemError) => {
  return errorRecord.type === 'sync';
};

export const userTypeguardOfSyncError = (
  args: SystemError
): args is SyncError => {
  return isSyncError(args);
};

export type SystemError = ValidationError | SyncError;

export const functorOfSyncError = (syncStatusReason: string): TErrorPattern => {
  switch (true) {
    case isChunkValidationError(syncStatusReason):
      return 'validation';
    default:
      return 'sync';
  }
};

export const functorOfError = (
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
