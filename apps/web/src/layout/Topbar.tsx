import './Topbar.css';

interface TopbarProps {
  userName?: string;
}

export function Topbar({ userName = 'Sebastian' }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-icon">🔍</span>

        <input
          type="text"
          placeholder="Buscar dirección, lugar o semáforo..."
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-button">🔔</button>

        <div className="user-card">
          <div className="avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>Hola, {userName}</strong>
            <p>Operador</p>
          </div>
        </div>
      </div>
    </header>
  );
}