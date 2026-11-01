import { useState } from 'react';
import { useStore, doneToday, isActive, fromProgram, uid, ymd } from '../store.jsx';
import { PROGRAMS, EXERCISES, CATEGORIES, exById } from '../data/exercises.js';
import { Icon, Sheet, Segmented, Empty } from '../ui.jsx';

export default function Homework({ startHw }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('active');
  const [adding, setAdding] = useState(false);
  const [lib, setLib] = useState(null);
  const active = state.homework.filter(isActive);
  const archive = state.homework.filter((h) => !isActive(h));
  const list = tab === 'active' ? active : archive;

  return (
    <div className="screen">
      <header className="large-title">
        <h1>Задания</h1>
        <button className="circle-btn tinted" onClick={() => setAdding(true)} aria-label="Добавить задание"><Icon name="plus" /></button>
      </header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'active', label: `Активные · ${active.length}` }, { value: 'archive', label: 'Выполненные' }, { value: 'library', label: 'Упражнения' }]} />

      {tab === 'library' ? (
        <Library onOpen={setLib} />
      ) : list.length === 0 ? (
        <Empty emoji={tab === 'active' ? '🌷' : '🗂️'} title={tab === 'active' ? 'Нет активных заданий' : 'Здесь пока пусто'}
          text={tab === 'active' ? 'Нажми «+», чтобы добавить комплекс от тренера.' : 'Выполненные разовые задания и прошедшие комплексы появятся здесь.'} />
      ) : (
        <div className="stack">
          {list.map((h) => {
            const ok = doneToday(h);
            return (
              <article key={h.id} className="hw-card glass" style={{ '--c1': h.color[0], '--c2': h.color[1] }}>
                <div className="hw-card-top" onClick={() => startHw(h)}>
                  <span className="hw-badge">{h.emoji}</span>
                  <div className="grow">
                    <b>{h.title}</b>
                    <small>{h.from} · {h.repeat === 'daily' ? `каждый день до ${fmt(h.due)}` : `сдать до ${fmt(h.due)}`}</small>
                  </div>
                  {ok ? <span className="pill green"><Icon name="check" size={14} /> Сегодня</span> : <span className="pill">+{h.items.length + 3} ⭐</span>}
                </div>
                {h.note && <p className="hw-note">💬 {h.note}</p>}
                <div className="chips">
                  {h.items.map((it, i) => <span key={i} className="chip">{exById[it.exId]?.emoji} {exById[it.exId]?.name}</span>)}
                </div>
                <div className="hw-actions">
                  <span className="muted small">{h.log.length ? `Выполнено: ${h.log.length}` : 'Ещё не начато'}{h.requirePhoto ? ' · 📸 фото-отчёт' : ''}</span>
                  <div className="row-gap">
                    <button className="circle-btn" aria-label="Удалить" onClick={() => confirm('Удалить задание?') && dispatch({ type: 'hw:del', id: h.id })}><Icon name="trash" size={18} /></button>
                    <button className="btn small" onClick={() => startHw(h)}><Icon name="play" size={14} fill="currentColor" /> {ok ? 'Ещё раз' : 'Начать'}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AddHomework open={adding} onClose={() => setAdding(false)} onSave={(hw) => { dispatch({ type: 'hw:add', hw }); setAdding(false); setTab('active'); }} />
      <Sheet open={!!lib} onClose={() => setLib(null)} title={lib?.name || ''}>
        {lib && <ExerciseInfo ex={lib} />}
      </Sheet>
    </div>
  );
}

const fmt = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

function Library({ onOpen }) {
  return (
    <div className="stack">
      {Object.entries(CATEGORIES).map(([k, c]) => (
        <section key={k}>
          <div className="section-head"><h2>{c.emoji} {c.title}</h2></div>
          <div className="list glass">
            {EXERCISES.filter((e) => e.cat === k).map((e) => (
              <button key={e.id} className="list-row" onClick={() => onOpen(e)}>
                <span className="tile-ico" style={{ background: `${c.tint}33` }}>{e.emoji}</span>
                <div className="grow"><b>{e.name}</b><small>{e.mode === 'time' ? `${e.amount} сек` : `${e.amount} раз`}</small></div>
                <Icon name="chevron" size={18} style={{ opacity: 0.35 }} />
              </button>
            ))}
          </div>
        </section>
      ))}
      <p className="footnote">Упражнения подобраны для младшей группы (4–7 лет). Удержания короткие, растяжка — только до приятного натяжения. Перед новыми элементами (мостик, шпагаты) — посоветуйтесь с тренером.</p>
    </div>
  );
}

export function ExerciseInfo({ ex }) {
  return (
    <div className="ex-info">
      <div className="ex-hero" style={{ '--tint': CATEGORIES[ex.cat].tint }}>{ex.emoji}</div>
      <p className="pill center-self">{CATEGORIES[ex.cat].title} · {ex.mode === 'time' ? `${ex.amount} сек` : `${ex.amount} раз`}</p>
      <ol className="steps">{ex.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      <div className="tip">💡 {ex.tip}</div>
    </div>
  );
}

function AddHomework({ open, onClose, onSave }) {
  const [mode, setMode] = useState('program');
  const [prog, setProg] = useState(PROGRAMS[0].id);
  const [picked, setPicked] = useState([]);
  const [title, setTitle] = useState('');
  const [repeat, setRepeat] = useState('daily');
  const [due, setDue] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return ymd(d); });
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(true);
  const [from, setFrom] = useState('Тренер');

  const save = () => {
    if (mode === 'program') {
      onSave(fromProgram(PROGRAMS.find((p) => p.id === prog), { repeat, due, note, requirePhoto: photo, from }));
    } else {
      if (!picked.length) return;
      onSave({ id: uid(), title: title || 'Моё задание', emoji: '🎀', color: ['#ffb3d9', '#b07cff'], items: picked.map((exId) => ({ exId })),
        from, repeat, due, note, requirePhoto: photo, createdAt: Date.now(), log: [] });
    }
    setPicked([]); setTitle(''); setNote('');
  };
  const toggle = (id) => setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  return (
    <Sheet open={open} onClose={onClose} title="Новое задание" action={<button className="text-btn" onClick={save}>Готово</button>}>
      <Segmented value={mode} onChange={setMode} options={[{ value: 'program', label: 'Готовый комплекс' }, { value: 'custom', label: 'Собрать своё' }]} />
      {mode === 'program' ? (
        <div className="prog-grid">
          {PROGRAMS.map((p) => (
            <button key={p.id} className={`prog ${prog === p.id ? 'on' : ''}`} style={{ '--c1': p.color[0], '--c2': p.color[1] }} onClick={() => setProg(p.id)}>
              <span>{p.emoji}</span><b>{p.title}</b><small>{p.items.length} упр.</small>
            </button>
          ))}
        </div>
      ) : (
        <>
          <label className="field glass-thin"><span>Название</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например, «Растяжка на неделю»" /></label>
          <div className="chips pick">
            {EXERCISES.map((e) => (
              <button key={e.id} className={`chip ${picked.includes(e.id) ? 'on' : ''}`} onClick={() => toggle(e.id)}>
                {picked.includes(e.id) && <em>{picked.indexOf(e.id) + 1}</em>}{e.emoji} {e.name}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="list glass-thin form">
        <label className="list-row"><span className="grow">От кого</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)}><option>Тренер</option><option>Мама</option><option>Папа</option><option>Сама</option></select></label>
        <label className="list-row"><span className="grow">Повторять</span>
          <select value={repeat} onChange={(e) => setRepeat(e.target.value)}><option value="daily">Каждый день</option><option value="once">Один раз</option></select></label>
        <label className="list-row"><span className="grow">{repeat === 'daily' ? 'До даты' : 'Сдать до'}</span>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
        <label className="list-row"><span className="grow">Фото-отчёт для тренера</span>
          <input type="checkbox" className="switch" checked={photo} onChange={(e) => setPhoto(e.target.checked)} /></label>
      </div>
      <label className="field glass-thin"><span>Комментарий тренера</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Например, «следим за носочками»" /></label>
    </Sheet>
  );
}
