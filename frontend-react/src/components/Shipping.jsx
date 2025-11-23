import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { SkeletonList } from './ui/Skeleton';
import { useToasts } from './ui/ToastProvider';

export function Shipping(){
  const [envios,setEnvios]=useState([]);
  const [form,setForm]=useState({tipo_envio:'',costo_envio:''});
  const [error,setError]=useState(null);
  const [loading,setLoading]=useState(false);
  const { user } = useAuth();
  const toasts = useToasts();

  const load=async()=>{
    setLoading(true); setError(null);
    try { const data = await api.envios.list(); setEnvios(data); } catch(e){ setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const submit=async(e)=>{
    e.preventDefault();
    try { await api.envios.create({...form,costo_envio:parseFloat(form.costo_envio||'0')}); toasts.addToast('Envío creado',{type:'success'}); setForm({tipo_envio:'',costo_envio:''}); load(); } catch(e){ setError(e.message); toasts.addToast('Error creando envío',{type:'error'}); }
  };

  return (
    <Card title="Envíos" actions={<Button onClick={load} variant="secondary">Refrescar</Button>}>
      {user?.es_administrador && (
        <form onSubmit={submit} className="inline" aria-label="Crear envío">
          <input placeholder="Tipo" value={form.tipo_envio} onChange={e=>setForm(f=>({...f,tipo_envio:e.target.value}))} required aria-label="Tipo envío" />
          <input placeholder="Costo" type="number" step="0.01" value={form.costo_envio} onChange={e=>setForm(f=>({...f,costo_envio:e.target.value}))} required aria-label="Costo envío" />
          <Button>Crear</Button>
        </form>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <div className="loading-row"><Spinner size={24}/> <span>Cargando envíos...</span></div>}
      {!loading && envios.length===0 && <SkeletonList rows={4} />}
      <ul aria-live="polite">{envios.map(e=> <li key={e.pk_id_envio}><span>{e.tipo_envio}</span><span className="meta">${e.costo_envio}</span></li>)}</ul>
    </Card>
  );
}
