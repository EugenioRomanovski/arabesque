import { useEffect, useState } from 'react';
import { useStore, uid, ymd } from '../store.jsx';
import { Icon, Sheet, Segmented, Empty, SwipeRow, UndoBar } from '../ui.jsx';

export const WEEKDAYS = [
  { short: 'Вс', long: 'Воскресенье' }, { short: 'Пн', long: 'Понедельник' }, { short: 'Вт', long: 'Вторник' },
  { short: 'Ср', long: 'Среда' }, { short: 'Чт', long: 'Четверг' }, { short: 'Пт', long: 'Пятница' }, { short: 'Сб', long: 'Суббота' },
];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

// Виды тренировок
export const KINDS = [
  { id: 'main', title: 'Тренировка', emoji: '🤸‍♀️', color: '#5ac8fa' },
  { id: 'choreo', title: 'Хореография', emoji: '🩰', color: '#ff7eb6' },
  { id: 'ofp', title: 'ОФП', emoji: '💪', color: '#ff9f40' },
  { id: 'stretch', title: 'Растяжка', emoji: '🌸', color: '#b07cff' },
  { id: 'apparatus', title: 'Предметы', emoji: '🎀', color: '#34c79a' },
  { id: 'solo', title: 'Индивидуальная', emoji: '⭐', color: '#ffb340' },
];
const EMOJIS = ['🤸‍♀️', '🩰', '💃', '🎀', '⚪', '🪢', '🏐', '🌸', '🦢', '⭐', '💪', '🧘‍♀️', '🏊‍♀️', '🎵', '🏃‍♀️', '🌈'];
const COLORS = ['#5ac8fa', '#ff7eb6', '#b07cff', '#34c79a', '#ff9f40', '#ffb340', '#ff5e7e', '#7d8bff'];

const isWeekly = (e) => e.type === 'training' && e.repeat !== 'once';
const isOnce = (e) => e.type === 'training' && e.repeat === 'once';
const tColor = (e) => e.color || '#5ac8fa';
const tEmoji = (e) => e.emoji || '🤸‍♀️';
const fmtDate = (d, o = { day: 'numeric', month: 'long' }) => new Date(d + 'T00:00').toLocaleDateString('ru-RU', o);

export function nextTrainings(schedule, n = 3) {
  const out = []; const now = new Date();
  for (let d = 0; d < 21 && out.length < n; d++) {
    const day = new Date(now); day.setDate(now.getDate() + d);
    const key = ymd(day);
    schedule.filter((e) => (isWeekly(e) && e.weekday === day.getDay()) || (isOnce(e) && e.date === key))
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((e) => {
        if (d === 0) { const [h, m] = (e.end || e.time).split(':').map(Number); if (now.getHours() * 60 + now.getMinutes() > h * 60 + m) return; }
        out.push({ ...e, label: d === 0 ? 'Сегодня' : d === 1 ? 'Завтра' : WEEKDAYS[day.getDay()].long });
      });
  }
  return out.slice(0, n);
}

