import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { SkeletonList } from './ui/Skeleton';
import { useToasts } from './ui/ToastProvider';

export function ProductCatalog(){
  const [productos,setProductos]=useState([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState('');
  const [carrito,setCarrito]=useState(null);
    const [isLocked,setIsLocked]=useState(false);
  const [adding,setAdding]=useState(false);
  const toasts = useToasts();
  const { user } = useAuth();

  const load=async()=>{
    setLoading(true);
    try { const data = await api.productos.list(); setProductos(data); } catch(e){ toasts.push('Error cargando productos',{type:'error'}); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  useEffect(()=> {
    const fetchCart = async () => {
      if(!user) {
        setCarrito(null);
        setIsLocked(false);
        return;
      }
      
      try {
        const c = await api.carrito.me();
        if (!c) {
          setCarrito(null);
          return;
        }
        setCarrito(c);
        
        // Verificar si el carrito ya tiene un pedido asociado
        try {
          const allPedidos = await api.pedidos.list();
          const pedidoExistente = allPedidos.find(p => p.fk_id_carrito_compra === c.pk_id_carrito_compra);
          setIsLocked(!!pedidoExistente);
        } catch (e) {
          // Si falla la carga de pedidos, simplemente no bloqueamos el carrito
          setIsLocked(false);
        }
      } catch(err){
        console.error('Error fetchCart:', err);
        setCarrito(null);
        // Solo mostrar error si no es por falta de autenticación
        if (!err.message.includes('401') && !err.message.includes('Unauthorized')) {
          toasts.push('Error cargando carrito', {type:'error'});
        }
      }
    };
    
    fetchCart();
    
    // Escuchar eventos de nuevo carrito solicitado
    const handleNewCart = () => {
      setTimeout(fetchCart, 300);
    };
    window.addEventListener('newCartRequested', handleNewCart);
    
    return () => {
      window.removeEventListener('newCartRequested', handleNewCart);
    };
  }, [user]);

  const addToCart = async (prodId) => {
      if(isLocked){
        toasts.push('Tu carrito está bloqueado porque ya tiene un pedido. Ve a "Mi Carrito" para solicitar uno nuevo.',{type:'error'});
        return;
      }
    if(!carrito){ toasts.push('Carrito no disponible',{type:'error'}); return; }
    setAdding(true);
    try {
      await api.carrito.addItem(carrito.pk_id_carrito_compra, prodId, 1);
      toasts.push('Añadido al carrito',{type:'success'});
      // Emitir evento personalizado para notificar al componente Cart
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch(e){ toasts.push('Error añadiendo',{type:'error'}); } finally { setAdding(false); }
  };

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || (p.marca||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <Card title="Catálogo" actions={<input placeholder="Buscar" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Buscar productos" />}>      
      {loading && <div className="loading-row"><Spinner size={26}/> <span>Cargando catálogo...</span></div>}
      {!loading && productos.length===0 && <SkeletonList rows={6} />}
      <div className="catalog-grid">
        {filtered.map(p => (
          <div key={p.pk_id_producto} className="product-card">
            <div className="product-card__body">
              <h4 className="product-card__title">{p.nombre}</h4>
              <p className="product-card__brand">{p.marca || 'Sin marca'}</p>
              <p className="product-card__price">${p.precio}</p>
              {p.descripcion && <p className="product-card__desc">{p.descripcion}</p>}
            </div>
              {user && <Button onClick={()=>addToCart(p.pk_id_producto)} disabled={adding || isLocked}>Añadir</Button>}
            {!user && <small className="meta">Inicia sesión para comprar</small>}
          </div>
        ))}
      </div>
    </Card>
  );
}
