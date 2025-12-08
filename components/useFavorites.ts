"use client";

import { useEffect, useMemo, useState } from "react";

const KEY = "bhh_favorites_v1";

export function useFavorites() {
  const [set, setSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const arr = JSON.parse(raw) as string[];
      setSet(new Set(arr));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }, [set]);

  const api = useMemo(() => {
    return {
      has: (id: string) => set.has(id),
      toggle: (id: string) =>
        setSet((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
      clear: () => setSet(new Set()),
    };
  }, [set]);

  return api;
}
