import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store. During SSR and hydration the initial value is used,
 * so server and first client render match.
 */
export function createLocalStore<T>(key: string, initial: T) {
  const listeners = new Set<() => void>();
  let cache: T | undefined;

  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      cache = initial;
    }
    return cache;
  };

  const write = (value: T) => {
    cache = value;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable: keep the in-memory value
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };

  return function useLocalStore() {
    const value = useSyncExternalStore(subscribe, read, () => initial);
    const set = useCallback((next: T | ((prev: T) => T)) => {
      const prev = read();
      write(typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    }, []);
    return [value, set] as const;
  };
}

const EMPTY: string[] = [];
const useBlockedStore = createLocalStore<string[]>("pulmoforge.blocked", EMPTY);
const useReportedStore = createLocalStore<string[]>("pulmoforge.reported", EMPTY);

function useNumberSet(useStore: typeof useBlockedStore) {
  const [list, setList] = useStore();
  const has = useCallback((n: string) => list.includes(n), [list]);
  const toggle = useCallback(
    (n: string) => setList((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n])),
    [setList],
  );
  return { list, has, toggle };
}

export const useBlocked = () => useNumberSet(useBlockedStore);
export const useReported = () => useNumberSet(useReportedStore);

export type ProtectionSettings = {
  blockFraud: boolean;
  warnSpam: boolean;
  aiScreening: boolean;
  deepfakeAlerts: boolean;
  silenceUnknown: boolean;
};

export const useSettings = createLocalStore<ProtectionSettings>("pulmoforge.settings", {
  blockFraud: true,
  warnSpam: true,
  aiScreening: true,
  deepfakeAlerts: true,
  silenceUnknown: false,
});
