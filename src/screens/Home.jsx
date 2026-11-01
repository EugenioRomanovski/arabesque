import { useStore, streak, doneToday, isActive, ymd } from '../store.jsx';
import { Icon, Mascot, MASCOT_NAME, Ring } from '../ui.jsx';
import { nextTrainings, WEEKDAYS } from './Schedule.jsx';

const greetings = [
  'Сегодня отличный день, чтобы потянуть носочки!',
  'Готова стать гибкой, как ленточка?',
  'Я верю в тебя! Давай сделаем задание вместе.',
  'Каждая звёздочка — шаг к чемпионству!',
];

export default function Home({ go, startHw, openProfile }) {
  const { state } = useStore();
  const name = state.profile.name || 'гимнастка';
  const active = state.homework.filter(isActive);
  const todo = active.filter((h) => !doneToday(h));
  const done = active.length - todo.length;
  const s = streak(state.activity);
  const next = nextTrainings(state.schedule, 1)[0];
  const comp = state.schedule.filter((e) => e.type === 'competition' && e.date >= ymd()).sort((a, b) => a.date.localeCompare(b.date))[0];
  const bagLeft = state.lists.bag.filter((i) => !i.done).length;
  const greet = todo.length === 0 && active.length
    ? 'Все задания на сегодня сделаны! Ты настоящая звёздочка 🌟'
    : greetings[new Date().getDate() % greetings.length];

  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d; });

  return (
    <div className="screen">
      <header className="large-title">
        <div>
          <p className="eyebrow">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1>Привет, {name}!</h1>
        </div>
        <button className="avatar-btn glass-thin" onClick={openProfile} aria-label="Профиль">
          {(state.profile.name || '🩰').slice(0, 1).toUpperCase()}
        </button>
      </header>

      <section className="card glass mascot-card">
        <Mascot size={78} mood={todo.length === 0 && active.length ? 'wow' : 'happy'} />
        <div className="bubble">
          <b>{MASCOT_NAME}</b>
          <p>{greet}</p>
        </div>
      </section>

      <section className="stats-row">
        <button className="stat glass" onClick={() => go('rewards')}>
          <span className="stat-ico" style={{ color: '#ffb340' }}><Icon name="star" fill="currentColor" stroke={0} /></span>
          <b>{state.stars}</b><small>звёздочек</small>
        </button>
        <div className="stat glass">
          <span className="stat-ico">🔥</span>
          <b>{s}</b><small>{s === 1 ? 'день подряд' : 'дней подряд'}</small>
        </div>
        <button className="stat glass" onClick={() => go('lists')}>
          <span className="stat-ico">🎒</span>
          <b>{bagLeft === 0 ? '✓' : bagLeft}</b><small>{bagLeft === 0 ? 'сумка готова' : 'взять с собой'}</small>
        </button>
      </section>

      <section className="card glass">
        <div className="row-between">
          <h2>Неделя</h2>
          <span className="muted">{done}/{active.length} сегодня</span>
        </div>
        <div className="week">
          {week.map((d) => {
            const k = ymd(d); const on = state.activity.includes(k); const today = k === ymd();
            return (
              <div key={k} className={`day ${on ? 'on' : ''} ${today ? 'today' : ''}`}>
                <small>{WEEKDAYS[d.getDay()].short}</small>
                <span>{on ? '⭐' : d.getDate()}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="section-head"><h2>Задания на сегодня</h2><button className="link" onClick={() => go('homework')}>Все</button></div>
      {active.length === 0 && <div className="card glass muted center">Пока нет заданий. Добавь первое во вкладке «Задания».</div>}
      <div className="hw-scroller">
        {active.map((h) => {
          const ok = doneToday(h);
          return (
            <button key={h.id} className={`hw-tile ${ok ? 'done' : ''}`} style={{ '--c1': h.color[0], '--c2': h.color[1] }} onClick={() => startHw(h)}>
              <span className="hw-emoji">{h.emoji}</span>
              <b>{h.title}</b>
              <small>{h.items.length} упражнений · ~{Math.max(3, Math.round(h.items.length * 1.2))} мин</small>
              <span className="hw-cta">{ok ? <><Icon name="check" size={16} /> Сделано</> : <><Icon name="play" size={14} fill="currentColor" /> Начать</>}</span>
            </button>
          );
        })}
      </div>

      <div className="section-head"><h2>Скоро</h2><button className="link" onClick={() => go('schedule')}>Расписание</button></div>
      <div className="list glass">
        {next && (
          <div className="list-row">
            <span className="tile-ico" style={{ background: `${next.color || '#5ac8fa'}40` }}>{next.emoji || '🤸‍♀️'}</span>
            <div className="grow"><b>{next.title}</b><small>{next.label} · {next.time}–{next.end} · {next.place}</small></div>
          </div>
        )}
        {comp && (
          <div className="list-row">
            <span className="tile-ico" style={{ background: 'linear-gradient(135deg,#ffcf70,#ff9f6b)' }}>🏆</span>
            <div className="grow"><b>{comp.title}</b><small>{new Date(comp.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {comp.place}</small></div>
            <Ring value={Math.max(0.05, 1 - daysUntil(comp.date) / 60)} size={44} stroke={5} color="#ff9f6b"><small className="ring-num">{daysUntil(comp.date)}д</small></Ring>
          </div>
        )}
        {!next && !comp && <div className="list-row muted">Добавь тренировки в расписание</div>}
      </div>
    </div>
  );
}
const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date(ymd())) / 864e5));
