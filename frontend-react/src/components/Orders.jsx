import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useToasts } from './ui/ToastProvider';

export function Orders(){
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [requestingNewCart, setRequestingNewCart] = useState(false);
  const [envios, setEnvios] = useState([]);
  const [selectedEnvio, setSelectedEnvio] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToasts();

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allPedidos = await api.pedidos.list();
      
      // Obtener todos los carritos del usuario (no solo el actual)
      const todosCarritos = await api.clientes.getCarritos(user.pk_id_cliente);
      const carritoIds = todosCarritos.map(c => c.pk_id_carrito_compra);
      
      // Filtrar pedidos del usuario (por sus carritos)
      const misPedidos = allPedidos.filter(p => carritoIds.includes(p.fk_id_carrito_compra));
      
      // Cargar el total CONGELADO de la venta (si existe) para cada pedido
      const ventasData = await api.ventas.list();
      const pedidosConTotal = misPedidos.map(pedido => {
        const venta = ventasData.find(v => v.fk_id_pedido === pedido.pk_id_pedido);
        return {
          ...pedido,
          total: venta ? venta.total : 0,
          metodo_pago: venta ? venta.metodo_pago : 'N/A'
        };
      });
      
      setPedidos(pedidosConTotal);
    } catch (e) {
      console.error('Error loadOrders:', e);
      if (!e.message.includes('401') && !e.message.includes('Unauthorized')) {
        addToast('Error cargando pedidos: ' + e.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadEnvios = async () => {
      try {
        const data = await api.envios.list();
        setEnvios(data);
        if (data.length > 0) {
          setSelectedEnvio(data[0].pk_id_envio);
        }
      } catch (e) {
        addToast('Error cargando envíos: ' + e.message, 'error');
      }
    };
    loadEnvios();
    loadOrders();
  }, [user]);

  const createOrderFromCart = async () => {
    if (!user) return;
    
    setCreatingOrder(true);
    try {
      // Obtener el carrito
      const carrito = await api.carrito.me();
      
      // Verificar que el carrito tenga items
      const items = await api.carrito.listItems(carrito.pk_id_carrito_compra);
      if (items.length === 0) {
        addToast('El carrito está vacío', 'error');
        setCreatingOrder(false);
        return;
      }
      
      // Verificar si ya existe un pedido con este carrito
      const allPedidos = await api.pedidos.list();
      const pedidoExistente = allPedidos.find(p => p.fk_id_carrito_compra === carrito.pk_id_carrito_compra);
      
      if (pedidoExistente) {
          addToast('Ya tienes un pedido activo. El carrito actual está reservado para ese pedido.', 'error');
        setCreatingOrder(false);
        return;
      }
      
      // Validar que hay envío seleccionado
      if (!selectedEnvio) {
        addToast('Debes seleccionar un tipo de envío', 'error');
        setCreatingOrder(false);
        return;
      }
      
      // Crear el pedido con envío seleccionado
      const nuevoPedido = await api.pedidos.create({
        fk_id_carrito_compra: carrito.pk_id_carrito_compra,
        fk_id_envio: selectedEnvio
      });
      
        // Calcular el total del pedido (esto "congela" el valor)
        const totalData = await api.pedidos.total(nuevoPedido.pk_id_pedido);
      
        // Crear la venta automáticamente para registrar el total
        await api.ventas.create({
          fk_id_pedido: nuevoPedido.pk_id_pedido,
          metodo_pago: 'Pendiente',
          total: totalData.total
        });
      
        addToast('¡Pedido creado exitosamente! Total: $' + totalData.total.toFixed(2), 'success');
      
      // Recargar pedidos
      loadOrders();
      
    } catch (e) {
      addToast('Error creando pedido: ' + e.message, 'error');
    } finally {
      setCreatingOrder(false);
    }
  };

  const requestNewCart = async () => {
    setRequestingNewCart(true);
    try {
      await api.carrito.nuevo();
      addToast('¡Nuevo carrito creado! Ya puedes seguir comprando', 'success');
      loadOrders();
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
      <Card title="🧾 Mis Pedidos">
        <p className="meta">Debes iniciar sesión para ver tus pedidos</p>
      </Card>
    );
  }

  return (
    <Card 
      title="🧾 Mis Pedidos" 
      actions={
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <Button onClick={loadOrders} variant="secondary" disabled={loading}>
            🔄 Refrescar
          </Button>
          <Button onClick={createOrderFromCart} disabled={creatingOrder}>
            {creatingOrder ? <Spinner size={16} /> : '📦 Crear Pedido'}
          </Button>
        </div>
      }
    >
      {loading && (
        <div className="loading-row">
          <Spinner size={26} />
          <span>Cargando pedidos...</span>
        </div>
      )}

      {!loading && pedidos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="meta">No tienes pedidos aún</p>
          <p style={{ fontSize: '3rem', margin: '1rem 0' }}>📦</p>
          <p className="meta">Crea tu primer pedido desde el carrito</p>
        </div>
      )}

      {!loading && envios.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-alt)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text)' }}>
            🚚 Selecciona tipo de envío:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {envios.map(env => (
              <div
                key={env.pk_id_envio}
                onClick={() => setSelectedEnvio(env.pk_id_envio)}
                style={{
                  padding: '0.75rem',
                  border: selectedEnvio === env.pk_id_envio ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedEnvio === env.pk_id_envio ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg)',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: '600', color: 'var(--text)' }}>{env.tipo_envio}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  ${env.costo_envio.toFixed(2)} • {env.dias_entrega} días
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && pedidos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="meta">No tienes pedidos aún</p>
          <p style={{ fontSize: '3rem', margin: '1rem 0' }}>📦</p>
          <p className="meta">Crea tu primer pedido desde el carrito</p>
        </div>
      )}

      {!loading && pedidos.length > 0 && (
        <>
          <div className="info-banner">
          <p>💡 <strong>Importante:</strong> El total de cada pedido queda <strong>congelado</strong> al momento de crearlo. Si modificas tu carrito después, los pedidos anteriores no cambiarán. Para hacer una nueva compra, solicita un nuevo carrito al administrador.</p>
          </div>
          <div className="orders-list">
            {pedidos.map(pedido => (
            <div key={pedido.pk_id_pedido} className="order-card">
              <div className="order-header">
                <div>
                  <h4>Pedido #{pedido.pk_id_pedido}</h4>
                  <p className="meta">
                    Fecha: {new Date().toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="order-total">
                  <span className="meta">Total</span>
                  <strong>${pedido.total?.toFixed(2) || '0.00'}</strong>
                </div>
              </div>
              <div className="order-details">
                <div className="detail-item">
                  <span className="meta">� Estado:</span>
                  <span>Confirmado</span>
                </div>
                <div className="detail-item">
                  <span className="meta">🚚 Envío:</span>
                  <span>Estándar (3-5 días)</span>
                </div>
              </div>
              <div className="order-status">
                <span className="status-badge status-pending">En proceso</span>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </Card>
  );
}
