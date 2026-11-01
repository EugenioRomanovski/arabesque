import { Mascot } from '../ui.jsx';
export default function Teacher() {
  const code = new URLSearchParams(location.search).get('code');
  return (
    <div className="onboarding">
      <div className="player-bg" />
      <div className="ob-body">
        <Mascot size={120} />
        <h1>Кабинет тренера</h1>
        <p>Вас пригласили смотреть фото-отчёты домашних заданий{code ? <> (код <b>{code}</b>)</> : ''}.</p>
        <div className="card glass"><p>Кабинет тренера скоро откроется: здесь можно будет назначать задания, смотреть фото и ставить оценки-звёздочки. Сохраните ссылку — она заработает после обновления.</p></div>
        <a className="btn big" href="/">Открыть приложение</a>
      </div>
    </div>
  );
}
