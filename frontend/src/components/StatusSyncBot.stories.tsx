import { SyncStatus } from '../constants';
import StatusSyncBot from './StatusSyncBot';

export const QUEUED = () => <StatusSyncBot syncStatus={SyncStatus.QUEUED} />;

export const FAILED = () => <StatusSyncBot syncStatus={SyncStatus.FAILED} />;

export const RUNNING = () => <StatusSyncBot syncStatus={SyncStatus.RUNNING} />;

export const SUCCEEDED = () => (
  <StatusSyncBot syncStatus={SyncStatus.SUCCEEDED} />
);
