import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, TAGS } from '../theme';
import { longLabel, occursOn, uid } from '../dates';
import { Header, SectionTitle, Checkbox, Chip, Empty } from '../components';
import { useOnKeyboardShow } from '../keyboard';

export default function TodayScreen({ data, update, today, goTo }) {
  const [text, setText] = useState('');
  const [tag, setTag] = useState('Perso');
  const scrollRef = useRef(null);
  const addY = useRef(0);
  const typing = useRef(false);

  // Fait défiler l'écran pour que le champ de saisie reste visible au-dessus du clavier
  const showInput = () => {
    if (!typing.current || !scrollRef.current) return;
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTo({ y: Math.max(0, addY.current - 120), animated: true });
    }, 150);
  };
  useOnKeyboardShow(showInput);

  const tasks = data.daily[today] || [];
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const fajr = data.fajr[today];
  const rakat = data.qiyam[today];

  const planned = data.planned
    .filter((p) => occursOn(p, today))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const addTask = () => {
    const title = text.trim();
    if (!title) return;
    update((d) => {
      d.daily[today] = d.daily[today] || [];
      d.daily[today].push({ id: uid(), title, tag, done: false });
    });
    setText('');
  };

  const toggleTask = (id) =>
    update((d) => {
      const t = d.daily[today].find((x) => x.id === id);
      if (t) t.done = !t.done;
    });

  const deleteTask = (t) =>
    Alert.alert('Supprimer la tâche ?', t.title, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          update((d) => {
            d.daily[today] = d.daily[today].filter((x) => x.id !== t.id);
          }),
      },
    ]);

  const setFajr = (v) =>
    update((d) => {
      if (d.fajr[today] === v) delete d.fajr[today];
      else d.fajr[today] = v;
    });

  const changeRakat = (delta) =>
    update((d) => {
      const cur = d.qiyam[today];
      if (cur === undefined) {
        d.qiyam[today] = Math.max(0, delta);
      } else {
        d.qiyam[today] = Math.max(0, cur + delta);
      }
    });

  const togglePlanned = (id) =>
    update((d) => {
      const p = d.planned.find((x) => x.id === id);
      if (!p) return;
      p.doneDates = p.doneDates || [];
      p.doneDates = p.doneDates.includes(today)
        ? p.doneDates.filter((k) => k !== today)
        : [...p.doneDates, today];
    });

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Aujourd'hui"
        subtitle={longLabel(today)}
        color={C.teal}
        light={C.tealLight}
        right={
          <View style={st.pill}>
            <Text style={st.pillText}>
              {done}/{tasks.length} tâches
            </Text>
          </View>
        }
      >
        <View style={st.bar}>
          <View style={[st.barFill, { width: pct + '%' }]} />
        </View>
      </Header>

      <ScrollView ref={scrollRef} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
        {/* Prières du jour */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[st.prayerCard, { backgroundColor: C.amberBg, borderColor: C.amberBorder }]}>
            <View style={st.prayerHead}>
              <Ionicons name="partly-sunny-outline" size={20} color={C.amber} />
              <Text style={st.prayerTitle}>Al-Fajr</Text>
            </View>
            <Text style={st.prayerSub}>
              {fajr === 'fait' ? 'Noté : fait' : fajr === 'pas' ? 'Noté : pas fait' : 'Pas encore noté'}
            </Text>
            <Pressable
              onPress={() => setFajr('fait')}
              accessibilityRole="button"
              accessibilityState={{ selected: fajr === 'fait' }}
              style={[st.fajrBtn, fajr === 'fait' && { backgroundColor: C.teal, borderColor: C.teal }]}
            >
              <Ionicons name="checkmark" size={18} color={fajr === 'fait' ? C.white : C.ink} />
              <Text style={[st.fajrBtnText, fajr === 'fait' && { color: C.white }]}>Fait</Text>
            </Pressable>
            <Pressable
              onPress={() => setFajr('pas')}
              accessibilityRole="button"
              accessibilityState={{ selected: fajr === 'pas' }}
              style={[st.fajrBtn, fajr === 'pas' && { backgroundColor: C.pasBg, borderColor: C.pasBorder }]}
            >
              <Ionicons name="close" size={18} color={fajr === 'pas' ? C.pasText : C.ink} />
              <Text style={[st.fajrBtnText, fajr === 'pas' && { color: C.pasText }]}>Pas fait</Text>
            </Pressable>
          </View>

          <View style={[st.prayerCard, { backgroundColor: C.indigoBg, borderColor: C.indigoBorder }]}>
            <View style={st.prayerHead}>
              <Ionicons name="moon-outline" size={20} color={C.indigo} />
              <Text style={st.prayerTitle}>Qiyam al-Layl</Text>
            </View>
            <Text style={st.prayerSub}>
              {rakat === undefined ? 'Pas encore noté' : rakat === 0 ? 'Pas fait cette nuit' : 'Cette nuit'}
            </Text>
            <View style={st.stepper}>
              <Pressable
                onPress={() => changeRakat(-1)}
                style={st.stepMinus}
                accessibilityLabel="Retirer une rak'a"
              >
                <Ionicons name="remove" size={22} color={C.ink} />
              </Pressable>
              <View style={{ alignItems: 'center' }}>
                <Text style={st.rakat}>{rakat === undefined ? '–' : rakat}</Text>
                <Text style={st.rakatLabel}>rak'at</Text>
              </View>
              <Pressable
                onPress={() => changeRakat(1)}
                style={st.stepPlus}
                accessibilityLabel="Ajouter une rak'a"
              >
                <Ionicons name="add" size={22} color={C.white} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Tâches du jour */}
        <SectionTitle>Tâches du jour</SectionTitle>
        {tasks.length === 0 ? <Empty text="Aucune tâche pour aujourd'hui. Ajoute la première ci-dessous." /> : null}
        {tasks.map((t) => (
          <Pressable key={t.id} onLongPress={() => deleteTask(t)} style={st.taskRow}>
            <Checkbox done={t.done} onPress={() => toggleTask(t.id)} color={C.teal} label={t.title} />
            <Text style={[st.taskText, t.done && st.taskDone]}>{t.title}</Text>
            <View style={[st.tag, { backgroundColor: (TAGS[t.tag] || TAGS.Perso).bg }]}>
              <Text style={[st.tagText, { color: (TAGS[t.tag] || TAGS.Perso).fg }]}>{t.tag}</Text>
            </View>
          </Pressable>
        ))}

        <View style={st.addBox} onLayout={(e) => (addY.current = e.nativeEvent.layout.y)}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Object.keys(TAGS).map((k) => (
              <Chip key={k} small label={k} active={tag === k} color={TAGS[k].fg} onPress={() => setTag(k)} />
            ))}
          </View>
          <View style={st.addRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Ajouter une tâche…"
              placeholderTextColor={C.soft}
              style={st.addInput}
              returnKeyType="done"
              onSubmitEditing={addTask}
              submitBehavior="submit"
              onFocus={() => {
                typing.current = true;
                showInput();
              }}
              onBlur={() => (typing.current = false)}
              accessibilityLabel="Nouvelle tâche"
            />
            <Pressable onPress={addTask} style={st.addBtn} accessibilityLabel="Ajouter la tâche">
              <Ionicons name="add" size={24} color={C.white} />
            </Pressable>
          </View>
        </View>
        {tasks.length > 0 ? <Text style={st.hint}>Appui long sur une tâche pour la supprimer.</Text> : null}

        {/* Planifié aujourd'hui */}
        <SectionTitle
          right={
            <Pressable onPress={() => goTo('planning')} hitSlop={10}>
              <Text style={{ color: C.blue, fontWeight: '700', fontSize: 14 }}>Voir le planning</Text>
            </Pressable>
          }
        >
          Planifié aujourd'hui
        </SectionTitle>
        {planned.length === 0 ? (
          <Empty text="Rien de planifié aujourd'hui." />
        ) : (
          <View style={st.plannedBox}>
            {planned.map((p, i) => {
              const isDone = (p.doneDates || []).includes(today);
              return (
                <View key={p.id} style={[st.plannedRow, i > 0 && { borderTopWidth: 1, borderTopColor: C.blueBorder }]}>
                  <Checkbox done={isDone} onPress={() => togglePlanned(p.id)} color={C.blue} round label={p.title} />
                  <Text style={st.plannedTime}>{p.time || 'Journée'}</Text>
                  <Text style={[st.taskText, isDone && st.taskDone]}>{p.title}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  pill: { backgroundColor: C.yellow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 4 },
  pillText: { color: C.yellowInk, fontWeight: '800', fontSize: 13 },
  bar: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 999, backgroundColor: C.yellow },
  prayerCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  prayerHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prayerTitle: { fontSize: 15, fontWeight: '800', color: C.ink, flexShrink: 1 },
  prayerSub: { fontSize: 12, color: C.muted },
  fajrBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    backgroundColor: C.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fajrBtnText: { fontSize: 14, fontWeight: '700', color: C.ink },
  stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepMinus: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPlus: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rakat: { fontSize: 32, fontWeight: '800', color: C.indigo, lineHeight: 36 },
  rakatLabel: { fontSize: 11, color: C.muted },
  taskRow: {
    backgroundColor: C.white,
    borderRadius: 14,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 14,
    paddingLeft: 4,
    gap: 6,
    shadowColor: '#13202B',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  taskText: { flex: 1, fontSize: 15, color: C.ink },
  taskDone: { color: '#6B7680', textDecorationLine: 'line-through' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 11, fontWeight: '700' },
  addBox: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B7C0C8',
    padding: 10,
    gap: 10,
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addInput: { flex: 1, height: 44, fontSize: 15, color: C.ink, paddingHorizontal: 6 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 12, color: C.muted, marginTop: -6 },
  plannedBox: { backgroundColor: C.blueBg, borderWidth: 1, borderColor: C.blueBorder, borderRadius: 14 },
  plannedRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 14, paddingLeft: 4, minHeight: 54, gap: 6 },
  plannedTime: { width: 58, fontSize: 13, fontWeight: '800', color: C.blue },
});
