import { useEffect, useState } from 'react';
import { useStore, uid, getPhoto } from '../store.jsx';
import { Icon, Sheet } from '../ui.jsx';

export default function Profile({ open, onClose }) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [t, setT] = useState({ name: '', contact: '' });
  const p = state.profile;

  const addTeacher = () => {
    if (!t.name.trim()) return;
    const code = 'ARB-' + uid().slice(0, 4).toUpperCase();
    dispatch({ type: 'teacher:add', teacher: { id: uid(), name: t.name.trim(), contact: t.contact.trim(), code, status: 'invited', addedAt: Date.now() } });
    setT({ name: '', contact: '' }); setAdding(false);
  };
  const invite = async (tc) => {
    const url = `${location.origin}/teacher?code=${tc.code}`;
    const text = `Здравствуйте! Приглашаю вас в Arabesque, чтобы видеть фото-отчёты домашних заданий ${p.name || 'моей дочки'}. Код: ${tc.code}`;
    try { if (navigator.share) await navigator.share({ title: 'Arabesque', text, url }); else { await navigator.clipboard.writeText(`${text}\n${url}`); alert('Приглашение скопировано'); } } catch { /* cancelled */ }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Профиль">
      <div className="list glass-thin form">
        <label className="list-row"><span>Имя</span><input value={p.name} onChange={(e) => dispatch({ type: 'profile', patch: { name: e.target.value } })} placeholder="Имя гимнастки" /></label>
        <label className="list-row"><span className="grow">Возраст</span>
          <select value={p.age} onChange={(e) => dispatch({ type: 'profile', patch: { age: Number(e.target.value) } })}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((a) => <option key={a} value={a}>{a} лет</option>)}
          </select></label>
      </div>

      <div className="section-head"><h2>Тренер</h2></div>
      <div className="list glass-thin">
        {state.teachers.map((tc) => (
          <div key={tc.id} className="list-row">
            <span className="tile-ico" style={{ background: 'linear-gradient(135deg,#d7a6ff,#9f7bff)' }}>👩‍🏫</span>
            <div className="grow"><b>{tc.name}</b><small>Код {tc.code} · ожидает подключения</small></div>
            <button className="circle-btn" onClick={() => invite(tc)} aria-label="Отправить приглашение"><Icon name="share" size={18} /></button>
            <button className="circle-btn" onClick={() => dispatch({ type: 'teacher:del', id: tc.id })} aria-label="Удалить"><Icon name="trash" size={18} /></button>
          </div>
        ))}
        {adding ? (
          <div className="teacher-form">
            <input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} placeholder="Имя тренера" autoFocus />
            <input value={t.contact} onChange={(e) => setT({ ...t, contact: e.target.value })} placeholder="Телефон или email (необязательно)" />
            <button className="btn" onClick={addTeacher}>Добавить</button>
          </div>
        ) : (
          <button className="list-row link-row" onClick={() => setAdding(true)}><Icon name="plus" size={18} /> Добавить тренера</button>
        )}
      </div>
      <p className="footnote">Тренер получит приглашение и сможет смотреть фото-отчёты. Кабинет тренера появится в следующем обновлении — до этого фото хранятся только на этом устройстве.</p>

      <div className="section-head"><h2>Фото-отчёты</h2><span className="muted">{state.reports.length}</span></div>
      {state.reports.length === 0 ? <p className="footnote">После выполнения задания можно сделать фото — оно появится здесь.</p> : (
        <div className="photo-grid">{state.reports.map((r) => <Report key={r.id} r={r} />)}</div>
      )}

      <button className="btn danger" onClick={() => confirm('Сбросить все данные приложения?') && dispatch({ type: 'reset' })}>Сбросить данные</button>
      <p className="footnote center">Arabesque · v0.1</p>
    </Sheet>
  );
}

function Report({ r }) {
  const { dispatch } = useStore();
  const [url, setUrl] = useState(null);
  useEffect(() => { let u; getPhoto(r.photoId).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u); } }); return () => u && URL.revokeObjectURL(u); }, [r.photoId]);
  return (
    <figure className="report">
      {url ? <img src={url} alt={r.title} /> : <div className="ph" />}
      <figcaption>
        <b>{r.title}</b><small>{new Date(r.date).toLocaleDateString('ru-RU')}</small>
        <button className={`share-tag ${r.shared ? 'on' : ''}`} onClick={() => dispatch({ type: 'report:share', id: r.id })}>{r.shared ? '👁 Видно тренеру' : '🔒 Только мне'}</button>
      </figcaption>
    </figure>
  );
}
