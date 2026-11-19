// Petites fonctions pour manipuler les dates (en français, sans dépendance)

export const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const JOURS_COURTS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const pad = (n) => (n < 10 ? '0' + n : '' + n);

// Date -> "2026-11-19"
export function keyOf(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// "2026-11-19" -> Date (à minuit, heure locale)
export function parseKey(k) {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey() {
  return keyOf(new Date());
}

export function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function addDaysKey(k, n) {
  return keyOf(addDays(parseKey(k), n));
}

// Lundi de la semaine
export function startOfWeek(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (x.getDay() + 6) % 7;
  return addDays(x, -offset);
}

export function longLabel(k) {
  const d = parseKey(k);
  return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()];
}

export function shortLabel(k) {
  const d = parseKey(k);
  return JOURS_COURTS[d.getDay()] + ' ' + d.getDate();
}

export function monthLabel(year, month) {
  const m = MOIS[month];
  return m.charAt(0).toUpperCase() + m.slice(1) + ' ' + year;
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Une tâche planifiée a-t-elle lieu ce jour-là ? (gère les répétitions)
export function occursOn(item, k) {
  if (item.date === k) return true;
  if (k < item.date) return false;
  const d = parseKey(k);
  const s = parseKey(item.date);
  switch (item.repeat) {
    case 'daily':
      return true;
    case 'weekly':
      return d.getDay() === s.getDay();
    case 'monthly':
      return d.getDate() === s.getDate();
    default:
      return false;
  }
}

export const REPEATS = [
  { id: 'none', label: 'Une fois' },
  { id: 'daily', label: 'Chaque jour' },
  { id: 'weekly', label: 'Chaque semaine' },
  { id: 'monthly', label: 'Chaque mois' },
];

export function repeatLabel(id) {
  const r = REPEATS.find((x) => x.id === id);
  return r && id !== 'none' ? r.label : '';
}

// "8:5" ou "08:05" -> "08:05" ; sinon ""
export function normalizeTime(t) {
  const m = /^\s*([01]?\d|2[0-3])\s*[:hH.]\s*([0-5]\d)\s*$/.exec(t || '');
  if (!m) return '';
  return pad(Number(m[1])) + ':' + m[2];
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