export default function Schedule() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('training');
  const [edit, setEdit] = useState(null);
  const [undo, setUndo] = useState(null);
  const today = new Date().getDay();
  const comps = state.schedule.filter((e) => e.type === 'competition').sort((a, b) => a.date.localeCompare(b.date));
  const once = state.schedule.filter(isOnce).filter((e) => e.date >= ymd()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  useEffect(() => { if (!undo) return; const t = setTimeout(() => setUndo(null), 4500); return () => clearTimeout(t); }, [undo]);

  const remove = (e) => { dispatch({ type: 'sched:del', id: e.id }); setUndo(e); };
  const restore = () => { if (undo) dispatch({ type: 'sched:save', item: undo }); setUndo(null); };

  const eventCard = (e, sub) => (
    <SwipeRow key={e.id} onDelete={() => remove(e)}>
      <button className="event glass" style={{ '--ec': tColor(e) }} onClick={() => setEdit(e)}>
        <span className="event-time">{e.time}<small>{e.end}</small></span>
        <span className="grow"><b>{e.title}</b><small>{sub}<Icon name="pin" size={12} /> {e.place || '—'}</small></span>
        <span className="event-emoji">{tEmoji(e)}</span>
      </button>
    </SwipeRow>
  );

  return (
    <div className="screen">
      <header className="large-title">
        <h1>Расписание</h1>
        <button className="circle-btn tinted" aria-label="Добавить" onClick={() => setEdit(blank(tab))}><Icon name="plus" /></button>
      </header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'training', label: 'Тренировки' }, { value: 'competition', label: 'Соревнования' }]} />

      {tab === 'training' ? (
        <div className="stack">
          <div className="section-head"><h2>Каждую неделю</h2></div>
          {ORDER.map((wd) => {
            const items = state.schedule.filter((e) => isWeekly(e) && e.weekday === wd).sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={wd} className={`day-row ${wd === today ? 'today' : ''}`}>
                <div className="day-label"><b>{WEEKDAYS[wd].short}</b>{wd === today && <small>сегодня</small>}</div>
                <div className="grow day-items">
                  {items.length === 0 ? <span className="rest">отдых 💤</span> : items.map((e) => eventCard(e, ''))}
                </div>
              </div>
            );
          })}
          <div className="section-head"><h2>Разовые</h2><button className="link" onClick={() => setEdit({ ...blank('training'), repeat: 'once' })}>Добавить</button></div>
          {once.length === 0
            ? <p className="footnote">Дополнительные занятия, сборы, мастер-классы — добавь их на конкретную дату.</p>
            : <div className="stack">{once.map((e) => eventCard(e, `${fmtDate(e.date, { day: 'numeric', month: 'short', weekday: 'short' })} · `))}</div>}
          <p className="swipe-hint">← Смахни событие влево, чтобы удалить</p>
        </div>
      ) : comps.length === 0 ? (
        <Empty emoji="🏆" title="Соревнований пока нет" text="Добавь ближайший старт — я помогу подготовиться!" />
      ) : (
        <div className="stack">
          {comps.map((e) => {
            const past = e.date < ymd();
            const d = new Date(e.date + 'T00:00');
            return (
              <SwipeRow key={e.id} onDelete={() => remove(e)}>
                <button className={`comp glass ${past ? 'past' : ''}`} onClick={() => setEdit(e)}>
                  <div className="comp-date"><b>{d.getDate()}</b><small>{d.toLocaleDateString('ru-RU', { month: 'short' })}</small></div>
                  <div className="grow">
                    <b>{e.title}</b>
                    <small><Icon name="clock" size={12} /> {e.time} · <Icon name="pin" size={12} /> {e.place}</small>
                    {e.note && <small className="comp-note">🎒 {e.note}</small>}
                  </div>
                  <span className="pill">{past ? 'прошло' : `через ${Math.ceil((d - new Date(ymd() + 'T00:00')) / 864e5)} дн.`}</span>
                </button>
              </SwipeRow>
            );
          })}
          <p className="swipe-hint">← Смахни событие влево, чтобы удалить</p>
        </div>
      )}

      <EventSheet item={edit} onClose={() => setEdit(null)}
        onSave={(items) => { dispatch({ type: 'sched:many', items }); setEdit(null); }}
        onDelete={(e) => { setEdit(null); remove(e); }} />
      {undo && <UndoBar text={`«${undo.title}» удалено`} onUndo={restore} />}
    </div>
  );
}

const blank = (type) => type === 'training'
  ? { id: uid(), type, kind: 'main', title: 'Тренировка', emoji: '🤸‍♀️', color: '#5ac8fa', place: 'Зал', repeat: 'weekly', weekday: new Date().getDay(), date: ymd(new Date(Date.now() + 864e5)), time: '17:00', end: '18:00', isNew: true }
  : { id: uid(), type, title: '', place: '', date: ymd(new Date(Date.now() + 14 * 864e5)), time: '10:00', note: '', isNew: true };

