import { useEffect, useState } from 'react';
import { api } from '../api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { SkeletonList } from './ui/Skeleton';
import { useToasts } from './ui/ToastProvider';

export function Sales(){
  const [ventas,setVentas]=useState([]);
  const [form,setForm]=useState({fk_id_pedido:'',metodo_pago:'',total:''});
  const [error,setError]=useState(null);
  const [loading,setLoading]=useState(false);
  const toasts = useToasts();

  const load=async()=>{ setLoading(true); setError(null); try { const data=await api.ventas.list(); setVentas(data); } catch(e){ setError(e.message); } finally { setLoading(false); } };
  useEffect(()=>{ load(); },[]);

  const submit=async(e)=>{
    e.preventDefault();
    try {
      await api.ventas.create({fk_id_pedido:parseInt(form.fk_id_pedido),metodo_pago:form.metodo_pago,total:parseFloat(form.total||'0')});
      toasts.push('Venta registrada',{type:'success'});
      setForm({fk_id_pedido:'',metodo_pago:'',total:''});
      load();
    } catch(e){ setError(e.message); toasts.push('Error registrando venta',{type:'error'}); }
  };

  return (
    <Card title="Ventas" actions={<Button onClick={load} variant="secondary">Refrescar</Button>}>
      <form onSubmit={submit} className="inline" aria-label="Registrar venta">
        <input placeholder="ID Pedido" value={form.fk_id_pedido} onChange={e=>setForm(f=>({...f,fk_id_pedido:e.target.value}))} required aria-label="ID Pedido" />
        <input placeholder="Método Pago" value={form.metodo_pago} onChange={e=>setForm(f=>({...f,metodo_pago:e.target.value}))} required aria-label="Método Pago" />
        <input placeholder="Total" type="number" step="0.01" value={form.total} onChange={e=>setForm(f=>({...f,total:e.target.value}))} required aria-label="Total" />
        <Button>Registrar</Button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <div className="loading-row"><Spinner size={24}/> <span>Cargando ventas...</span></div>}
      {!loading && ventas.length===0 && <SkeletonList rows={4} />}
      <ul aria-live="polite">{ventas.map(v=> <li key={v.pk_id_venta}><span>Venta {v.pk_id_venta}</span><span className="meta">Pedido {v.fk_id_pedido} · ${v.total}</span></li>)}</ul>
    </Card>
  );
}
