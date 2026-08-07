import './Sidebar.css';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🚦</div>

        <div>
          <h2>Nexiora Signal</h2>
          <p>Movilidad inteligente</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="active">🗺️ Mapa</button>
        <button>📋 Reportes</button>
        <button>⚠️ Alertas</button>
        <button>📈 Estadísticas</button>
        <button>⚙️ Configuración</button>
      </nav>

      <div className="sidebar-footer">
        <strong>Nexiora Signal</strong>
        <span>v2.0</span>
      </div>
    </aside>
  );
}