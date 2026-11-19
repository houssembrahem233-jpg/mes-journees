// Sauvegarde des données sur le téléphone (AsyncStorage)
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayKey } from './dates';

const KEY = 'mes-journees-v1';

export const EMPTY = {
  daily: {}, // { "2026-11-19": [{ id, title, tag, done }] }
  important: [], // [{ id, title, note, prio, done }]
  planned: [], // [{ id, title, date, time, repeat, doneDates: [] }]
  fajr: {}, // { "2026-11-19": "fait" | "pas" }
  qiyam: {}, // { "2026-11-19": 4 }
};

// Le premier jour où on ouvre l'application, les tâches du jour
// non terminées de la veille (ou du dernier jour utilisé) sont reportées.
export function ensureToday(data, today) {
  if (data.daily[today]) return data;
  const previous = Object.keys(data.daily)
    .filter((k) => k < today)
    .sort()
    .pop();
  const carried = previous
    ? data.daily[previous]
        .filter((t) => !t.done && !t.carried)
        .map((t) => ({ ...t, id: t.id + '-r', carried: false }))
    : [];
  const next = { ...data, daily: { ...data.daily, [today]: carried } };
  if (previous && carried.length) {
    // On marque les tâches d'origine comme "reportées" pour ne pas les reporter deux fois
    next.daily[previous] = data.daily[previous].map((t) =>
      !t.done ? { ...t, carried: true } : t
    );
  }
  return next;
}

export function useStore() {
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const saved = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
        setData(ensureToday(saved, todayKey()));
      } catch (e) {
        setData(ensureToday(EMPTY, todayKey()));
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  // update(d => { ...modifier d... }) : d est une copie, on peut la modifier librement
  const update = useCallback((fn) => {
    setData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const res = fn(copy);
      return res || copy;
    });
  }, []);

  const refreshDay = useCallback((today) => {
    setData((prev) => ensureToday(prev, today));
  }, []);

  return { data, update, ready, refreshDay };
}
