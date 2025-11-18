// URL base de la API
const API_BASE = 'http://127.0.0.1:8000';

// Utilidad fetch con manejo de errores
async function apiFetch(path, options = {}) {
  const resp = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    ...options
  });
  if (!resp.ok) {
    let detail = 'Error desconocido';
    try { const data = await resp.json(); detail = data.detail || JSON.stringify(data); } catch {}
    throw new Error(detail);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

// Navegación simple
const navButtons = document.querySelectorAll('nav button');
navButtons.forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(btn.dataset.section);
  if (target) target.classList.add('active');
}));

// CLIENTES
const formCliente = document.getElementById('form-cliente');
const listaClientes = document.getElementById('lista-clientes');
const btnRefrescarClientes = document.getElementById('btn-refrescar-clientes');

formCliente.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formCliente);
  const payload = Object.fromEntries(fd.entries());
  // convertir fecha_nac si existe
  try {
    const data = await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(payload) });
    formCliente.reset();
    showMessage('Cliente creado ID ' + data.pk_id_cliente, 'success');
    loadClientes();
  } catch (err) {
    showMessage('Error creando cliente: ' + err.message, 'error');
  }
});

btnRefrescarClientes.addEventListener('click', loadClientes);

async function loadClientes() {
  listaClientes.innerHTML = '<li>Cargando...</li>';
  try {
    const clientes = await apiFetch('/clientes');
    if (!clientes.length) { listaClientes.innerHTML = '<li>No hay clientes</li>'; return; }
    listaClientes.innerHTML = '';
    clientes.forEach(c => {
      const li = document.createElement('li');
      li.textContent = `${c.pk_id_cliente} - ${c.primer_nombre} ${c.primer_apellido} (${c.correo})`;
      listaClientes.appendChild(li);
    });
  } catch (err) {
    listaClientes.innerHTML = '<li class="error">' + err.message + '</li>';
  }
}

// PRODUCTOS
const formProducto = document.getElementById('form-producto');
const listaProductos = document.getElementById('lista-productos');
const btnRefrescarProductos = document.getElementById('btn-refrescar-productos');

formProducto.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formProducto);
  const payload = Object.fromEntries(fd.entries());
  payload.precio = parseFloat(payload.precio);
  try {
    const data = await apiFetch('/productos', { method: 'POST', body: JSON.stringify(payload) });
    formProducto.reset();
    showMessage('Producto creado ID ' + data.pk_id_producto, 'success');
    loadProductos();
  } catch (err) {
    showMessage('Error creando producto: ' + err.message, 'error');
  }
});

btnRefrescarProductos.addEventListener('click', loadProductos);

