import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, BackHandler, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { longLabel } from '../dates';
import { Header, Empty } from '../components';

const KINDS = {
  jour: { label: 'Jour', bg: '#DDF1EE', fg: '#0B5A54' },
  importante: { label: 'Importante', bg: '#FFE4D2', fg: '#9A3412' },
  planifiee: { label: 'Planifiée', bg: '#DBE6FF', fg: '#1E40AF' },
};
const UNKNOWN = 'inconnue';
const PAGE = 30; // nombre de jours affichés à la fois

// Rassemble toutes les tâches terminées, groupées par jour (le plus récent en haut)
export function buildHistory(data) {
  const byDay = {};
  const add = (k, item) => {
    (byDay[k] = byDay[k] || []).push(item);
  };

  Object.keys(data.daily).forEach((k) => {
    data.daily[k].forEach((t) => {
      if (t.done) add(k, { id: 'd' + t.id + k, title: t.title, kind: 'jour', extra: t.tag });
    });
  });
  data.planned.forEach((p) => {
    (p.doneDates || []).forEach((k) => {
      add(k, { id: 'p' + p.id + k, title: p.title, kind: 'planifiee', extra: p.time });
    });
  });
  data.important.forEach((t) => {
    if (t.done) add(t.doneAt || UNKNOWN, { id: 'i' + t.id, title: t.title, kind: 'importante' });
  });

  const days = Object.keys(byDay)
    .filter((k) => k !== UNKNOWN)
    .sort()
    .reverse()
    .map((k) => ({ k, label: longLabel(k), items: byDay[k] }));
  if (byDay[UNKNOWN]) days.push({ k: UNKNOWN, label: 'Date inconnue', items: byDay[UNKNOWN] });
  return days;
}

export default function HistoryScreen({ data, today, onClose }) {
  const [count, setCount] = useState(PAGE);
  const days = buildHistory(data);
  const total = days.reduce((a, d) => a + d.items.length, 0);

  // Le bouton « retour » d'Android ferme l'historique
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Historique"
        subtitle={total + (total > 1 ? ' tâches terminées' : ' tâche terminée')}
        color={C.teal}
        light={C.tealLight}
        right={
          <Pressable onPress={onClose} style={st.back} accessibilityLabel="Retour">
            <Ionicons name="close" size={24} color={C.white} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={st.content}>
        {days.length === 0 ? <Empty text="Aucune tâche terminée pour le moment." /> : null}
        {days.slice(0, count).map((d) => (
          <View key={d.k} style={{ gap: 8 }}>
            <View style={st.dayHead}>
              <Text style={st.dayTitle}>{d.k === today ? "Aujourd'hui — " + d.label : d.label}</Text>
              <Text style={st.dayCount}>
                {d.items.length} {d.items.length > 1 ? 'tâches' : 'tâche'}
              </Text>
            </View>
            <View style={st.box}>
              {d.items.map((it, i) => {
                const kind = KINDS[it.kind];
                return (
                  <View key={it.id} style={[st.row, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
                    <Ionicons name="checkmark-circle" size={22} color={C.teal} />
                    <Text style={st.title}>{it.title}</Text>
                    <View style={[st.badge, { backgroundColor: kind.bg }]}>
                      <Text style={[st.badgeText, { color: kind.fg }]}>{kind.label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        {days.length > count ? (
          <Pressable onPress={() => setCount(count + PAGE)} style={st.more}>
            <Text style={st.moreText}>Voir les jours plus anciens</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  content: { padding: 20, gap: 18, paddingBottom: 40 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  dayTitle: { fontSize: 16, fontWeight: '800', color: C.ink, flexShrink: 1 },
  dayCount: { fontSize: 13, color: C.muted, fontWeight: '600' },
  box: { backgroundColor: C.white, borderRadius: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, minHeight: 52, paddingVertical: 10 },
  title: { flex: 1, fontSize: 15, color: C.ink },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  more: { height: 48, borderRadius: 14, borderWidth: 1, borderColor: C.teal, alignItems: 'center', justifyContent: 'center' },
  moreText: { color: C.teal, fontWeight: '700', fontSize: 15 },
});
