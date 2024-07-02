import StatusSyncBot from './StatusSyncBot';

export const QUEUED = () => <StatusSyncBot syncStatus="QUEUED" />;

export const FAILED = () => <StatusSyncBot syncStatus="FAILED" />;

export const RUNNING = () => <StatusSyncBot syncStatus="RUNNING" />;

export const SUCCEEDED = () => <StatusSyncBot syncStatus="SUCCEEDED" />;
