import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, AppState, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, TAB_COLORS } from './src/theme';
import { todayKey } from './src/dates';
import { useStore } from './src/store';
import TodayScreen from './src/screens/TodayScreen';
import ImportantScreen from './src/screens/ImportantScreen';
import PlanningScreen from './src/screens/PlanningScreen';
import PrayersScreen from './src/screens/PrayersScreen';

const TABS = [
  { id: 'today', label: "Aujourd'hui", icon: 'sunny' },
  { id: 'important', label: 'Importantes', icon: 'star' },
  { id: 'planning', label: 'Planning', icon: 'calendar' },
  { id: 'prayers', label: 'Prières', icon: 'moon' },
];

function Main() {
  const insets = useSafeAreaInsets();
  const { data, update, ready, refreshDay } = useStore();
  const [tab, setTab] = useState('today');
  const [today, setToday] = useState(todayKey());

  // Si l'application reste ouverte après minuit, on passe au nouveau jour
  useEffect(() => {
    const check = () => {
      const k = todayKey();
      setToday((prev) => {
        if (prev !== k) refreshDay(k);
        return k;
      });
    };
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') check();
    });
    const timer = setInterval(check, 60 * 1000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [refreshDay]);

  if (!ready) {
    return (
      <View style={[styles.loading]}>
        <ActivityIndicator size="large" color={C.teal} />
      </View>
    );
  }

  const props = { data, update, today, goTo: setTab };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {tab === 'today' && <TodayScreen {...props} />}
        {tab === 'important' && <ImportantScreen {...props} />}
        {tab === 'planning' && <PlanningScreen {...props} />}
        {tab === 'prayers' && <PrayersScreen {...props} />}
      </View>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((t) => {
          const on = tab === t.id;
          const color = on ? TAB_COLORS[t.id] : C.muted;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.label}
            >
              <View style={[styles.tabIcon, on && { backgroundColor: TAB_COLORS[t.id] + '1F' }]}>
                <Ionicons name={on ? t.icon : t.icon + '-outline'} size={22} color={color} />
              </View>
              <Text style={[styles.tabText, { color }, on && { fontWeight: '800' }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, fontWeight: '600' },
});
