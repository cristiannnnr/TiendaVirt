import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { SkeletonList } from './ui/Skeleton';
import { useToasts } from './ui/ToastProvider';

export function Cart(){
  const [carrito, setCarrito] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [requestingNewCart, setRequestingNewCart] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToasts();

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const c = await api.carrito.me();
      if (!c) {
        setCarrito(null);
        setItems([]);
        setResumen(null);
        return;
      }
      setCarrito(c);
      
      // Verificar si este carrito ya tiene un pedido asociado
      try {
        const allPedidos = await api.pedidos.list();
        const pedidoExistente = allPedidos.find(p => p.fk_id_carrito_compra === c.pk_id_carrito_compra);
        setIsLocked(!!pedidoExistente);
      } catch (e) {
        setIsLocked(false);
      }
      
      // Cargar items del carrito
      const itemsData = await api.carrito.listItems(c.pk_id_carrito_compra);
      setItems(itemsData);
      
      // Cargar resumen
      const resumenData = await api.carrito.resumen(c.pk_id_carrito_compra);
      setResumen(resumenData);
    } catch (e) {
      console.error('Error loadCart:', e);
      // No mostrar error si es por falta de autenticación
      if (!e.message.includes('401') && !e.message.includes('Unauthorized')) {
        addToast('Error cargando carrito: ' + e.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    
    // Escuchar evento personalizado cuando se añade algo desde el catálogo
    const handleCartUpdate = () => {
      loadCart();
    };
    
    // Escuchar evento cuando se crea nuevo carrito
    const handleNewCart = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('newCartRequested', handleNewCart);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('newCartRequested', handleNewCart);
    };
  }, [user]);

  const updateQuantity = async (itemId, newQuantity) => {
      if (isLocked) {
        addToast('Este carrito está bloqueado porque ya tiene un pedido asociado', 'error');
        return;
      }
    if (newQuantity < 1) return;
    
    // Actualización optimista del estado
    setItems(prevItems => 
      prevItems.map(item => 
        item.pk_id_carrito_producto === itemId 
          ? { ...item, cantidad: newQuantity }
          : item
      )
    );
    
    try {
      await api.carrito.updateItem(itemId, newQuantity);
      addToast('Cantidad actualizada', 'success');
      
      // Actualizar solo el resumen
      if (carrito) {
        const resumenData = await api.carrito.resumen(carrito.pk_id_carrito_compra);
        setResumen(resumenData);
      }
    } catch (e) {
      addToast('Error actualizando cantidad', 'error');
      // Revertir en caso de error
      loadCart();
    }
  };

  const removeItem = async (itemId) => {
    if (isLocked) {
      addToast('Este carrito está bloqueado porque ya tiene un pedido asociado', 'error');
      return;
    }
    // Actualización optimista del estado
    setItems(prevItems => prevItems.filter(item => item.pk_id_carrito_producto !== itemId));
    
    try {
      await api.carrito.deleteItem(itemId);
      addToast('Producto eliminado del carrito', 'success');
      
      // Actualizar solo el resumen
      if (carrito) {
        const resumenData = await api.carrito.resumen(carrito.pk_id_carrito_compra);
        setResumen(resumenData);
      }
    } catch (e) {
      addToast('Error eliminando producto', 'error');
      // Revertir en caso de error
      loadCart();
    }
  };

  const requestNewCart = async () => {
    setRequestingNewCart(true);
    try {
      await api.carrito.nuevo();
      addToast('¡Nuevo carrito creado! Ya puedes seguir comprando', 'success');
      loadCart();
      // Notificar a otros componentes
      window.dispatchEvent(new CustomEvent('newCartRequested'));
    } catch (e) {
      addToast('Error creando nuevo carrito: ' + e.message, 'error');
    } finally {
      setRequestingNewCart(false);
    }
  };

  if (!user) {
    return (
      <Card title="🛒 Mi Carrito">
        <p className="meta">Debes iniciar sesión para ver tu carrito</p>
      </Card>
    );
  }

  return (
    <Card 
      title="🛒 Mi Carrito" 
      actions={<Button onClick={loadCart} variant="secondary" disabled={loading}>🔄 Refrescar</Button>}
    >
      {isLocked && (
        <div className="info-banner" style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>🔒 Carrito Bloqueado:</strong> Este carrito ya tiene un pedido asociado.
          </div>
          <Button onClick={requestNewCart} disabled={requestingNewCart} style={{ marginTop: '0.5rem' }}>
            {requestingNewCart ? '⏳ Creando...' : '✨ Solicitar Nuevo Carrito'}
          </Button>
        </div>
      )}

      {loading && (
        <div className="loading-row">
          <Spinner size={26} />
          <span>Cargando carrito...</span>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="meta">Tu carrito está vacío</p>
          <p style={{ fontSize: '3rem', margin: '1rem 0' }}>🛒</p>
          <p className="meta">Agrega productos desde el catálogo</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.pk_id_carrito_producto} className="cart-item">
                <div className="cart-item__info">
                  <h4>{item.producto?.nombre || 'Producto'}</h4>
                  <p className="meta">{item.producto?.marca || 'Sin marca'}</p>
                  <p className="price">${item.producto?.precio || 0} c/u</p>
                </div>
                <div className="cart-item__actions">
                  <div className="quantity-controls">
                    <Button 
                      variant="secondary" 
                      onClick={() => updateQuantity(item.pk_id_carrito_producto, item.cantidad - 1)}
                        disabled={item.cantidad <= 1 || isLocked}
                    >
                      −
                    </Button>
                    <span className="quantity">{item.cantidad}</span>
                    <Button 
                      variant="secondary"
                      onClick={() => updateQuantity(item.pk_id_carrito_producto, item.cantidad + 1)}
                        disabled={isLocked}
                    >
                      +
                    </Button>
                  </div>
                  <p className="subtotal">${((item.producto?.precio || 0) * item.cantidad).toFixed(2)}</p>
                  <Button 
                    variant="danger" 
                    onClick={() => removeItem(item.pk_id_carrito_producto)}
                      disabled={isLocked}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {resumen && (
            <div className="cart-summary">
              <div className="summary-row">
                <span>Total de items:</span>
                <strong>{resumen.total_items}</strong>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <strong>${resumen.subtotal?.toFixed(2) || '0.00'}</strong>
              </div>
              <Button style={{ width: '100%', marginTop: '1rem' }}>
                Proceder al Pago
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
