import { useSyncExternalStore } from "react";
import type { Deal, HistoryEntry, TrackedDeal } from "./types";

type State = {
  favorites: Deal[];
  compare: Deal[];
  tracking: TrackedDeal[];
  history: HistoryEntry[];
};

const KEY = "rbxdeals:v1";
const initial: State = { favorites: [], compare: [], tracking: [], history: [] };

let state: State = initial;
const listeners = new Set<() => void>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {}
}
load();

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const empty: State = initial;
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(empty),
  );
}

export const store = {
  toggleFavorite(deal: Deal) {
    set((s) => {
      const exists = s.favorites.some((d) => d.id === deal.id);
      return {
        ...s,
        favorites: exists
          ? s.favorites.filter((d) => d.id !== deal.id)
          : [deal, ...s.favorites],
      };
    });
  },
  removeFavorite(id: string) {
    set((s) => ({ ...s, favorites: s.favorites.filter((d) => d.id !== id) }));
  },
  toggleCompare(deal: Deal) {
    set((s) => {
      const exists = s.compare.some((d) => d.id === deal.id);
      return {
        ...s,
        compare: exists
          ? s.compare.filter((d) => d.id !== deal.id)
          : [deal, ...s.compare],
      };
    });
  },
  removeCompare(id: string) {
    set((s) => ({ ...s, compare: s.compare.filter((d) => d.id !== id) }));
  },
  clearCompare() {
    set((s) => ({ ...s, compare: [] }));
  },
  toggleTrack(deal: Deal) {
    set((s) => {
      const exists = s.tracking.some((d) => d.id === deal.id);
      if (exists) {
        return { ...s, tracking: s.tracking.filter((d) => d.id !== deal.id) };
      }
      const tracked: TrackedDeal = {
        ...deal,
        addedAt: Date.now(),
        lastCheckedAt: Date.now(),
        active: true,
        status: "pending",
      };
      return { ...s, tracking: [tracked, ...s.tracking] };
    });
  },
  setTrackActive(id: string, active: boolean) {
    set((s) => ({
      ...s,
      tracking: s.tracking.map((d) => (d.id === id ? { ...d, active } : d)),
    }));
  },
  removeTrack(id: string) {
    set((s) => ({ ...s, tracking: s.tracking.filter((d) => d.id !== id) }));
  },
  addHistory(query: string) {
    const q = query.trim();
    if (!q) return;
    set((s) => ({
      ...s,
      history: [{ query: q, at: Date.now() }, ...s.history.filter((h) => h.query.toLowerCase() !== q.toLowerCase())].slice(0, 20),
    }));
  },
  clearHistory() {
    set((s) => ({ ...s, history: [] }));
  },
};
