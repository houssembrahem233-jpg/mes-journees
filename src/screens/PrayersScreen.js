import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, qiyamColors } from '../theme';
import { keyOf, parseKey, addDaysKey, daysInMonth, monthLabel, longLabel } from '../dates';
import { Header, Sheet, PrimaryButton, Chip } from '../components';

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function PrayersScreen({ data, update, today }) {
  const t = parseKey(today);
  const [vue, setVue] = useState('fajr');
  const [ym, setYm] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const [qEdit, setQEdit] = useState(null); // { k, n }

  const nbDays = daysInMonth(ym.y, ym.m);
  const offset = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7;
  const keys = Array.from({ length: nbDays }, (_, i) => keyOf(new Date(ym.y, ym.m, i + 1)));
  const past = keys.filter((k) => k <= today);

  const moveMonth = (n) => {
    const d = new Date(ym.y, ym.m + n, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };

  // ---- Statistiques ----
  let stats;
  if (vue === 'fajr') {
    const faits = past.filter((k) => data.fajr[k] === 'fait').length;
    const pas = past.filter((k) => data.fajr[k] === 'pas').length;
    // Série : jours "fait" consécutifs jusqu'à aujourd'hui (ou hier si aujourd'hui pas encore noté)
    let serie = 0;
    let k = data.fajr[today] ? today : addDaysKey(today, -1);
    while (data.fajr[k] === 'fait') {
      serie++;
      k = addDaysKey(k, -1);
    }
    stats = [
      { label: 'Série', value: String(serie), unit: serie > 1 ? 'jours de suite' : 'jour de suite', color: C.teal },
      { label: 'Ce mois', value: faits + '/' + (faits + pas), unit: 'jours faits', color: C.amber },
      { label: 'Pas fait', value: String(pas), unit: pas > 1 ? 'jours' : 'jour', color: C.pasText },
    ];
  } else {
    const noted = past.filter((k) => data.qiyam[k] !== undefined);
    const total = noted.reduce((a, k) => a + data.qiyam[k], 0);
    const nuits = noted.filter((k) => data.qiyam[k] > 0).length;
    const moy = nuits ? (total / nuits).toFixed(1).replace('.', ',') : '0';
    stats = [
      { label: 'Total', value: String(total), unit: "rak'at", color: C.indigo },
      { label: 'Nuits', value: nuits + '/' + noted.length, unit: 'nuits faites', color: C.amber },
      { label: 'Moyenne', value: moy, unit: "rak'at / nuit", color: '#7C3AED' },
    ];
  }

  // ---- Toucher un jour ----
  const onDay = (k) => {
    if (k > today) return;
    if (vue === 'fajr') {
      // Non noté -> Fait -> Pas fait -> Non noté
      update((d) => {
        const cur = d.fajr[k];
        if (!cur) d.fajr[k] = 'fait';
        else if (cur === 'fait') d.fajr[k] = 'pas';
        else delete d.fajr[k];
      });
    } else {
      setQEdit({ k, n: data.qiyam[k] === undefined ? 0 : data.qiyam[k] });
    }
  };

  const saveQiyam = (clear) => {
    update((d) => {
      if (clear) delete d.qiyam[qEdit.k];
      else d.qiyam[qEdit.k] = qEdit.n;
    });
    setQEdit(null);
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  keys.forEach((k) => cells.push(k));

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Prières"
        subtitle={monthLabel(ym.y, ym.m)}
        color={C.night}
        light={C.nightLight}
        right={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable onPress={() => moveMonth(-1)} style={st.navBtn} accessibilityLabel="Mois précédent">
              <Ionicons name="chevron-back" size={20} color={C.white} />
            </Pressable>
            <Pressable onPress={() => moveMonth(1)} style={st.navBtn} accessibilityLabel="Mois suivant">
              <Ionicons name="chevron-forward" size={20} color={C.white} />
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={st.content}>
        <View style={st.segment}>
          {[
            { id: 'fajr', label: 'Al-Fajr', icon: 'partly-sunny-outline' },
            { id: 'qiyam', label: 'Qiyam al-Layl', icon: 'moon-outline' },
          ].map((o) => (
            <Pressable
              key={o.id}
              onPress={() => setVue(o.id)}
              accessibilityState={{ selected: vue === o.id }}
              style={[st.segBtn, vue === o.id && st.segOn]}
            >
              <Ionicons name={o.icon} size={18} color={vue === o.id ? (o.id === 'fajr' ? C.amber : C.indigo) : C.muted} />
              <Text style={[st.segText, vue === o.id && { color: C.ink, fontWeight: '800' }]}>{o.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {stats.map((s) => (
            <View key={s.label} style={st.stat}>
              <Text style={st.statLabel}>{s.label}</Text>
              <Text style={[st.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={st.statUnit}>{s.unit}</Text>
            </View>
          ))}
        </View>

        <View style={st.calCard}>
          <Text style={st.calHint}>
            {vue === 'fajr'
              ? 'Touche un jour : fait → pas fait → effacer'
              : "Touche un jour pour noter le nombre de rak'at"}
          </Text>
          <View style={st.grid}>
            {WEEK.map((w, i) => (
              <View key={'h' + i} style={st.cellWrap}>
                <Text style={st.weekDay}>{w}</Text>
              </View>
            ))}
            {cells.map((k, i) => {
              if (!k) return <View key={'b' + i} style={st.cellWrap} />;
              const n = parseKey(k).getDate();
              const future = k > today;
              const isToday = k === today;
              let bg = 'transparent';
              let fg = '#6B7680';
              let sub = '';
              let border = null;
              if (!future) {
                if (vue === 'fajr') {
                  const v = data.fajr[k];
                  if (v === 'fait') {
                    bg = C.teal; fg = C.white; sub = '✓';
                  } else if (v === 'pas') {
                    bg = C.pasBg; fg = C.pasText; sub = '✕';
                  } else {
                    bg = '#EEF1F4'; fg = C.ink;
                  }
                } else {
                  const v = data.qiyam[k];
                  if (v === undefined) {
                    bg = '#F4F5F8'; fg = C.ink;
                  } else {
                    const col = qiyamColors(v);
                    bg = col.bg; fg = col.fg; sub = v > 0 ? String(v) : '–';
                  }
                }
                if (isToday && !sub) border = { borderWidth: 2, borderStyle: 'dashed', borderColor: vue === 'fajr' ? C.teal : C.indigo, backgroundColor: C.white };
              }
              return (
                <View key={k} style={st.cellWrap}>
                  <Pressable
                    onPress={() => onDay(k)}
                    disabled={future}
                    accessibilityLabel={longLabel(k)}
                    style={[st.cell, { backgroundColor: bg }, border]}
                  >
                    <Text style={[st.cellNum, { color: fg }]}>{n}</Text>
                    {sub ? <Text style={[st.cellSub, { color: fg }]}>{sub}</Text> : null}
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={st.legend}>
            {vue === 'fajr' ? (
              <>
                <Legend color={C.teal} label="Fait" />
                <Legend color={C.pasBg} border={C.pasBorder} label="Pas fait" />
                <Legend color="#EEF1F4" label="Non noté" />
              </>
            ) : (
              <>
                {[0, 2, 4, 6, 8].map((n) => (
                  <Legend key={n} color={qiyamColors(n).bg} label={n === 8 ? '8 et +' : String(n)} />
                ))}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <Sheet visible={!!qEdit} onClose={() => setQEdit(null)} title="Qiyam al-Layl">
        {qEdit ? (
          <>
            <Text style={{ fontSize: 15, color: C.muted }}>{longLabel(qEdit.k)}</Text>
            <View style={st.bigStepper}>
              <Pressable onPress={() => setQEdit({ ...qEdit, n: Math.max(0, qEdit.n - 1) })} style={st.bigMinus} accessibilityLabel="Retirer une rak'a">
                <Ionicons name="remove" size={28} color={C.ink} />
              </Pressable>
              <View style={{ alignItems: 'center', minWidth: 90 }}>
                <Text style={st.bigNum}>{qEdit.n}</Text>
                <Text style={{ color: C.muted }}>rak'at</Text>
              </View>
              <Pressable onPress={() => setQEdit({ ...qEdit, n: qEdit.n + 1 })} style={st.bigPlus} accessibilityLabel="Ajouter une rak'a">
                <Ionicons name="add" size={28} color={C.white} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[0, 2, 4, 6, 8, 11].map((n) => (
                <Chip key={n} small label={String(n)} active={qEdit.n === n} color={C.indigo} onPress={() => setQEdit({ ...qEdit, n })} />
              ))}
            </View>
            <PrimaryButton label="Enregistrer" color={C.indigo} onPress={() => saveQiyam(false)} />
            <Pressable onPress={() => saveQiyam(true)} style={{ alignItems: 'center', padding: 10 }}>
              <Text style={{ color: C.pasText, fontWeight: '700' }}>Effacer ce jour</Text>
            </Pressable>
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

function Legend({ color, border, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: color, borderWidth: border ? 1 : 0, borderColor: border }} />
      <Text style={{ fontSize: 12, color: '#3B4650' }}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: { flexDirection: 'row', backgroundColor: '#E0E3FA', borderRadius: 14, padding: 4, gap: 4 },
  segBtn: { flex: 1, height: 44, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  segOn: {
    backgroundColor: C.white,
    shadowColor: '#13202B',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segText: { fontSize: 14, fontWeight: '600', color: '#4A5560' },
  stat: { flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 12, gap: 2 },
  statLabel: { fontSize: 12, color: C.muted, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statUnit: { fontSize: 12, color: C.muted },
  calCard: { backgroundColor: C.white, borderRadius: 16, padding: 14, gap: 10 },
  calHint: { fontSize: 12, color: C.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellWrap: { width: '14.2857%', padding: 3 },
  weekDay: { textAlign: 'center', fontSize: 11, fontWeight: '700', color: C.muted },
  cell: { height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 1 },
  cellNum: { fontSize: 13, fontWeight: '700' },
  cellSub: { fontSize: 10, fontWeight: '800' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 4 },
  bigStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  bigMinus: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigPlus: { width: 56, height: 56, borderRadius: 16, backgroundColor: C.indigo, alignItems: 'center', justifyContent: 'center' },
  bigNum: { fontSize: 44, fontWeight: '800', color: C.indigo },
});
