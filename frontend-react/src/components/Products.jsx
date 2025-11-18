import { useEffect, useState } from 'react';
import { api } from '../api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useToasts } from './ui/ToastProvider';

export function Products(){
  const [productos,setProductos]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [form,setForm]=useState({nombre:'',marca:'',precio:'',descripcion:''});
  const toasts = useToasts();

  const load=async()=>{
    setLoading(true); setError(null);
    try { const data = await api.productos.list(); setProductos(data); } catch(e){ setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const submit=async(e)=>{
    e.preventDefault();
    const payload={...form, precio: parseFloat(form.precio||'0')};
    try {
      await api.productos.create(payload);
      toasts.push('Producto creado', { type:'success' });
      setForm({nombre:'',marca:'',precio:'',descripcion:''});
      load();
    } catch(e){ setError(e.message); toasts.push('Error al crear producto', { type:'error' }); }
  };

  return (
    <Card title="Productos" actions={<Button onClick={load} variant="secondary">Refrescar</Button>}>
      <form onSubmit={submit} className="form-grid" aria-label="Formulario creación producto">
        <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} required aria-label="Nombre" />
        <input placeholder="Marca" value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))} aria-label="Marca" />
        <input placeholder="Precio" type="number" step="0.01" value={form.precio} onChange={e=>setForm(f=>({...f,precio:e.target.value}))} required aria-label="Precio" />
        <textarea placeholder="Descripción" value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} aria-label="Descripción"></textarea>
        <Button type="submit">Crear</Button>
      </form>
      {loading && <div className="loading-row"><Spinner size={28}/> <span>Cargando productos...</span></div>}
      {error && <p className="error" role="alert">{error}</p>}
      <ul aria-live="polite">{productos.map(p=> <li key={p.pk_id_producto}><span>{p.nombre}</span><span className="meta">${p.precio}</span></li>)}</ul>
    </Card>
  );
}
