import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import {
  keyOf,
  parseKey,
  addDays,
  addDaysKey,
  startOfWeek,
  longLabel,
  shortLabel,
  monthLabel,
  occursOn,
  repeatLabel,
  REPEATS,
  JOURS_COURTS,
  normalizeTime,
  uid,
} from '../dates';
import { Header, Checkbox, Empty, Fab, Sheet, Field, PrimaryButton, DatePickerRow, Chip, SectionTitle } from '../components';

const byTime = (a, b) => (a.time || '').localeCompare(b.time || '');

export default function PlanningScreen({ data, update, today }) {
  const [selected, setSelected] = useState(today);
  const [weekStart, setWeekStart] = useState(keyOf(startOfWeek(parseKey(today))));
  const [edit, setEdit] = useState(null); // { id?, title, date, time, repeat }

  const week = Array.from({ length: 7 }, (_, i) => addDaysKey(weekStart, i));
  const itemsOf = (k) => data.planned.filter((p) => occursOn(p, k)).sort(byTime);
  const items = itemsOf(selected);

  // Les 7 jours suivants le jour choisi
  const upcoming = [];
  for (let i = 1; i <= 7; i++) {
    const k = addDaysKey(selected, i);
    itemsOf(k).forEach((p) => upcoming.push({ k, p }));
  }

  const moveWeek = (n) => {
    const nw = keyOf(addDays(parseKey(weekStart), 7 * n));
    setWeekStart(nw);
    setSelected(nw);
  };

  const goToday = () => {
    setSelected(today);
    setWeekStart(keyOf(startOfWeek(parseKey(today))));
  };

  const toggle = (id) =>
    update((d) => {
      const p = d.planned.find((x) => x.id === id);
      if (!p) return;
      p.doneDates = p.doneDates || [];
      p.doneDates = p.doneDates.includes(selected)
        ? p.doneDates.filter((k) => k !== selected)
        : [...p.doneDates, selected];
    });

  const remove = (p) =>
    Alert.alert(
      'Supprimer ?',
      p.repeat && p.repeat !== 'none' ? p.title + '\n(toutes les répétitions seront supprimées)' : p.title,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            update((d) => {
              d.planned = d.planned.filter((x) => x.id !== p.id);
            }),
        },
      ]
    );

  const save = () => {
    const title = edit.title.trim();
    if (!title) return;
    update((d) => {
      const values = { title, date: edit.date, time: normalizeTime(edit.time), repeat: edit.repeat };
      if (edit.id) {
        const p = d.planned.find((x) => x.id === edit.id);
        if (p) Object.assign(p, values);
      } else {
        d.planned.push({ id: uid(), doneDates: [], ...values });
      }
    });
    const sel = edit.date;
    setEdit(null);
    setSelected(sel);
    setWeekStart(keyOf(startOfWeek(parseKey(sel))));
  };

  const ws = parseKey(weekStart);

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Planning"
        subtitle={monthLabel(ws.getFullYear(), ws.getMonth())}
        color={C.blue}
        light={C.blueLight}
        right={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable onPress={() => moveWeek(-1)} style={st.navBtn} accessibilityLabel="Semaine précédente">
              <Ionicons name="chevron-back" size={20} color={C.white} />
            </Pressable>
            <Pressable onPress={() => moveWeek(1)} style={st.navBtn} accessibilityLabel="Semaine suivante">
              <Ionicons name="chevron-forward" size={20} color={C.white} />
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={st.content}>
        <View style={st.week}>
          {week.map((k) => {
            const d = parseKey(k);
            const on = k === selected;
            const isToday = k === today;
            const has = itemsOf(k).length > 0;
            return (
              <Pressable
                key={k}
                onPress={() => setSelected(k)}
                accessibilityLabel={longLabel(k)}
                accessibilityState={{ selected: on }}
                style={[st.day, on ? st.dayOn : isToday ? st.dayToday : null]}
              >
                <Text style={[st.dow, on && { color: C.white }]}>{JOURS_COURTS[d.getDay()]}</Text>
                <Text style={[st.num, on && { color: C.white }, !on && isToday && { color: '#1E3A8A' }]}>{d.getDate()}</Text>
                <View style={[st.dot, { backgroundColor: has ? (on ? C.yellow : C.amberDot) : 'transparent' }]} />
              </Pressable>
            );
          })}
        </View>

        <SectionTitle
          right={
            selected !== today ? (
              <Pressable onPress={goToday} hitSlop={10}>
                <Text style={{ color: C.blue, fontWeight: '700' }}>Aujourd'hui</Text>
              </Pressable>
            ) : null
          }
        >
          {(selected === today ? "Aujourd'hui — " : '') + longLabel(selected)}
        </SectionTitle>

        {items.length === 0 ? <Empty text="Rien de prévu ce jour-là." /> : null}
        {items.map((p) => {
          const isDone = (p.doneDates || []).includes(selected);
          const rep = repeatLabel(p.repeat);
          return (
            <Pressable
              key={p.id}
              onPress={() => setEdit({ ...p })}
              onLongPress={() => remove(p)}
              style={st.item}
            >
              <Checkbox done={isDone} round color={C.blue} onPress={() => toggle(p.id)} label={p.title} />
              <Text style={st.time}>{p.time || 'Journée'}</Text>
              <View style={st.stripe} />
              <View style={{ flex: 1, gap: 3, paddingVertical: 12 }}>
                <Text style={[st.title, isDone && st.done]}>{p.title}</Text>
                {rep ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="repeat" size={14} color={C.muted} />
                    <Text style={st.rep}>{rep}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}

        {upcoming.length > 0 ? (
          <>
            <SectionTitle>À venir (7 jours)</SectionTitle>
            <View style={st.upBox}>
              {upcoming.slice(0, 12).map(({ k, p }, i) => (
                <Pressable
                  key={p.id + k}
                  onPress={() => {
                    setSelected(k);
                    setWeekStart(keyOf(startOfWeek(parseKey(k))));
                  }}
                  style={[st.upRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#FED7AA' }]}
                >
                  <Text style={st.upDay}>{shortLabel(k)}</Text>
                  <Text style={st.upTime}>{p.time}</Text>
                  <Text style={[st.title, { flex: 1 }]}>{p.title}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
        <Text style={st.hint}>Touche une tâche pour la modifier, appui long pour la supprimer.</Text>
      </ScrollView>

      <Fab
        color={C.blue}
        label="Planifier une tâche"
        onPress={() => setEdit({ title: '', date: selected, time: '', repeat: 'none' })}
      />

      <Sheet visible={!!edit} onClose={() => setEdit(null)} title={edit && edit.id ? 'Modifier' : 'Planifier une tâche'}>
        {edit ? (
          <>
            <Field label="Titre" value={edit.title} onChangeText={(v) => setEdit({ ...edit, title: v })} placeholder="Ex. : rendez-vous chez le médecin" autoFocus={!edit.id} />
            <DatePickerRow value={edit.date} onChange={(v) => setEdit({ ...edit, date: v })} />
            <Field
              label="Heure (facultatif, ex. 14:30)"
              value={edit.time}
              onChangeText={(v) => setEdit({ ...edit, time: v })}
              placeholder="HH:MM"
              keyboardType="numbers-and-punctuation"
            />
            <View style={{ gap: 6 }}>
              <Text style={st.label}>Répéter</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {REPEATS.map((r) => (
                  <Chip key={r.id} small label={r.label} active={edit.repeat === r.id} color={C.blue} onPress={() => setEdit({ ...edit, repeat: r.id })} />
                ))}
              </View>
            </View>
            <PrimaryButton label="Enregistrer" color={C.blue} onPress={save} disabled={!edit.title.trim()} />
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 110 },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: { flexDirection: 'row', backgroundColor: C.white, borderRadius: 16, padding: 8, gap: 4 },
  day: {
    flex: 1,
    minHeight: 66,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayOn: { backgroundColor: C.blue, borderColor: C.blue },
  dayToday: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
  dow: { fontSize: 11, fontWeight: '600', color: C.muted },
  num: { fontSize: 17, fontWeight: '800', color: C.ink },
  dot: { width: 6, height: 6, borderRadius: 3 },
  item: {
    backgroundColor: C.white,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 14,
    gap: 6,
    shadowColor: '#13202B',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  time: { width: 58, fontSize: 13, fontWeight: '800', color: C.blue },
  stripe: { width: 3, alignSelf: 'stretch', marginVertical: 10, borderRadius: 2, backgroundColor: C.amberDot },
  title: { fontSize: 15, fontWeight: '600', color: C.ink },
  done: { color: '#6B7680', textDecorationLine: 'line-through' },
  rep: { fontSize: 12, color: C.muted },
  upBox: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 14 },
  upRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  upDay: { width: 56, fontSize: 12, fontWeight: '800', color: C.amber },
  upTime: { width: 44, fontSize: 12, fontWeight: '700', color: C.muted },
  hint: { fontSize: 12, color: C.muted },
  label: { fontSize: 13, fontWeight: '600', color: C.muted },
});
