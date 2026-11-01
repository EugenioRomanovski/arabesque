import { useEffect, useRef, useState } from 'react';
import { useStore, streak, isActive, doneToday } from './store.jsx';
import { Icon } from './ui.jsx';
import Home from './screens/Home.jsx';
import Homework from './screens/Homework.jsx';
import Player from './screens/Player.jsx';
import Schedule from './screens/Schedule.jsx';
import Lists from './screens/Lists.jsx';
import Rewards from './screens/Rewards.jsx';
import Profile from './screens/Profile.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Teacher from './screens/Teacher.jsx';
import { BADGES } from './rewards.js';

const TABS = [
  { id: 'home', label: 'Главная', icon: 'home' },
  { id: 'homework', label: 'Задания', icon: 'tasks' },
  { id: 'schedule', label: 'Расписание', icon: 'calendar' },
  { id: 'lists', label: 'Сумка', icon: 'bag' },
  { id: 'rewards', label: 'Награды', icon: 'star' },
];

export default function App() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState(() => location.hash.slice(1) || 'home');
  const [hw, setHw] = useState(null);
  const [profile, setProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const prevBadges = useRef(Object.keys(state.badges));
  const scroller = useRef();

  useEffect(() => { history.replaceState(null, '', `#${tab}`); scroller.current?.scrollTo({ top: 0 }); }, [tab]);

  // Автоматическая выдача значков
  useEffect(() => {
    const total = state.homework.reduce((n, h) => n + h.log.length, 0);
    const programs = new Set(state.homework.filter((h) => h.log.length && h.programId).map((h) => h.programId));
    const s = streak(state.activity);
    const rules = { first: total >= 1, five: total >= 5, ten: total >= 10, photo: state.reports.length > 0, streak3: s >= 3, streak7: s >= 7, explorer: programs.size >= 4 };
    Object.entries(rules).forEach(([id, ok]) => ok && !state.badges[id] && dispatch({ type: 'badge', id }));
  }, [state.homework, state.reports, state.activity]); // eslint-disable-line

  useEffect(() => {
    const now = Object.keys(state.badges);
    const fresh = now.find((id) => !prevBadges.current.includes(id));
    prevBadges.current = now;
    if (fresh) { const b = BADGES.find((x) => x.id === fresh); setToast(b); const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }
  }, [state.badges]);

  if (location.pathname.startsWith('/teacher')) return <Teacher />;
  if (!state.profile.onboarded) return <Onboarding />;

  const todo = state.homework.filter(isActive).filter((h) => !doneToday(h)).length;
  const screens = {
    home: <Home go={setTab} startHw={setHw} openProfile={() => setProfile(true)} />,
    homework: <Homework startHw={setHw} />,
    schedule: <Schedule />,
    lists: <Lists />,
    rewards: <Rewards />,
  };

  return (
    <div className="app">
      <div className="ambient" />
      <main className="scroller" ref={scroller}>{screens[tab] || screens.home}</main>
      <nav className="tabbar glass" role="tablist">
        <span className="tab-thumb" style={{ '--i': TABS.findIndex((t) => t.id === tab) }} />
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="tab-ico">
              <Icon name={t.icon} size={23} fill={tab === t.id && t.icon === 'star' ? 'currentColor' : 'none'} />
              {t.id === 'homework' && todo > 0 && <em className="dot">{todo}</em>}
            </span>
            <small>{t.label}</small>
          </button>
        ))}
      </nav>
      {hw && <Player hw={hw} onClose={() => setHw(null)} />}
      <Profile open={profile} onClose={() => setProfile(false)} />
      {toast && (
        <div className="toast glass" role="status">
          <span className="toast-ico">{toast.emoji}</span>
          <div><b>Новый значок!</b><small>{toast.title} · +5 ⭐</small></div>
        </div>
      )}
    </div>
  );
}
