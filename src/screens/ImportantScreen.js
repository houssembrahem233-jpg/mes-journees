import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, PRIO } from '../theme';
import { uid, normalizeTime } from '../dates';
import { Header, Chip, Checkbox, Empty, Fab, Sheet, Field, PrimaryButton, DatePickerRow, SectionTitle } from '../components';

const FILTERS = [
  { id: 'toutes', label: 'Toutes' },
  { id: 'haute', label: 'Haute' },
  { id: 'moyenne', label: 'Moyenne' },
  { id: 'basse', label: 'Basse' },
];
const ORDER = { haute: 0, moyenne: 1, basse: 2 };

export default function ImportantScreen({ data, update, today }) {
  const [filter, setFilter] = useState('toutes');
  const [showDone, setShowDone] = useState(false);

  // Fenêtre ajout / modification
  const [edit, setEdit] = useState(null); // { id?, title, note, prio }
  // Fenêtre "planifier"
  const [plan, setPlan] = useState(null); // { task, date, time }

  const open = data.important
    .filter((t) => !t.done && (filter === 'toutes' || t.prio === filter))
    .sort((a, b) => ORDER[a.prio] - ORDER[b.prio]);
  const finished = data.important.filter((t) => t.done);

  const save = () => {
    const title = edit.title.trim();
    if (!title) return;
    update((d) => {
      if (edit.id) {
        const t = d.important.find((x) => x.id === edit.id);
        if (t) Object.assign(t, { title, note: edit.note.trim(), prio: edit.prio });
      } else {
        d.important.push({ id: uid(), title, note: edit.note.trim(), prio: edit.prio, done: false });
      }
    });
    setEdit(null);
  };

  const toggle = (id) =>
    update((d) => {
      const t = d.important.find((x) => x.id === id);
      if (t) t.done = !t.done;
    });

  const remove = (t) =>
    Alert.alert('Supprimer la tâche ?', t.title, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          update((d) => {
            d.important = d.important.filter((x) => x.id !== t.id);
          }),
      },
    ]);

  // Planifier : la tâche passe dans le planning, à la date choisie
  const confirmPlan = () => {
    const { task, date, time } = plan;
    update((d) => {
      d.planned.push({
        id: uid(),
        title: task.title,
        date,
        time: normalizeTime(time),
        repeat: 'none',
        doneDates: [],
      });
      d.important = d.important.filter((x) => x.id !== task.id);
    });
    setPlan(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Importantes"
        subtitle={open.length + (open.length > 1 ? ' tâches en attente' : ' tâche en attente')}
        color={C.orange}
        light={C.orangeLight}
      />

      <ScrollView contentContainerStyle={st.content}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} active={filter === f.id} color={C.orange} onPress={() => setFilter(f.id)} />
          ))}
        </View>

        {open.length === 0 ? <Empty text="Aucune tâche importante ici. Touche + pour en ajouter une." /> : null}

        {open.map((t) => {
          const p = PRIO[t.prio];
          return (
            <Pressable
              key={t.id}
              onPress={() => setEdit({ ...t })}
              onLongPress={() => remove(t)}
              style={st.card}
            >
              <Checkbox done={false} round color={C.amberDot} onPress={() => toggle(t.id)} label={t.title} />
              <View style={{ flex: 1, gap: 6, paddingTop: 10 }}>
                <View style={st.titleRow}>
                  <Text style={st.title}>{t.title}</Text>
                  <View style={[st.badge, { backgroundColor: p.bg }]}>
                    <Text style={[st.badgeText, { color: p.fg }]}>{p.label}</Text>
                  </View>
                </View>
                {t.note ? <Text style={st.note}>{t.note}</Text> : null}
                <Pressable
                  onPress={() => setPlan({ task: t, date: today, time: '' })}
                  style={st.planBtn}
                  hitSlop={6}
                >
                  <Ionicons name="calendar-outline" size={16} color={C.blue} />
                  <Text style={st.planText}>Planifier une date</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}

        {finished.length > 0 ? (
          <>
            <SectionTitle
              right={
                <Pressable onPress={() => setShowDone(!showDone)} hitSlop={10}>
                  <Text style={{ color: C.orange, fontWeight: '700' }}>{showDone ? 'Masquer' : 'Afficher'}</Text>
                </Pressable>
              }
            >
              Terminées ({finished.length})
            </SectionTitle>
            {showDone
              ? finished.map((t) => (
                  <Pressable key={t.id} onLongPress={() => remove(t)} style={[st.card, { opacity: 0.75 }]}>
                    <Checkbox done round color={C.amberDot} onPress={() => toggle(t.id)} label={t.title} />
                    <Text style={[st.title, st.doneText, { paddingTop: 12 }]}>{t.title}</Text>
                  </Pressable>
                ))
              : null}
          </>
        ) : null}
        <Text style={st.hint}>Touche une tâche pour la modifier, appui long pour la supprimer.</Text>
      </ScrollView>

      <Fab color={C.orange} label="Nouvelle tâche importante" onPress={() => setEdit({ title: '', note: '', prio: 'haute' })} />

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title={edit && edit.id ? 'Modifier la tâche' : 'Nouvelle tâche importante'}
      >
        {edit ? (
          <>
            <Field label="Titre" value={edit.title} onChangeText={(v) => setEdit({ ...edit, title: v })} placeholder="Ex. : renouveler le passeport" autoFocus />
            <Field label="Note (facultatif)" value={edit.note} onChangeText={(v) => setEdit({ ...edit, note: v })} placeholder="Détails, documents à prévoir…" multiline />
            <View style={{ gap: 6 }}>
              <Text style={st.label}>Priorité</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {Object.keys(PRIO).map((k) => (
                  <Chip key={k} label={PRIO[k].label} active={edit.prio === k} color={PRIO[k].fg} onPress={() => setEdit({ ...edit, prio: k })} />
                ))}
              </View>
            </View>
            <PrimaryButton label="Enregistrer" color={C.orange} onPress={save} disabled={!edit.title.trim()} />
          </>
        ) : null}
      </Sheet>

      <Sheet visible={!!plan} onClose={() => setPlan(null)} title="Planifier la tâche">
        {plan ? (
          <>
            <Text style={st.title}>{plan.task.title}</Text>
            <DatePickerRow value={plan.date} onChange={(v) => setPlan({ ...plan, date: v })} />
            <Field
              label="Heure (facultatif, ex. 14:30)"
              value={plan.time}
              onChangeText={(v) => setPlan({ ...plan, time: v })}
              placeholder="HH:MM"
              keyboardType="numbers-and-punctuation"
            />
            <PrimaryButton label="Mettre dans le planning" color={C.blue} onPress={confirmPlan} />
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 110 },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingRight: 14,
    paddingLeft: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'flex-start',
    shadowColor: '#13202B',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: C.ink },
  doneText: { color: '#6B7680', textDecorationLine: 'line-through' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  note: { fontSize: 13, color: C.muted, lineHeight: 18 },
  planBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, alignSelf: 'flex-start' },
  planText: { color: C.blue, fontWeight: '700', fontSize: 13 },
  hint: { fontSize: 12, color: C.muted },
  label: { fontSize: 13, fontWeight: '600', color: C.muted },
});
