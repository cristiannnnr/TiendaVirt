const API = 'http://localhost:8000';

let authToken = null;
export function setAuthToken(t){ authToken = t; }

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  try {
    const resp = await fetch(API + path, {
      headers,
      ...options
    });
    let data = null;
    try { data = await resp.json(); } catch {}
    if (!resp.ok) {
      if (resp.status === 401) {
        throw new Error('Sesión expirada o no autenticado');
      }
      const detail = data?.detail || JSON.stringify(data);
      throw new Error(detail);
    }
    return data;
  } catch (err) {
    if (err.message === 'Sesión expirada o no autenticado') {
      throw err;
    }
    if (err.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar al servidor. Verifica que esté corriendo en puerto 8000');
    }
    throw new Error(`${path}: ${err.message}`);
  }
}

export const api = {
  clientes: {
    list: () => request('/clientes'),
    create: (payload) => request('/clientes', { method: 'POST', body: JSON.stringify(payload) }),
    getCarritos: (clienteId) => request(`/clientes/${clienteId}/carritos`)
  },
  auth: {
    register: (payload) => request('/auth/register', { method:'POST', body: JSON.stringify(payload)}),
    login: (payload) => request('/auth/login', { method:'POST', body: JSON.stringify(payload)}),
    me: () => request('/auth/me')
  },
  productos: {
    list: () => request('/productos'),
    create: (payload) => request('/productos', { method: 'POST', body: JSON.stringify(payload) })
  },
  carrito: {
    getByCliente: (idCliente) => request(`/carrito/${idCliente}`),
    me: () => request('/carrito/me'),
    addItem: (carritoId, fk_id_producto, cantidad) => request(`/carrito/${carritoId}/productos`, { method: 'POST', body: JSON.stringify({ fk_id_producto, cantidad }) }),
    listItems: (carritoId) => request(`/carrito/${carritoId}/productos`),
    resumen: (carritoId) => request(`/carrito/${carritoId}/resumen`),
    updateItem: (itemId, cantidad) => request(`/carrito/item/${itemId}`, { method: 'PATCH', body: JSON.stringify({ cantidad }) }),
    deleteItem: (itemId) => request(`/carrito/item/${itemId}`, { method: 'DELETE' }),
    nuevo: () => request('/carrito/nuevo', { method: 'POST' })
  },
  envios: {
    list: () => request('/envios'),
    create: (payload) => request('/envios', { method: 'POST', body: JSON.stringify(payload) })
  },
  pedidos: {
    list: () => request('/pedidos'),
    create: (payload) => request('/pedidos', { method: 'POST', body: JSON.stringify(payload) }),
    total: (pedidoId) => request(`/pedidos/${pedidoId}/total`)
  },
  ventas: {
    list: () => request('/ventas'),
    create: (payload) => request('/ventas', { method: 'POST', body: JSON.stringify(payload) })
  }
};
