import { useState } from 'react';
import { ProductCatalog } from './components/ProductCatalog';
import { Login } from './components/Login';
import { Cart } from './components/Cart';
import { Shipping } from './components/Shipping';
import { Orders } from './components/Orders';
import { Sales } from './components/Sales';
import { Clients } from './components/Clients';
import { Products } from './components/Products';
import { ThemeToggle } from './components/ThemeToggle';
import { Button } from './components/ui/Button';
import { useAuth } from './context/AuthContext';
import './app.css';

const customerTabs = [
  { id: 'catalogo', label: 'Catálogo', icon: '🛍️', component: <ProductCatalog /> },
  { id: 'carrito', label: 'Mi Carrito', icon: '🛒', component: <Cart /> },
  { id: 'pedidos', label: 'Mis Pedidos', icon: '🧾', component: <Orders /> }
];

const adminTabs = [
  { id: 'clientes', label: 'Clientes', icon: '👥', component: <Clients /> },
  { id: 'productos', label: 'Productos', icon: '📦', component: <Products /> },
  { id: 'envios', label: 'Envíos', icon: '🚚', component: <Shipping /> },
  { id: 'pedidos', label: 'Pedidos', icon: '🧾', component: <Orders /> },
  { id: 'ventas', label: 'Ventas', icon: '💰', component: <Sales /> }
];

function Shell() {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState('customer');
  const tabs = mode === 'admin' ? adminTabs : customerTabs;
  const [active, setActive] = useState(tabs[0]?.id);

  if (!user) {
    return (
      <div className="app-shell">
        <div className="main-area" style={{ margin: 0 }}>
          <header className="topbar">
            <div className="topbar-left">
              <h2>🛍️ Tienda Virtual</h2>
            </div>
            <div className="topbar-right">
              <ThemeToggle compact />
            </div>
          </header>
          <main className="content">
            <Login />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">🛍️</span>
          <div className="brand-text">
            <h1>Tienda Virtual</h1>
            <small>{user.correo}</small>
          </div>
        </div>
        <div className="mode-toggle">
          <button className={mode === 'customer' ? 'active' : ''} onClick={() => { setMode('customer'); setActive('catalogo'); }}>Cliente</button>
          <button className={mode === 'admin' ? 'active' : ''} onClick={() => { setMode('admin'); setActive('clientes'); }}>Admin</button>
        </div>
        <nav className="nav-vertical">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={active === t.id ? 'active' : ''}
            >
              <span className="icon" aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <ThemeToggle />
          <Button onClick={logout} variant="secondary" style={{ marginTop: '0.5rem', width:'100%' }}>Cerrar Sesión</Button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h2>{tabs.find(t => t.id === active)?.label}</h2>
          </div>
          <div className="topbar-right">
            <ThemeToggle compact />
          </div>
        </header>
        <main className="content">
          {tabs.map(t => active === t.id && (
            <div key={t.id} className="view-wrapper fade-in">
              {t.component}
            </div>
          ))}
        </main>
        <footer className="footer">
          <small>&copy; 2025 Tienda Virtual</small>
        </footer>
      </div>
    </div>
  );
}

export function App() {
  return <Shell />;
}
