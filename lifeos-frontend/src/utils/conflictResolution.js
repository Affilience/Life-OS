/**
 * Conflict Resolution Utility
 *
 * Handles data conflicts when the same record is edited on multiple devices.
 * Uses a "last write wins" strategy by default, with optional merge strategies.
 */

/**
 * Resolution strategies
 */
export const RESOLUTION_STRATEGIES = {
  LAST_WRITE_WINS: 'last_write_wins',  // Most recent update wins (default)
  LOCAL_WINS: 'local_wins',            // Local version always wins
  REMOTE_WINS: 'remote_wins',          // Server version always wins
  MERGE: 'merge',                      // Attempt to merge changes
  ASK_USER: 'ask_user',                // Prompt user to choose
};

/**
 * Compare two versions of a record and determine if there's a conflict
 */
export function detectConflict(localRecord, remoteRecord) {
  if (!localRecord || !remoteRecord) return false;

  // Compare updated_at timestamps
  const localTime = new Date(localRecord.updated_at || localRecord.created_at || 0).getTime();
  const remoteTime = new Date(remoteRecord.updated_at || remoteRecord.created_at || 0).getTime();

  // If timestamps are different and both are after last sync, it's a conflict
  // For simplicity, we consider it a conflict if they were updated within 5 seconds of each other
  const timeDiff = Math.abs(localTime - remoteTime);
  const CONFLICT_THRESHOLD = 5000; // 5 seconds

  return timeDiff < CONFLICT_THRESHOLD && localTime !== remoteTime;
}

/**
 * Resolve a conflict between local and remote versions
 */
export function resolveConflict(localRecord, remoteRecord, strategy = RESOLUTION_STRATEGIES.LAST_WRITE_WINS) {
  if (!detectConflict(localRecord, remoteRecord)) {
    // No conflict - return the most recent one
    const localTime = new Date(localRecord?.updated_at || 0).getTime();
    const remoteTime = new Date(remoteRecord?.updated_at || 0).getTime();
    return localTime > remoteTime ? localRecord : remoteRecord;
  }

  switch (strategy) {
    case RESOLUTION_STRATEGIES.LAST_WRITE_WINS: {
      const localTime = new Date(localRecord.updated_at || 0).getTime();
      const remoteTime = new Date(remoteRecord.updated_at || 0).getTime();
      return localTime > remoteTime ? localRecord : remoteRecord;
    }

    case RESOLUTION_STRATEGIES.LOCAL_WINS:
      return localRecord;

    case RESOLUTION_STRATEGIES.REMOTE_WINS:
      return remoteRecord;

    case RESOLUTION_STRATEGIES.MERGE:
      return mergeRecords(localRecord, remoteRecord);

    case RESOLUTION_STRATEGIES.ASK_USER:
      // Return both and let the UI handle it
      return {
        conflict: true,
        local: localRecord,
        remote: remoteRecord,
      };

    default:
      // Default to last write wins
      const localTime = new Date(localRecord.updated_at || 0).getTime();
      const remoteTime = new Date(remoteRecord.updated_at || 0).getTime();
      return localTime > remoteTime ? localRecord : remoteRecord;
  }
}

/**
 * Attempt to merge two records
 * This is a simple field-level merge that takes the most recent value for each field
 */
export function mergeRecords(localRecord, remoteRecord) {
  const merged = { ...remoteRecord };

  // Fields that should always use the most recent value
  const timestampFields = ['updated_at', 'created_at', 'synced_at'];
  const idFields = ['id', 'user_id'];

  for (const [key, localValue] of Object.entries(localRecord)) {
    // Skip timestamp and ID fields
    if (timestampFields.includes(key) || idFields.includes(key)) continue;

    const remoteValue = remoteRecord[key];

    // If local has a value and remote doesn't, use local
    if (localValue !== undefined && remoteValue === undefined) {
      merged[key] = localValue;
      continue;
    }

    // If values are arrays, merge them (remove duplicates)
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      merged[key] = [...new Set([...remoteValue, ...localValue])];
      continue;
    }

    // If values are objects (but not arrays), recursively merge
    if (
      typeof localValue === 'object' &&
      typeof remoteValue === 'object' &&
      localValue !== null &&
      remoteValue !== null &&
      !Array.isArray(localValue)
    ) {
      merged[key] = mergeRecords(localValue, remoteValue);
      continue;
    }

    // For primitive values, use the local value if it's different
    // (assumes local is the more recent edit)
    if (localValue !== remoteValue) {
      merged[key] = localValue;
    }
  }

  // Update the timestamp
  merged.updated_at = new Date().toISOString();

  return merged;
}

/**
 * Batch conflict resolution for arrays of records
 */
export function resolveConflicts(localRecords, remoteRecords, strategy = RESOLUTION_STRATEGIES.LAST_WRITE_WINS) {
  const localMap = new Map(localRecords.map(r => [r.id, r]));
  const remoteMap = new Map(remoteRecords.map(r => [r.id, r]));

  const resolved = [];
  const conflicts = [];

  // Process all records
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

  for (const id of allIds) {
    const local = localMap.get(id);
    const remote = remoteMap.get(id);

    if (!local) {
      // Only exists remotely
      resolved.push(remote);
    } else if (!remote) {
      // Only exists locally
      resolved.push(local);
    } else {
      // Exists in both - resolve conflict
      const result = resolveConflict(local, remote, strategy);

      if (result.conflict) {
        conflicts.push(result);
      } else {
        resolved.push(result);
      }
    }
  }

  return { resolved, conflicts };
}

/**
 * Create a versioned record (adds version tracking)
 */
export function createVersionedRecord(record) {
  return {
    ...record,
    _version: (record._version || 0) + 1,
    _lastModified: new Date().toISOString(),
    _deviceId: getDeviceId(),
  };
}

/**
 * Get a unique device identifier (stored in localStorage)
 */
function getDeviceId() {
  let deviceId = localStorage.getItem('lifeos_device_id');

  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('lifeos_device_id', deviceId);
  }

  return deviceId;
}

/**
 * Track sync state for optimistic updates
 */
export class SyncTracker {
  constructor(storeName) {
    this.storeName = storeName;
    this.pendingChanges = new Map();
    this.syncedAt = null;
  }

  /**
   * Mark a record as pending sync
   */
  markPending(id, change) {
    this.pendingChanges.set(id, {
      ...change,
      timestamp: Date.now(),
      retries: 0,
    });
  }

  /**
   * Mark a record as synced
   */
  markSynced(id) {
    this.pendingChanges.delete(id);
    this.syncedAt = Date.now();
  }

  /**
   * Mark sync as failed and increment retry count
   */
  markFailed(id) {
    const pending = this.pendingChanges.get(id);
    if (pending) {
      pending.retries += 1;
      pending.lastError = Date.now();
    }
  }

  /**
   * Get all pending changes
   */
  getPendingChanges() {
    return Array.from(this.pendingChanges.entries());
  }

  /**
   * Check if there are pending changes
   */
  hasPendingChanges() {
    return this.pendingChanges.size > 0;
  }

  /**
   * Get records that need retry (failed but under retry limit)
   */
  getRetryQueue(maxRetries = 3) {
    return Array.from(this.pendingChanges.entries())
      .filter(([_, change]) => change.retries < maxRetries)
      .map(([id, change]) => ({ id, ...change }));
  }
}

export default {
  RESOLUTION_STRATEGIES,
  detectConflict,
  resolveConflict,
  resolveConflicts,
  mergeRecords,
  createVersionedRecord,
  SyncTracker,
};
