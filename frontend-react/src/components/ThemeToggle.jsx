import { useEffect, useState } from 'react';

export function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <button className={compact ? 'btn-toggle compact' : 'btn-toggle'} onClick={toggle} aria-label="Cambiar tema">
      {theme === 'light' ? '🌙 Oscuro' : '☀️ Claro'}
    </button>
  );
}
