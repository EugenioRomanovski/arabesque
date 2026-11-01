import { useStore, streak } from '../store.jsx';
import { BADGES, STICKERS } from '../rewards.js';
import { Icon, Ring, Mascot } from '../ui.jsx';

export default function Rewards() {
  const { state } = useStore();
  const nextSticker = STICKERS.find((s) => s.cost > state.stars);
  const prev = [...STICKERS].reverse().find((s) => s.cost <= state.stars)?.cost || 0;
  const earned = Object.keys(state.badges).length;
  return (
    <div className="screen">
      <header className="large-title"><h1>Награды</h1></header>
      <section className="card glass reward-hero">
        <Ring value={nextSticker ? (state.stars - prev) / (nextSticker.cost - prev) : 1} size={108} stroke={10} color="#ffb340">
          <Icon name="star" size={28} fill="#ffb340" stroke={0} />
          <b className="ring-big">{state.stars}</b>
        </Ring>
        <div className="grow">
          <b>{state.stars} звёздочек</b>
          <p className="muted small">{nextSticker ? <>До наклейки {nextSticker.emoji} «{nextSticker.title}» — ещё {nextSticker.cost - state.stars} ⭐</> : 'Все наклейки собраны! 👑'}</p>
          <p className="muted small">🔥 Серия: {streak(state.activity)} · 🏅 Значков: {earned}/{BADGES.length}</p>
        </div>
      </section>

      <div className="section-head"><h2>Наклейки</h2><span className="muted">за звёздочки</span></div>
      <div className="sticker-grid">
        {STICKERS.map((s) => {
          const on = state.stars >= s.cost;
          return (
            <div key={s.id} className={`sticker glass ${on ? 'on' : ''}`}>
              <span>{on ? s.emoji : '🔒'}</span>
              <small>{on ? s.title : `${s.cost} ⭐`}</small>
            </div>
          );
        })}
      </div>

      <div className="section-head"><h2>Значки</h2><span className="muted">+5 ⭐ за каждый</span></div>
      <div className="list glass">
        {BADGES.map((b) => {
          const at = state.badges[b.id];
          return (
            <div key={b.id} className={`list-row badge-row ${at ? '' : 'locked'}`}>
              <span className="badge-ico">{b.emoji}</span>
              <div className="grow"><b>{b.title}</b><small>{at ? `Получен ${new Date(at).toLocaleDateString('ru-RU')}` : b.desc}</small></div>
              {at && <Icon name="check" size={18} style={{ color: 'var(--green)' }} />}
            </div>
          );
        })}
      </div>
      <div className="card glass mascot-card soon">
        <Mascot size={56} />
        <p className="muted small">Скоро: наряды и причёски для Ари за звёздочки, призы от тренера и семейные награды.</p>
      </div>
    </div>
  );
}
