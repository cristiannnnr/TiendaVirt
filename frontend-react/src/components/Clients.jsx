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
  const [updatingAdmin, setUpdatingAdmin] = useState(null);
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
      toasts.addToast('Cliente creado', { type:'success' });
      setForm({ primer_nombre:'', segundo_nombre:'', primer_apellido:'', segundo_apellido:'', fecha_nac:'', cedula:'', correo:'', contrasena:'' });
      load();
    } catch(e){ setError(e.message); toasts.addToast('Error al crear cliente', { type:'error' }); }
  };

  const toggleAdmin = async (clienteId, currentValue) => {
    setUpdatingAdmin(clienteId);
    try {
      const updated = await api.clientes.updateAdmin(clienteId, !currentValue);
      setClientes(clientes.map(c => c.pk_id_cliente === clienteId ? updated : c));
      toasts.addToast(
        `${updated.primer_nombre} es ahora ${updated.es_administrador ? 'administrador' : 'cliente'}`,
        { type:'success' }
      );
    } catch(e){
      toasts.addToast('Error actualizando estado admin', { type:'error' });
    } finally {
      setUpdatingAdmin(null);
    }
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
      <div className="clients-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Administrador</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            {clientes.map(c => (
              <tr key={c.pk_id_cliente}>
                <td>{c.primer_nombre} {c.primer_apellido}</td>
                <td>{c.correo}</td>
                <td style={{ textAlign: 'center' }}>
                  {c.es_administrador ? '✅ Sí' : '❌ No'}
                </td>
                <td>
                  <Button
                    onClick={() => toggleAdmin(c.pk_id_cliente, c.es_administrador)}
                    disabled={updatingAdmin === c.pk_id_cliente}
                    variant="tertiary"
                    size="small"
                  >
                    {updatingAdmin === c.pk_id_cliente ? (
                      <Spinner size={16} />
                    ) : c.es_administrador ? (
                      'Remover Admin'
                    ) : (
                      'Hacer Admin'
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
