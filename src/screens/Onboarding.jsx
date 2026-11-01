import { useState } from 'react';
import { useStore } from '../store.jsx';
import { Mascot, MASCOT_NAME } from '../ui.jsx';

export default function Onboarding() {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  return (
    <div className="onboarding">
      <div className="player-bg" />
      <div className="ob-body">
        <Mascot size={150} />
        <h1>Привет! Я {MASCOT_NAME}</h1>
        <p>Я буду заниматься вместе с тобой, хвалить за каждое упражнение и дарить звёздочки ⭐</p>
        <div className="card glass ob-form">
          <label>Как тебя зовут?</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" autoFocus />
          <label>Сколько тебе лет?</label>
          <div className="age-row">
            {[4, 5, 6, 7, 8].map((a) => <button key={a} className={a === age ? 'on' : ''} onClick={() => setAge(a)}>{a}</button>)}
          </div>
        </div>
        <button className="btn big" disabled={!name.trim()} onClick={() => dispatch({ type: 'profile', patch: { name: name.trim(), age, onboarded: true } })}>Начнём! 🩰</button>
      </div>
    </div>
  );
}
