import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { Icon, Segmented, Confetti, haptic } from '../ui.jsx';

export default function Lists() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('bag');
  const [text, setText] = useState('');
  const [party, setParty] = useState(false);
  const items = state.lists[tab];
  const doneCount = items.filter((i) => i.done).length;
  const bagReady = tab === 'bag' && items.length > 0 && doneCount === items.length;

  useEffect(() => {
    if (bagReady) { dispatch({ type: 'badge', id: 'bag' }); setParty(true); const t = setTimeout(() => setParty(false), 2400); return () => clearTimeout(t); }
  }, [bagReady]); // eslint-disable-line

  const add = (e) => { e.preventDefault(); if (!text.trim()) return; dispatch({ type: 'list:add', list: tab, text: text.trim() }); setText(''); };
  const row = (i) => (
    <div key={i.id} className={`check-row ${i.done ? 'done' : ''}`}>
      <button className="check" onClick={() => { haptic(); dispatch({ type: 'list:toggle', list: tab, id: i.id }); }} aria-label={i.text}>
        {i.done && <Icon name="check" size={16} stroke={3} />}
      </button>
      <span className="grow">{i.text}</span>
      <button className="del" onClick={() => dispatch({ type: 'list:del', list: tab, id: i.id })} aria-label="Удалить"><Icon name="close" size={16} /></button>
    </div>
  );

  return (
    <div className="screen">
      <Confetti run={party} />
      <header className="large-title"><h1>Чеклисты</h1></header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'bag', label: '🎒 Взять с собой' }, { value: 'buy', label: '🛍️ Покупки' }]} />

      {tab === 'bag' ? (
        <>
          <div className="card glass bag-hero">
            <div className="bag-emoji">{bagReady ? '🎉' : '🎒'}</div>
            <div className="grow">
              <b>{bagReady ? 'Сумка собрана!' : 'Собираемся на тренировку'}</b>
              <small>{doneCount} из {items.length} вещей</small>
              <div className="bar"><i style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }} /></div>
            </div>
            <button className="circle-btn" onClick={() => dispatch({ type: 'list:reset', list: 'bag' })} aria-label="Собрать заново"><Icon name="refresh" size={18} /></button>
          </div>
          <div className="list glass">{items.map(row)}</div>
        </>
      ) : (
        <>
          <div className="section-head"><h2>Нужно купить</h2><span className="muted">{items.filter((i) => !i.done).length}</span></div>
          <div className="list glass">{items.filter((i) => !i.done).map(row)}{items.every((i) => i.done) && <div className="list-row muted">Всё куплено ✨</div>}</div>
          <div className="section-head"><h2>Куплено</h2><span className="muted">{doneCount}</span></div>
          <div className="list glass">{items.filter((i) => i.done).map(row)}{doneCount === 0 && <div className="list-row muted">Пока ничего</div>}</div>
        </>
      )}

      <form className="add-row glass" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={tab === 'bag' ? 'Добавить вещь…' : 'Что нужно купить?'} />
        <button className="circle-btn tinted" aria-label="Добавить"><Icon name="plus" size={18} /></button>
      </form>
    </div>
  );
}
