import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { PROGRAMS } from './data/exercises.js';

const KEY = 'arabesque:v1';
export const uid = () => Math.random().toString(36).slice(2, 10);
export const ymd = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };

function fromProgram(p, extra = {}) {
  return {
    id: uid(), programId: p.id, title: p.title, emoji: p.emoji, color: p.color,
    items: p.items.map((exId) => ({ exId })), from: 'Тренер', repeat: 'daily',
    due: addDays(7), requirePhoto: true, createdAt: Date.now(), log: [], ...extra,
  };
}

const seed = () => ({
  profile: { name: '', age: 5, onboarded: false },
  homework: [
    fromProgram(PROGRAMS[1], { note: 'Каждый день перед сном. Тянем носочки!' }),
    fromProgram(PROGRAMS[2], { repeat: 'once', due: addDays(3), note: 'Покажи лодочку и корзиночку на фото.' }),
  ],
  schedule: [
    { id: uid(), type: 'training', title: 'Тренировка', place: 'Зал', weekday: 1, time: '17:00', end: '18:00' },
    { id: uid(), type: 'training', title: 'Тренировка', place: 'Зал', weekday: 3, time: '17:00', end: '18:00' },
    { id: uid(), type: 'training', title: 'Хореография', place: 'Зал', weekday: 5, time: '16:30', end: '17:30' },
    { id: uid(), type: 'competition', title: 'Первенство «Весенние звёздочки»', place: 'Дворец спорта', date: addDays(30), time: '10:00', note: 'Купальник, чешки, лак для волос' },
  ],
  lists: {
    bag: ['Купальник', 'Чешки (получешки)', 'Резинки и шпильки', 'Бутылка воды', 'Носочки', 'Скакалка', 'Полотенце'].map((text) => ({ id: uid(), text, done: false })),
    buy: [
      { id: uid(), text: 'Мяч для художественной гимнастики', done: false },
      { id: uid(), text: 'Чехол для мяча', done: false },
      { id: uid(), text: 'Чешки', done: true },
      { id: uid(), text: 'Скакалка', done: true },
    ],
  },
  teachers: [],
  stars: 0,
  badges: {},
  reports: [], // {id, hwId, title, date, photoId, shared}
  activity: [], // ymd strings with completed workouts
});

function reducer(s, a) {
  switch (a.type) {
    case 'profile': return { ...s, profile: { ...s.profile, ...a.patch } };
    case 'hw:add': return { ...s, homework: [a.hw, ...s.homework] };
    case 'hw:del': return { ...s, homework: s.homework.filter((h) => h.id !== a.id) };
    case 'hw:complete': {
      const today = ymd();
      const homework = s.homework.map((h) => h.id === a.id ? { ...h, log: [...h.log, { date: today, at: Date.now() }] } : h);
      const activity = s.activity.includes(today) ? s.activity : [...s.activity, today];
      return { ...s, homework, activity, stars: s.stars + a.stars };
    }
    case 'report:add': return { ...s, reports: [a.report, ...s.reports], stars: s.stars + 2 };
    case 'report:share': return { ...s, reports: s.reports.map((r) => r.id === a.id ? { ...r, shared: !r.shared } : r) };
    case 'report:del': return { ...s, reports: s.reports.filter((r) => r.id !== a.id) };
    case 'sched:save': {
      const exists = s.schedule.some((e) => e.id === a.item.id);
      return { ...s, schedule: exists ? s.schedule.map((e) => e.id === a.item.id ? a.item : e) : [...s.schedule, a.item] };
    }
    case 'sched:del': return { ...s, schedule: s.schedule.filter((e) => e.id !== a.id) };
    case 'list:add': return { ...s, lists: { ...s.lists, [a.list]: [...s.lists[a.list], { id: uid(), text: a.text, done: false }] } };
    case 'list:toggle': return { ...s, lists: { ...s.lists, [a.list]: s.lists[a.list].map((i) => i.id === a.id ? { ...i, done: !i.done } : i) } };
    case 'list:del': return { ...s, lists: { ...s.lists, [a.list]: s.lists[a.list].filter((i) => i.id !== a.id) } };
    case 'list:reset': return { ...s, lists: { ...s.lists, [a.list]: s.lists[a.list].map((i) => ({ ...i, done: false })) } };
    case 'teacher:add': return { ...s, teachers: [...s.teachers, a.teacher] };
    case 'teacher:del': return { ...s, teachers: s.teachers.filter((t) => t.id !== a.id) };
    case 'badge': return s.badges[a.id] ? s : { ...s, badges: { ...s.badges, [a.id]: Date.now() }, stars: s.stars + 5 };
    case 'reset': return seed();
    default: return s;
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return seed();
}

const Ctx = createContext(null);
export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota */ } }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useStore = () => useContext(Ctx);
export { fromProgram };

// ——— helpers ———
export function streak(activity) {
  const set = new Set(activity);
  let n = 0; const d = new Date();
  if (!set.has(ymd(d))) d.setDate(d.getDate() - 1);
  while (set.has(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export const doneToday = (h) => h.log.some((l) => l.date === ymd());
export const isActive = (h) => h.repeat === 'daily' ? h.due >= ymd() : h.log.length === 0;

// ——— photos in IndexedDB ———
const DB = 'arabesque-photos';
function db() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
export async function savePhoto(blob) {
  const id = uid(); const d = await db();
  await new Promise((res, rej) => { const t = d.transaction('photos', 'readwrite'); t.objectStore('photos').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); });
  return id;
}
export async function getPhoto(id) {
  const d = await db();
  return new Promise((res) => { const r = d.transaction('photos').objectStore('photos').get(id); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); });
}
export async function shrink(file, max = 1280) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.82));
  } catch { return file; }
}
