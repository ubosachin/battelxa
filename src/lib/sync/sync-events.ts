"use client";

export type SyncEventType =
  | "ORGANIZER_APPLICATION_SUBMITTED"
  | "ORGANIZER_STATUS_CHANGED"
  | "USER_ROLE_UPDATED"
  | "AUTH_SESSION_CHANGED"
  | "NOTIFICATION_ARRIVED";

export interface SyncPayload {
  type: SyncEventType;
  userId?: string;
  orgId?: string;
  status?: string;
  timestamp: number;
}

const CHANNEL_NAME = "battlexa_live_sync_bus";

/**
 * Broadcast an event to all open browser tabs and windows instantly
 */
export function emitSyncEvent(type: SyncEventType, extra?: Partial<SyncPayload>) {
  if (typeof window === "undefined") return;

  const payload: SyncPayload = {
    type,
    timestamp: Date.now(),
    ...extra,
  };

  try {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();
    }
  } catch (e) {
    // Ignore channel errors
  }

  try {
    // Also use localStorage storage event as bulletproof cross-tab fallback
    localStorage.setItem(
      CHANNEL_NAME,
      JSON.stringify({ ...payload, _rnd: Math.random() })
    );
  } catch (e) {
    // Ignore storage errors (e.g. incognito quota)
  }
}

/**
 * Register a listener for real-time cross-tab sync events
 */
export function subscribeToSyncEvents(
  callback: (payload: SyncPayload) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  let channel: BroadcastChannel | null = null;

  try {
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data && event.data.type) {
          callback(event.data as SyncPayload);
        }
      };
    }
  } catch (e) {
    channel = null;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === CHANNEL_NAME && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (data && data.type) {
          callback(data as SyncPayload);
        }
      } catch {
        // Ignore json parse error
      }
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    if (channel) {
      try {
        channel.close();
      } catch {
        // ignore
      }
    }
    window.removeEventListener("storage", handleStorage);
  };
}