async function loadProductos() {
  listaProductos.innerHTML = '<li>Cargando...</li>';
  try {
    const productos = await apiFetch('/productos');
    if (!productos.length) { listaProductos.innerHTML = '<li>No hay productos</li>'; return; }
    listaProductos.innerHTML = '';
    productos.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.pk_id_producto} - ${p.nombre} ($${p.precio})`;
      listaProductos.appendChild(li);
    });
  } catch (err) {
    listaProductos.innerHTML = '<li class="error">' + err.message + '</li>';
  }
}

// CARRITO
const formObtenerCarrito = document.getElementById('form-obtener-carrito');
const carritoInfo = document.getElementById('carrito-info');
const formAgregarCarrito = document.getElementById('form-agregar-carrito');
const btnListarCarrito = document.getElementById('btn-listar-carrito');
const listaCarritoProductos = document.getElementById('lista-carrito-productos');
let currentCarritoId = null;
const btnResumenCarrito = document.getElementById('btn-resumen-carrito');
const carritoResumenDiv = document.getElementById('carrito-resumen');
const formActualizarItem = document.getElementById('form-actualizar-item');
const formEliminarItem = document.getElementById('form-eliminar-item');

formObtenerCarrito.addEventListener('submit', async (e) => {
  e.preventDefault();
  const idCliente = formObtenerCarrito.id_cliente.value;
  try {
    const carrito = await apiFetch('/carrito/' + idCliente);
    currentCarritoId = carrito.pk_id_carrito_compra;
    carritoInfo.textContent = 'Carrito ID: ' + currentCarritoId + ' (Cliente ' + carrito.fk_id_cliente + ')';
    showMessage('Carrito obtenido', 'success');
  } catch (err) {
    carritoInfo.textContent = '';
    showMessage('Error obteniendo carrito: ' + err.message, 'error');
  }
});

formAgregarCarrito.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formAgregarCarrito);
  const payload = Object.fromEntries(fd.entries());
  payload.fk_id_producto = parseInt(payload.fk_id_producto);
  payload.cantidad = parseInt(payload.cantidad);
  const carritoId = parseInt(payload.carrito_id);
  try {
    const reg = await apiFetch(`/carrito/${carritoId}/productos`, { method: 'POST', body: JSON.stringify({ fk_id_producto: payload.fk_id_producto, cantidad: payload.cantidad }) });
    showMessage('Producto agregado al carrito. Registro ID ' + reg.pk_id_carrito_producto, 'success');
    loadCarritoProductos(carritoId);
  } catch (err) {
    showMessage('Error agregando producto: ' + err.message, 'error');
  }
});

btnListarCarrito.addEventListener('click', () => {
  if (!currentCarritoId) {
    showMessage('Obtén primero el carrito del cliente', 'error');
    return;
  }
  loadCarritoProductos(currentCarritoId);
});

btnResumenCarrito.addEventListener('click', () => {
  if (!currentCarritoId) {
    showMessage('Obtén primero el carrito del cliente', 'error');
    return;
  }
  loadCarritoResumen(currentCarritoId);
});

formActualizarItem.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(formActualizarItem.item_id.value);
  const cantidad = parseInt(formActualizarItem.cantidad.value);
  try {
    await apiFetch(`/carrito/item/${id}`, { method: 'PATCH', body: JSON.stringify({ cantidad }) });
    showMessage('Item actualizado', 'success');
    if (currentCarritoId) loadCarritoProductos(currentCarritoId);
  } catch (err) { showMessage('Error: ' + err.message, 'error'); }
});

formEliminarItem.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(formEliminarItem.item_id_del.value);
  try {
    await apiFetch(`/carrito/item/${id}`, { method: 'DELETE' });
    showMessage('Item eliminado', 'success');
    if (currentCarritoId) loadCarritoProductos(currentCarritoId);
  } catch (err) { showMessage('Error: ' + err.message, 'error'); }
});

async function loadCarritoProductos(carritoId) {
  listaCarritoProductos.innerHTML = '<li>Cargando...</li>';
  try {
    const items = await apiFetch(`/carrito/${carritoId}/productos`);
    if (!items.length) { listaCarritoProductos.innerHTML = '<li>Carrito vacío</li>'; return; }
    listaCarritoProductos.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `Prod ${it.fk_id_producto} x ${it.cantidad}`;
      listaCarritoProductos.appendChild(li);
    });
  } catch (err) {
    listaCarritoProductos.innerHTML = '<li class="error">' + err.message + '</li>';
  }
}

async function loadCarritoResumen(carritoId) {
  carritoResumenDiv.textContent = 'Calculando...';
  try {
    const r = await apiFetch(`/carrito/${carritoId}/resumen`);
    carritoResumenDiv.textContent = `Items: ${r.total_items} | Subtotal: $${r.subtotal}`;
  } catch (err) {
    carritoResumenDiv.textContent = 'Error: ' + err.message;
  }
}

// ENVÍOS
const formEnvio = document.getElementById('form-envio');
const btnRefrescarEnvios = document.getElementById('btn-refrescar-envios');
const listaEnvios = document.getElementById('lista-envios');

formEnvio.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formEnvio);
  const payload = Object.fromEntries(fd.entries());
  payload.costo_envio = parseFloat(payload.costo_envio);
  try {
    await apiFetch('/envios', { method: 'POST', body: JSON.stringify(payload) });
    showMessage('Envío creado', 'success');
    formEnvio.reset();
    loadEnvios();
  } catch (err) { showMessage('Error: ' + err.message, 'error'); }
});

btnRefrescarEnvios.addEventListener('click', loadEnvios);

async function loadEnvios() {
  listaEnvios.innerHTML = '<li>Cargando...</li>';
  try {
    const envios = await apiFetch('/envios');
    if (!envios.length) { listaEnvios.innerHTML = '<li>No hay envíos</li>'; return; }
    listaEnvios.innerHTML = '';
    envios.forEach(e => {
      const li = document.createElement('li');
      li.textContent = `${e.pk_id_envio} - ${e.tipo_envio} ($${e.costo_envio})`;
      listaEnvios.appendChild(li);
    });
  } catch (err) { listaEnvios.innerHTML = '<li class="error">' + err.message + '</li>'; }
}

// PEDIDOS
const formPedido = document.getElementById('form-pedido');
const btnRefrescarPedidos = document.getElementById('btn-refrescar-pedidos');
const listaPedidos = document.getElementById('lista-pedidos');
const formTotalPedido = document.getElementById('form-total-pedido');
const pedidoTotalDiv = document.getElementById('pedido-total');

formPedido.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formPedido);
  const payload = Object.fromEntries(fd.entries());
  payload.fk_id_carrito_compra = parseInt(payload.fk_id_carrito_compra);
  payload.fk_id_envio = parseInt(payload.fk_id_envio);
  try {
    const p = await apiFetch('/pedidos', { method: 'POST', body: JSON.stringify(payload) });
    showMessage('Pedido creado ID ' + p.pk_id_pedido, 'success');
    formPedido.reset();
    loadPedidos();
  } catch (err) { showMessage('Error: ' + err.message, 'error'); }
});

btnRefrescarPedidos.addEventListener('click', loadPedidos);

async function loadPedidos() {
  listaPedidos.innerHTML = '<li>Cargando...</li>';
  try {
    const pedidos = await apiFetch('/pedidos');
    if (!pedidos.length) { listaPedidos.innerHTML = '<li>No hay pedidos</li>'; return; }
    listaPedidos.innerHTML = '';
    pedidos.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.pk_id_pedido} - Carrito ${p.fk_id_carrito_compra} / Envío ${p.fk_id_envio}`;
      listaPedidos.appendChild(li);
    });
  } catch (err) { listaPedidos.innerHTML = '<li class="error">' + err.message + '</li>'; }
}

