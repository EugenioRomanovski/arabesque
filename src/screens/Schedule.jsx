import { useState } from 'react';
import { useStore, uid, ymd } from '../store.jsx';
import { Icon, Sheet, Segmented, Empty } from '../ui.jsx';

export const WEEKDAYS = [
  { short: 'Вс', long: 'Воскресенье' }, { short: 'Пн', long: 'Понедельник' }, { short: 'Вт', long: 'Вторник' },
  { short: 'Ср', long: 'Среда' }, { short: 'Чт', long: 'Четверг' }, { short: 'Пт', long: 'Пятница' }, { short: 'Сб', long: 'Суббота' },
];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function nextTrainings(schedule, n = 3) {
  const out = []; const now = new Date();
  for (let d = 0; d < 14 && out.length < n; d++) {
    const day = new Date(now); day.setDate(now.getDate() + d);
    schedule.filter((e) => e.type === 'training' && e.weekday === day.getDay())
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((e) => {
        if (d === 0) { const [h, m] = e.end.split(':').map(Number); if (now.getHours() * 60 + now.getMinutes() > h * 60 + m) return; }
        out.push({ ...e, label: d === 0 ? 'Сегодня' : d === 1 ? 'Завтра' : WEEKDAYS[day.getDay()].long });
      });
  }
  return out.slice(0, n);
}

export default function Schedule() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('training');
  const [edit, setEdit] = useState(null);
  const today = new Date().getDay();
  const comps = state.schedule.filter((e) => e.type === 'competition').sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="screen">
      <header className="large-title">
        <h1>Расписание</h1>
        <button className="circle-btn tinted" aria-label="Добавить" onClick={() => setEdit(blank(tab))}><Icon name="plus" /></button>
      </header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'training', label: 'Тренировки' }, { value: 'competition', label: 'Соревнования' }]} />

      {tab === 'training' ? (
        <div className="stack">
          {ORDER.map((wd) => {
            const items = state.schedule.filter((e) => e.type === 'training' && e.weekday === wd).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={wd} className={`day-row ${wd === today ? 'today' : ''}`}>
                <div className="day-label"><b>{WEEKDAYS[wd].short}</b>{wd === today && <small>сегодня</small>}</div>
                <div className="grow day-items">
                  {items.length === 0 ? <span className="rest">отдых 💤</span> : items.map((e) => (
                    <button key={e.id} className="event glass" onClick={() => setEdit(e)}>
                      <span className="event-time">{e.time}<small>{e.end}</small></span>
                      <span className="grow"><b>{e.title}</b><small><Icon name="pin" size={12} /> {e.place}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : comps.length === 0 ? (
        <Empty emoji="🏆" title="Соревнований пока нет" text="Добавь ближайший старт — я помогу подготовиться!" />
      ) : (
        <div className="stack">
          {comps.map((e) => {
            const past = e.date < ymd();
            const d = new Date(e.date);
            return (
              <button key={e.id} className={`comp glass ${past ? 'past' : ''}`} onClick={() => setEdit(e)}>
                <div className="comp-date"><b>{d.getDate()}</b><small>{d.toLocaleDateString('ru-RU', { month: 'short' })}</small></div>
                <div className="grow">
                  <b>{e.title}</b>
                  <small><Icon name="clock" size={12} /> {e.time} · <Icon name="pin" size={12} /> {e.place}</small>
                  {e.note && <small className="comp-note">🎒 {e.note}</small>}
                </div>
                <span className="pill">{past ? 'прошло' : `через ${Math.ceil((d - new Date(ymd())) / 864e5)} дн.`}</span>
              </button>
            );
          })}
        </div>
      )}

      <EventSheet item={edit} onClose={() => setEdit(null)}
        onSave={(item) => { dispatch({ type: 'sched:save', item }); setEdit(null); }}
        onDelete={(id) => { dispatch({ type: 'sched:del', id }); setEdit(null); }} />
    </div>
  );
}

const blank = (type) => type === 'training'
  ? { id: uid(), type, title: 'Тренировка', place: 'Зал', weekday: new Date().getDay(), time: '17:00', end: '18:00', isNew: true }
  : { id: uid(), type, title: '', place: '', date: ymd(new Date(Date.now() + 14 * 864e5)), time: '10:00', note: '', isNew: true };

function EventSheet({ item, onClose, onSave, onDelete }) {
  const [f, setF] = useState(item);
  if (item && f?.id !== item.id) setF(item);
  const set = (k) => (e) => setF({ ...f, [k]: k === 'weekday' ? Number(e.target.value) : e.target.value });
  const save = () => { const { isNew, ...rest } = f; onSave({ ...rest, title: rest.title || (rest.type === 'training' ? 'Тренировка' : 'Соревнования') }); };
  return (
    <Sheet open={!!item} onClose={onClose} title={f?.type === 'training' ? 'Тренировка' : 'Соревнование'} action={<button className="text-btn" onClick={save}>Готово</button>}>
      {f && (
        <>
          <div className="list glass-thin form">
            <label className="list-row"><span>Название</span><input value={f.title} onChange={set('title')} placeholder={f.type === 'training' ? 'Тренировка' : 'Название турнира'} /></label>
            <label className="list-row"><span>Место</span><input value={f.place} onChange={set('place')} placeholder="Зал, адрес" /></label>
            {f.type === 'training' ? (
              <label className="list-row"><span className="grow">День недели</span>
                <select value={f.weekday} onChange={set('weekday')}>{ORDER.map((d) => <option key={d} value={d}>{WEEKDAYS[d].long}</option>)}</select></label>
            ) : (
              <label className="list-row"><span className="grow">Дата</span><input type="date" value={f.date} onChange={set('date')} /></label>
            )}
            <label className="list-row"><span className="grow">Начало</span><input type="time" value={f.time} onChange={set('time')} /></label>
            {f.type === 'training' && <label className="list-row"><span className="grow">Конец</span><input type="time" value={f.end} onChange={set('end')} /></label>}
          </div>
          {f.type === 'competition' && (
            <label className="field glass-thin"><span>Что не забыть</span><textarea rows={2} value={f.note} onChange={set('note')} placeholder="Купальник, лак, номер участника…" /></label>
          )}
          {!f.isNew && <button className="btn danger" onClick={() => onDelete(f.id)}><Icon name="trash" size={18} /> Удалить</button>}
        </>
      )}
    </Sheet>
  );
}
