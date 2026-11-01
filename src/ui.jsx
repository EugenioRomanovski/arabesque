import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const paths = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  calendar: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4',
  bag: 'M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  camera: 'M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  play: 'M8 5v14l11-7z',
  pause: 'M8 5v14M16 5v14',
  trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  pin: 'M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6',
  share: 'M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  refresh: 'M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5',
};
export function Icon({ name, size = 22, stroke = 2, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function Sheet({ open, onClose, title, children, action }) {
  const [shown, setShown] = useState(open);
  useEffect(() => { if (open) setShown(true); else { const t = setTimeout(() => setShown(false), 320); return () => clearTimeout(t); } }, [open]);
  if (!shown) return null;
  return createPortal(
    <div className={`sheet-wrap ${open ? 'in' : 'out'}`} onClick={onClose}>
      <div className="sheet glass" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="grabber" />
        <div className="sheet-head">
          <button className="circle-btn" onClick={onClose} aria-label="Закрыть"><Icon name="close" size={18} /></button>
          <h3>{title}</h3>
          {action || <span style={{ width: 36 }} />}
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Segmented({ value, onChange, options }) {
  const i = options.findIndex((o) => o.value === value);
  return (
    <div className="segmented glass-thin" style={{ '--n': options.length, '--i': i }}>
      <span className="seg-thumb" />
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 7, color = 'var(--pink)', children }) {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--track)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  );
}

// Персонаж-помощница (заглушка: финальный образ проработаем отдельно)
export const MASCOT_NAME = 'Ари';
export function Mascot({ size = 72, mood = 'happy' }) {
  return (
    <div className={`mascot mood-${mood}`} style={{ width: size, height: size }} aria-label={`${MASCOT_NAME} — помощница`}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id="mhair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a4a3a" /><stop offset="1" stopColor="#5a3226" /></linearGradient>
        </defs>
        <circle cx="50" cy="20" r="11" fill="url(#mhair)" />
        <circle cx="50" cy="20" r="4" fill="#ff7eb6" />
        <circle cx="50" cy="48" r="26" fill="url(#mhair)" />
        <circle cx="50" cy="52" r="21" fill="#ffe0cf" />
        <path d="M30 44 Q50 26 70 44 Q60 36 50 37 Q40 36 30 44Z" fill="url(#mhair)" />
        <ellipse cx="42" cy="53" rx="2.6" ry={mood === 'wow' ? 3.6 : 3} fill="#3a2430" />
        <ellipse cx="58" cy="53" rx="2.6" ry={mood === 'wow' ? 3.6 : 3} fill="#3a2430" />
        <circle cx="36" cy="60" r="3.5" fill="#ff9fc4" opacity=".6" />
        <circle cx="64" cy="60" r="3.5" fill="#ff9fc4" opacity=".6" />
        {mood === 'wow'
          ? <ellipse cx="50" cy="64" rx="4" ry="4.5" fill="#d2456f" />
          : <path d="M44 62 Q50 68 56 62" stroke="#d2456f" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        <path d="M30 86 Q50 70 70 86 L72 100 L28 100Z" fill="#ff7eb6" />
        <path d="M34 84 Q50 76 66 84" stroke="#fff" strokeOpacity=".6" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

export function Confetti({ run }) {
  if (!run) return null;
  const bits = Array.from({ length: 42 }, (_, i) => i);
  const colors = ['#ff7eb6', '#b07cff', '#5ac8fa', '#ffcf70', '#34c79a', '#ff9f6b'];
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((i) => (
        <i key={i} style={{
          left: `${(i * 37) % 100}%`, background: colors[i % colors.length],
          animationDelay: `${(i % 7) * 0.06}s`, animationDuration: `${1.6 + (i % 5) * 0.25}s`,
          transform: `rotate(${i * 29}deg)`,
        }} />
      ))}
    </div>
  );
}

export function Empty({ emoji, title, text }) {
  return <div className="empty"><div className="empty-emoji">{emoji}</div><b>{title}</b><p>{text}</p></div>;
}

export function haptic(ms = 8) { try { navigator.vibrate?.(ms); } catch { /* noop */ } }

// Строка со смахиванием влево для удаления (как в iOS):
// короткий свайп — открывает кнопку «Удалить», длинный — удаляет сразу.
const REVEAL = 92;
export function SwipeRow({ onDelete, children, label = 'Удалить' }) {
  const [dx, setDx] = useState(0);
  const [drag, setDrag] = useState(false);
  const [gone, setGone] = useState(false);
  const st = useRef(null);
  const moved = useRef(false);
  const box = useRef();

  const commit = () => {
    haptic(20);
    setDx(-(box.current?.offsetWidth || 400));
    setTimeout(() => setGone(true), 180);
    setTimeout(() => onDelete(), 420);
  };
  const down = (e) => { st.current = { x: e.clientX, y: e.clientY, base: dx, lock: null, id: e.pointerId }; moved.current = false; };
  const move = (e) => {
    const s = st.current; if (!s) return;
    const mx = e.clientX - s.x, my = e.clientY - s.y;
    if (!s.lock) {
      if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) { s.lock = 'x'; setDrag(true); e.currentTarget.setPointerCapture?.(s.id); }
      else if (Math.abs(my) > 8) { s.lock = 'y'; }
    }
    if (s.lock !== 'x') return;
    moved.current = true;
    let v = s.base + mx;
    if (v > 0) v = v / 4; // резинка вправо
    setDx(v);
  };
  const up = () => {
    const s = st.current; st.current = null; if (!s || s.lock !== 'x') return;
    setDrag(false);
    const w = box.current?.offsetWidth || 360;
    if (dx < -w * 0.5) commit();
    else if (dx < -REVEAL / 2) { setDx(-REVEAL); haptic(6); }
    else setDx(0);
  };
  const clickCapture = (e) => {
    if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; return; }
    if (dx !== 0) { e.preventDefault(); e.stopPropagation(); setDx(0); }
  };
  const open = -dx;
  return (
    <div className={`swipe ${gone ? 'gone' : ''}`}>
      <div className="swipe-inner" ref={box}>
        <button className={`swipe-del ${open > (box.current?.offsetWidth || 360) * 0.5 ? 'armed' : ''}`} style={{ width: Math.max(0, open) }} onClick={commit} aria-label={label} tabIndex={open > 0 ? 0 : -1}>
          <span><Icon name="trash" size={20} /><small>{label}</small></span>
        </button>
        <div className="swipe-content" style={{ transform: `translateX(${dx}px)`, transition: drag ? 'none' : 'transform .38s cubic-bezier(.2,.9,.25,1)' }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={clickCapture}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function UndoBar({ text, onUndo }) {
  return (
    <div className="undo glass" role="status">
      <span>{text}</span>
      <button onClick={onUndo}>Отменить</button>
    </div>
  );
}
