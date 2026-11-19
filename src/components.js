// Éléments réutilisés par tous les écrans
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from './theme';
import { longLabel, addDaysKey, todayKey } from './dates';

// Bandeau coloré en haut de chaque écran
export function Header({ title, subtitle, color, light, right, children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { backgroundColor: color, paddingTop: insets.top + 16 }]}>
      <View style={s.headerRow}>
        <View style={{ flex: 1 }}>
          {subtitle ? <Text style={[s.headerSub, { color: light }]}>{subtitle}</Text> : null}
          <Text style={s.headerTitle}>{title}</Text>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Chip({ label, active, onPress, color = C.ink, small }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[
        s.chip,
        small && { height: 36, paddingHorizontal: 12 },
        active ? { backgroundColor: color, borderColor: color } : null,
      ]}
    >
      <Text style={[s.chipText, active ? { color: C.white } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Checkbox({ done, onPress, color = C.teal, round, label }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!done }}
      accessibilityLabel={label}
      style={s.checkWrap}
    >
      <View
        style={[
          s.check,
          round && { borderRadius: 12 },
          done ? { backgroundColor: color, borderColor: color } : { borderColor: color },
        ]}
      >
        {done ? <Ionicons name="checkmark" size={16} color={C.white} /> : null}
      </View>
    </Pressable>
  );
}

export function Fab({ color, onPress, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[s.fab, { backgroundColor: color, shadowColor: color }]}
    >
      <Ionicons name="add" size={28} color={C.white} />
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, color = C.teal, disabled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      style={[s.primary, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={s.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function Empty({ text }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyText}>{text}</Text>
    </View>
  );
}

// Fenêtre qui monte du bas de l'écran (pour ajouter / modifier)
export function Sheet({ visible, onClose, title, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={s.sheetHead}>
            <Text style={s.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Fermer">
              <Ionicons name="close" size={26} color={C.muted} />
            </Pressable>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Field({ label, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor={C.soft} style={s.input} {...props} />
    </View>
  );
}

// Choix d'une date avec ‹ › et raccourcis
export function DatePickerRow({ value, onChange, color = C.blue }) {
  const today = todayKey();
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.fieldLabel}>Date</Text>
      <View style={s.dateRow}>
        <Pressable
          onPress={() => onChange(addDaysKey(value, -1))}
          style={s.dateBtn}
          accessibilityLabel="Jour précédent"
        >
          <Ionicons name="chevron-back" size={20} color={color} />
        </Pressable>
        <Text style={s.dateText}>{longLabel(value)}</Text>
        <Pressable
          onPress={() => onChange(addDaysKey(value, 1))}
          style={s.dateBtn}
          accessibilityLabel="Jour suivant"
        >
          <Ionicons name="chevron-forward" size={20} color={color} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip small label="Aujourd'hui" active={value === today} color={color} onPress={() => onChange(today)} />
        <Chip small label="Demain" active={value === addDaysKey(today, 1)} color={color} onPress={() => onChange(addDaysKey(today, 1))} />
        <Chip small label="+7 jours" onPress={() => onChange(addDaysKey(value, 7))} color={color} />
      </View>
    </View>
  );
}

export const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 14,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  headerSub: { fontSize: 13, fontWeight: '500' },
  headerTitle: { color: C.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600', color: C.ink },
  checkWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  primary: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: C.white, fontSize: 16, fontWeight: '700' },
  empty: { backgroundColor: C.white, borderRadius: 14, padding: 22, alignItems: 'center' },
  emptyText: { color: C.muted, fontSize: 14, textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(19,32,43,0.45)' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
  },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: C.ink,
    backgroundColor: C.white,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.ink },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 14 },
});