function EventSheet({ item, onClose, onSave, onDelete }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState(item);
  const [days, setDays] = useState([]);
  const [custom, setCustom] = useState(null); // {title, emoji, color}
  useEffect(() => {
    if (!item) return;
    setF({ repeat: 'weekly', date: ymd(new Date(Date.now() + 864e5)), ...item });
    setDays(item.type === 'training' && item.repeat !== 'once' ? [item.weekday] : []);
    setCustom(null);
  }, [item]);
  if (!f) return <Sheet open={false} onClose={onClose} title="" />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const kinds = [...KINDS, ...state.customKinds];
  const pickKind = (k) => {
    setCustom(null);
    const keepTitle = f.title && !kinds.some((x) => x.title === f.title);
    setF({ ...f, kind: k.id, emoji: k.emoji, color: k.color, title: keepTitle ? f.title : k.title });
  };
  const toggleDay = (d) => setDays((ds) => ds.includes(d) ? (ds.length > 1 ? ds.filter((x) => x !== d) : ds) : [...ds, d]);

  const save = () => {
    let base = { ...f };
    if (custom) {
      if (!custom.title.trim()) return alert('Как называется твоя тренировка?');
      const kind = { id: 'c-' + uid(), title: custom.title.trim(), emoji: custom.emoji, color: custom.color };
      dispatch({ type: 'kind:add', kind });
      const ownTitle = base.title && !kinds.some((x) => x.title === base.title);
      base = { ...base, kind: kind.id, title: ownTitle ? base.title : kind.title, emoji: kind.emoji, color: kind.color };
    }
    const { isNew, ...clean } = base;
    if (!clean.title) clean.title = clean.type === 'training' ? 'Тренировка' : 'Соревнования';
    if (clean.type !== 'training' || clean.repeat === 'once') {
      const { weekday, ...rest } = clean;
      return onSave([clean.type === 'training' ? rest : clean]);
    }
    const ordered = ORDER.filter((d) => days.includes(d));
    onSave(ordered.map((wd, i) => ({ ...clean, id: i === 0 ? clean.id : uid(), weekday: wd })));
  };
  const del = () => { if (confirm(`Удалить «${f.title || 'событие'}»?`)) onDelete(f); };
  const isT = f.type === 'training';

  return (
    <Sheet open={!!item} onClose={onClose} title={f.isNew ? (isT ? 'Новая тренировка' : 'Новое соревнование') : (isT ? 'Тренировка' : 'Соревнование')}
      action={<button className="text-btn" onClick={save}>Готово</button>}>
      {isT && (
        <>
          <p className="sub-label">Вид занятия</p>
          <div className="kind-grid">
            {kinds.map((k) => (
              <span key={k.id} className={`kind ${!custom && f.kind === k.id ? 'on' : ''}`} style={{ '--k': k.color }}>
                <button onClick={() => pickKind(k)}>{k.emoji} {k.title}</button>
                {k.id.startsWith('c-') && (
                  <button className="x" aria-label={`Удалить вид «${k.title}»`} onClick={() => confirm(`Убрать «${k.title}» из моих тренировок?`) && dispatch({ type: 'kind:del', id: k.id })}><Icon name="close" size={13} /></button>
                )}
              </span>
            ))}
            <button className={`kind add ${custom ? 'on' : ''}`} style={{ '--k': '#ff4f9a' }} onClick={() => setCustom(custom || { title: '', emoji: '💃', color: '#ff7eb6' })}>
              <Icon name="plus" size={14} /> Своя
            </button>
          </div>
          {custom && (
            <div className="custom-kind glass-thin">
              <input value={custom.title} autoFocus onChange={(e) => setCustom({ ...custom, title: e.target.value })} placeholder="Название, например «Акробатика»" />
              <div className="pick-row">{EMOJIS.map((em) => <button key={em} className={custom.emoji === em ? 'on' : ''} onClick={() => setCustom({ ...custom, emoji: em })}>{em}</button>)}</div>
              <div className="pick-row">{COLORS.map((c) => <button key={c} className={`sw ${custom.color === c ? 'on' : ''}`} style={{ background: c, color: c }} onClick={() => setCustom({ ...custom, color: c })} aria-label={c} />)}</div>
              <small>Сохранится в «Мои тренировки», чтобы выбирать её снова.</small>
            </div>
          )}
          <Segmented value={f.repeat} onChange={(v) => setF({ ...f, repeat: v })} options={[{ value: 'weekly', label: 'Каждую неделю' }, { value: 'once', label: 'Один раз' }]} />
          {f.repeat === 'weekly' && (
            <>
              <p className="sub-label">{f.isNew ? 'Дни недели (можно несколько)' : 'День недели'}</p>
              <div className="wd-row">{ORDER.map((d) => <button key={d} className={days.includes(d) ? 'on' : ''} onClick={() => toggleDay(d)}>{WEEKDAYS[d].short}</button>)}</div>
            </>
          )}
        </>
      )}
      <div className="list glass-thin form">
        <label className="list-row"><span>Название</span><input value={f.title} onChange={set('title')} placeholder={isT ? 'Тренировка' : 'Название турнира'} /></label>
        <label className="list-row"><span>Место</span><input value={f.place} onChange={set('place')} placeholder="Зал, адрес" /></label>
        {(!isT || f.repeat === 'once') && (
          <label className="list-row"><span className="grow">Дата</span><input type="date" value={f.date} onChange={set('date')} /></label>
        )}
        <label className="list-row"><span className="grow">Начало</span><input type="time" value={f.time} onChange={set('time')} /></label>
        {isT && <label className="list-row"><span className="grow">Конец</span><input type="time" value={f.end} onChange={set('end')} /></label>}
      </div>
      {!isT && (
        <label className="field glass-thin"><span>Что не забыть</span><textarea rows={2} value={f.note} onChange={set('note')} placeholder="Купальник, лак, номер участника…" /></label>
      )}
      {!f.isNew && <button className="btn danger" onClick={del}><Icon name="trash" size={18} /> Удалить {isT ? 'тренировку' : 'соревнование'}</button>}
    </Sheet>
  );
}