formTotalPedido.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(formTotalPedido.pedido_id.value);
  pedidoTotalDiv.textContent = 'Calculando...';
  try {
    const r = await apiFetch(`/pedidos/${id}/total`);
    pedidoTotalDiv.textContent = `Total Pedido: $${r.total}`;
  } catch (err) { pedidoTotalDiv.textContent = 'Error: ' + err.message; }
});

// VENTAS
const formVenta = document.getElementById('form-venta');
const btnRefrescarVentas = document.getElementById('btn-refrescar-ventas');
const listaVentas = document.getElementById('lista-ventas');

formVenta.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(formVenta);
  const payload = Object.fromEntries(fd.entries());
  payload.fk_id_pedido = parseInt(payload.fk_id_pedido);
  payload.total = parseFloat(payload.total);
  try {
    const v = await apiFetch('/ventas', { method: 'POST', body: JSON.stringify(payload) });
    showMessage('Venta registrada ID ' + v.pk_id_venta, 'success');
    formVenta.reset();
    loadVentas();
  } catch (err) { showMessage('Error: ' + err.message, 'error'); }
});

btnRefrescarVentas.addEventListener('click', loadVentas);

async function loadVentas() {
  listaVentas.innerHTML = '<li>Cargando...</li>';
  try {
    const ventas = await apiFetch('/ventas');
    if (!ventas.length) { listaVentas.innerHTML = '<li>No hay ventas</li>'; return; }
    listaVentas.innerHTML = '';
    ventas.forEach(v => {
      const li = document.createElement('li');
      li.textContent = `${v.pk_id_venta} - Pedido ${v.fk_id_pedido} Total $${v.total}`;
      listaVentas.appendChild(li);
    });
  } catch (err) { listaVentas.innerHTML = '<li class="error">' + err.message + '</li>'; }
}

// Mensajes globales
let msgDiv;
function ensureMsgDiv() {
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'messages';
    msgDiv.style.position = 'fixed';
    msgDiv.style.top = '10px';
    msgDiv.style.right = '10px';
    msgDiv.style.maxWidth = '300px';
    msgDiv.style.zIndex = '999';
    document.body.appendChild(msgDiv);
  }
}
function showMessage(text, type='info', timeout=4000) {
  ensureMsgDiv();
  const el = document.createElement('div');
  el.textContent = text;
  el.className = type === 'error' ? 'error' : 'success';
  el.style.background = type === 'error' ? '#ffebee' : '#e8f5e9';
  el.style.border = '1px solid ' + (type === 'error' ? '#d32f2f' : '#2e7d32');
  el.style.padding = '.5rem .7rem';
  el.style.borderRadius = '4px';
  el.style.marginBottom = '.4rem';
  msgDiv.appendChild(el);
  setTimeout(() => { el.remove(); }, timeout);
}

// Carga inicial
loadClientes();
loadProductos();
// Cargas diferidas al abrir cada panel manualmente.
