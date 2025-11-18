import { useEffect, useState } from 'react';
import { api } from '../api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useToasts } from './ui/ToastProvider';

export function Clients() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ primer_nombre:'', segundo_nombre:'', primer_apellido:'', segundo_apellido:'', fecha_nac:'', cedula:'', correo:'', contrasena:'' });
  const toasts = useToasts();

  const load = async () => {
    setLoading(true); setError(null);
    try { const data = await api.clientes.list(); setClientes(data); } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.clientes.create(form);
      toasts.push('Cliente creado', { type:'success' });
      setForm({ primer_nombre:'', segundo_nombre:'', primer_apellido:'', segundo_apellido:'', fecha_nac:'', cedula:'', correo:'', contrasena:'' });
      load();
    } catch(e){ setError(e.message); toasts.push('Error al crear cliente', { type:'error' }); }
  };

  return (
    <Card title="Clientes" actions={<Button onClick={load} variant="secondary">Refrescar</Button>}>
      <form onSubmit={submit} className="form-grid" aria-label="Formulario creación cliente">
        {Object.entries({primer_nombre:'Primer Nombre', segundo_nombre:'Segundo Nombre', primer_apellido:'Primer Apellido', segundo_apellido:'Segundo Apellido', fecha_nac:'Fecha Nac', cedula:'Cédula', correo:'Correo', contrasena:'Contraseña'}).map(([k,label]) => (
          <input
            key={k}
            type={k==='fecha_nac'?'date': k==='correo'?'email': k==='contrasena'?'password':'text'}
            placeholder={label}
            value={form[k]}
            onChange={e=> setForm(f=>({...f,[k]:e.target.value}))}
            required={['segundo_nombre','segundo_apellido'].includes(k)?false:true}
            aria-label={label}
          />
        ))}
        <Button type="submit">Crear</Button>
      </form>
      {loading && <div className="loading-row"><Spinner size={28}/> <span>Cargando clientes...</span></div>}
      {error && <p className="error" role="alert">{error}</p>}
      <ul aria-live="polite">{clientes.map(c=> <li key={c.pk_id_cliente}><span>{c.primer_nombre} {c.primer_apellido}</span><span className="meta">{c.correo}</span></li>)}</ul>
    </Card>
  );
}
