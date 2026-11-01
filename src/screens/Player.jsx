import { useEffect, useRef, useState } from 'react';
import { useStore, savePhoto, shrink, uid, ymd } from '../store.jsx';
import { exById, CATEGORIES } from '../data/exercises.js';
import { Icon, Ring, Mascot, MASCOT_NAME, Confetti, haptic } from '../ui.jsx';

const cheers = ['Умница!', 'Супер!', 'Так держать!', 'Ты молодец!', 'Здорово!', 'Красиво!'];

export default function Player({ hw, onClose }) {
  const { state, dispatch } = useStore();
  const [idx, setIdx] = useState(-1); // -1 intro, items.length = finish
  const [left, setLeft] = useState(0);
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [cheer, setCheer] = useState('');
  const [saved, setSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const fileRef = useRef();
  const items = hw.items.map((i) => exById[i.exId]).filter(Boolean);
  const ex = items[idx];
  const finished = idx >= items.length;
  const teacher = state.teachers[0];

  useEffect(() => {
    if (!ex) return;
    setLeft(ex.amount); setCount(0); setRunning(false);
  }, [idx]); // eslint-disable-line

  useEffect(() => {
    if (!running || !ex || ex.mode !== 'time') return;
    if (left <= 0) { setRunning(false); haptic(30); beep(); return; }
    const t = setTimeout(() => { setLeft((l) => l - 1); if (left <= 4) beep(0.04); }, 1000);
    return () => clearTimeout(t);
  }, [running, left, ex]);

  useEffect(() => {
    if (finished && !saved) {
      dispatch({ type: 'hw:complete', id: hw.id, stars: items.length + 3 });
      setSaved(true);
    }
  }, [finished]); // eslint-disable-line

  const next = () => {
    haptic(12);
    setCheer(cheers[Math.floor(Math.random() * cheers.length)]);
    setTimeout(() => setCheer(''), 900);
    setIdx((i) => i + 1);
  };
  const exDone = ex && (ex.mode === 'time' ? left <= 0 : count >= ex.amount);

  const onPhoto = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const blob = await shrink(f);
    const photoId = await savePhoto(blob);
    setPhotoUrl(URL.createObjectURL(blob));
    dispatch({ type: 'report:add', report: { id: uid(), hwId: hw.id, title: hw.title, date: ymd(), photoId, shared: !!teacher } });
  };

  return (
    <div className="player" style={{ '--c1': hw.color[0], '--c2': hw.color[1] }}>
      <div className="player-bg" />
      <header className="player-head">
        <button className="circle-btn glass-thin" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={18} /></button>
        <div className="progress-dots">
          {items.map((_, i) => <span key={i} className={i < idx ? 'done' : i === idx ? 'cur' : ''} />)}
        </div>
        <span className="pill glass-thin">⭐ {Math.max(0, Math.min(idx, items.length))}</span>
      </header>

      {idx === -1 && (
        <div className="player-body center">
          <Mascot size={120} />
          <h2 className="player-title">{hw.title}</h2>
          <p className="player-sub">{items.length} упражнений · за каждое — звёздочка ⭐</p>
          {hw.note && <div className="tip glass-thin">💬 {hw.note}</div>}
          <div className="mini-list glass-thin">{items.map((e, i) => <span key={i}>{e.emoji} {e.name}</span>)}</div>
          <button className="btn big" onClick={() => setIdx(0)}><Icon name="play" size={18} fill="currentColor" /> Поехали!</button>
          <p className="footnote">Занимайтесь на коврике, в удобной одежде. Растяжка — без боли.</p>
        </div>
      )}

      {ex && (
        <div className="player-body" key={ex.id}>
          <p className="eyebrow center">{CATEGORIES[ex.cat].emoji} {CATEGORIES[ex.cat].title} · {idx + 1} из {items.length}</p>
          <h2 className="player-title">{ex.name}</h2>
          <div className="ex-stage glass">
            {ex.mode === 'time' ? (
              <Ring value={1 - left / ex.amount} size={210} stroke={14} color="#fff">
                <span className="big-emoji">{ex.emoji}</span>
                <b className="timer">{left}</b>
              </Ring>
            ) : (
              <button className="rep-btn" onClick={() => { if (count < ex.amount) { setCount((c) => c + 1); haptic(); } }}>
                <Ring value={count / ex.amount} size={210} stroke={14} color="#fff">
                  <span className="big-emoji">{ex.emoji}</span>
                  <b className="timer">{count}<small>/{ex.amount}</small></b>
                </Ring>
                <small className="tap-hint">{count < ex.amount ? 'Нажимай на каждый раз' : 'Готово!'}</small>
              </button>
            )}
          </div>
          <ol className="steps glass-thin">{ex.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <div className="tip glass-thin">💡 {ex.tip}</div>
          <div className="player-actions">
            {ex.mode === 'time' && !exDone && (
              <button className="btn big ghost" onClick={() => setRunning((r) => !r)}>
                <Icon name={running ? 'pause' : 'play'} size={18} fill={running ? 'none' : 'currentColor'} /> {running ? 'Пауза' : left === ex.amount ? 'Старт' : 'Дальше'}
              </button>
            )}
            <button className={`btn big ${exDone ? '' : 'ghost'}`} onClick={next}>
              {exDone ? <><Icon name="check" size={18} /> Сделала!</> : 'Пропустить'}
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="player-body center">
          <Confetti run />
          <Mascot size={130} mood="wow" />
          <h2 className="player-title">Ура! Задание выполнено!</h2>
          <p className="player-sub">{MASCOT_NAME} гордится тобой. Ты получила <b>+{items.length + 3} ⭐</b></p>
          {hw.requirePhoto && (
            <div className="card glass photo-card">
              {photoUrl ? (
                <>
                  <img src={photoUrl} alt="Фото-отчёт" />
                  <p><b>+2 ⭐</b> за фото-отчёт! {teacher ? `Фото будет доступно тренеру ${teacher.name}.` : 'Добавь тренера в профиле, чтобы он видел фото.'}</p>
                </>
              ) : (
                <>
                  <p><b>Фото-отчёт для тренера</b><br /><span className="muted">Попроси маму или папу сфотографировать твою лучшую позу.</span></p>
                  <button className="btn" onClick={() => fileRef.current?.click()}><Icon name="camera" size={18} /> Сделать фото</button>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} />
                </>
              )}
            </div>
          )}
          <button className="btn big ghost" onClick={onClose}>Готово</button>
        </div>
      )}

      {cheer && <div className="cheer">{cheer}</div>}
    </div>
  );
}

let ac;
function beep(vol = 0.12) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.frequency.value = vol > 0.1 ? 880 : 660; g.gain.value = vol;
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.15);
  } catch { /* noop */ }
}
