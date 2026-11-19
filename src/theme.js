// Couleurs de l'application
export const C = {
  bg: '#F4F6F8',
  ink: '#13202B',
  muted: '#5B6670',
  line: '#E3E7EB',
  white: '#FFFFFF',
  soft: '#9AA5B0',

  teal: '#0F766E',
  tealLight: '#CDEFEA',
  yellow: '#FDE68A',
  yellowInk: '#0B4F4A',

  orange: '#C2410C',
  orangeLight: '#FFE4D2',

  blue: '#1D4ED8',
  blueLight: '#DBE6FF',
  blueBg: '#EFF4FF',
  blueBorder: '#C7D7FB',

  night: '#312E81',
  nightLight: '#D9DBFF',
  indigo: '#3A47A8',
  indigoBg: '#EAEDFF',
  indigoBorder: '#C3CBF5',

  amber: '#B45309',
  amberBg: '#FFF4DB',
  amberBorder: '#F8D58A',
  amberDot: '#F59E0B',

  pasBg: '#FDE3CF',
  pasText: '#9A3412',
  pasBorder: '#F0A877',
};

// Couleur de chaque onglet
export const TAB_COLORS = {
  today: C.teal,
  important: C.orange,
  planning: C.blue,
  prayers: C.indigo,
};

export const TAGS = {
  Perso: { bg: '#F3E8FF', fg: '#6B21A8' },
  Travail: { bg: '#DBEAFE', fg: '#1E40AF' },
  Maison: { bg: '#DCFCE7', fg: '#166534' },
};

export const PRIO = {
  haute: { label: 'Haute', bg: '#FEE2E2', fg: '#B91C1C' },
  moyenne: { label: 'Moyenne', bg: '#E0E4FA', fg: '#2F3A8F' },
  basse: { label: 'Basse', bg: '#DCFCE7', fg: '#166534' },
};

// Plus il y a de rak'at, plus la case est foncée
export function qiyamColors(n) {
  if (n === 0) return { bg: '#EEF0F6', fg: '#4A5560' };
  if (n <= 2) return { bg: '#D3D8F5', fg: C.ink };
  if (n <= 4) return { bg: '#A6B0EC', fg: C.ink };
  if (n <= 6) return { bg: '#5866C9', fg: C.white };
  return { bg: '#2F3A8F', fg: C.white };
}
