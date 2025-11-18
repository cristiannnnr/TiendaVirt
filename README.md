# API Tienda Virtual (FastAPI + PostgreSQL) - Arquitectura MVC

## Requisitos
- Python 3.11+
- PostgreSQL en ejecución

## Instalación
1. Crear y llenar archivo `.env` basado en `app/.env.example`:
```
DATABASE_URL=postgresql+psycopg2://usuario:password@localhost:5432/tienda_virtual
```
2. Instalar dependencias:
```
pip install -r requirements.txt
```
3. Crear esquema (si no usas `Base.metadata.create_all`):
```
psql -U usuario -d tienda_virtual -f schema.sql
```
4. Ejecutar servidor:
```
python -m uvicorn main:app --reload
```

## Arquitectura MVC
## Interfaz Frontend Básica
Se añadió una interfaz estática simple en la carpeta `frontend/` servida por FastAPI en la ruta:

```
http://127.0.0.1:8000/frontend/
```

Incluye formularios para:
- Crear y listar clientes
- Crear y listar productos
- Obtener carrito por ID de cliente
- Agregar productos al carrito y listar contenido
- Actualizar o eliminar ítems del carrito
- Ver resumen (subtotal y total de items) del carrito
- Crear y listar tipos de envío
- Crear y listar pedidos + cálculo de total del pedido (subtotal + costo envío)
- Registrar y listar ventas

Archivos:
```
frontend/
	index.html
	style.css
	app.js
```
Puedes personalizar estilos en `style.css` y extender lógica en `app.js`.

### Nuevos Endpoints añadidos
## Frontend React (Vite)
Se ha añadido una versión moderna con React en `frontend-react/`.

Instalación:
```
cd frontend-react
npm install
npm run dev
```
Accede en el navegador a `http://localhost:5173`.

Estructura principal:
```
frontend-react/
	src/
		api.js           # servicios de acceso a la API
		App.jsx          # layout y navegación por pestañas
		components/      # vistas: Clients, Products, Cart, Shipping, Orders, Sales
		main.jsx         # punto de entrada
		app.css          # estilos
	package.json
	vite.config.js
	index.html
```

El backend permite CORS desde `http://localhost:5173`. Si necesitas otro puerto/domino, edita la lista en `main.py`.

Características React:
- Estado local por componente (useState).
- Fetch centralizado (`api.js`).
- Navegación por pestañas sin router complejo.
- Actualizaciones sobre creación/edición/eliminación de recursos.

Próximas mejoras sugeridas para React:
- Manejo de carga y errores más refinado (spinners, toasts).
- Router (React Router) para URLs compartibles.
- Contexto global y cache con React Query.
- Autenticación (JWT) y guardado de sesión.
- Paginación y filtrado en listas.
- `GET /carrito/{carrito_id}/resumen` resumen subtotal y cantidad de items.
- `PATCH /carrito/item/{carrito_producto_id}` actualizar cantidad.
- `DELETE /carrito/item/{carrito_producto_id}` eliminar ítem.
- `GET /envios` listar envíos.
- `GET /pedidos` listar pedidos.
- `GET /pedidos/{pedido_id}/total` calcular total pedido.
- `GET /ventas` listar ventas.
En esta API el patrón Modelo-Vista-Controlador se interpreta así:
- Modelo: clases ORM en `app/models.py` y capa de acceso/servicio en `app/crud.py`.
- Vista: esquemas Pydantic en `app/schemas.py` (definen la representación de entrada/salida JSON).
- Controlador: routers por recurso en `app/controllers/*.py` que orquestan solicitudes y delegan en CRUD.

Estructura relevante:
```
app/
	controllers/
		clientes.py
		productos.py
		carritos.py
		envios.py
		pedidos.py
		ventas.py
	models.py
	schemas.py
	crud.py
	database.py
	config.py
main.py
```

## Endpoints Principales (agrupados)
Clientes:
- `POST /clientes`
- `GET /clientes`

Productos:
- `POST /productos`
- `GET /productos`

Carrito:
- `GET /carrito/{id_cliente}`
- `POST /carrito/{carrito_id}/productos`
- `GET /carrito/{carrito_id}/productos`

Envios:
- `POST /envios`

Pedidos:
- `POST /pedidos`

Ventas:
- `POST /ventas`

Salud:
- `GET /health`

Visita `/docs` para Swagger interactivo.

## Nota sobre la columna contraseña
En el ORM se usa atributo `contrasena` mapeado a la columna `"contraseña"`.

## Validación de Email
Se usa `EmailStr` de Pydantic, que requiere el paquete `email-validator`. Ya está incluido en `requirements.txt`; si ves un error indicando que falta, ejecuta:
```
pip install email-validator
```
## Solución de errores de conexión a PostgreSQL
Si al iniciar aparece `psycopg2.OperationalError` o advertencia de que no se pudieron crear las tablas:

1. Verifica que PostgreSQL esté ejecutándose (Servicio Windows o Docker).
2. Crea la base y usuario si aún no existen (ejemplo):
	```
	psql -U postgres -c "CREATE DATABASE tienda_virtual;"
	psql -U postgres -c "CREATE USER tienda_usr WITH PASSWORD 'StrongPass123!';"
	psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE tienda_virtual TO tienda_usr;"
	```
3. Actualiza `.env` con una cadena válida:
	```
	DATABASE_URL=postgresql+psycopg2://tienda_usr:StrongPass123!@localhost:5432/tienda_virtual
	```
4. Aplica el esquema (opcional si usas `create_all`):
	```
	psql -U tienda_usr -d tienda_virtual -f schema.sql
	```
5. Reinicia el servidor. Luego visita:
	- `/health` para estado simple.
	- `/diagnostic/db` para comprobar conexión y ver URL sin la contraseña.

Si sigues con errores, revisa que no haya firewalls bloqueando el puerto 5432 y que `psycopg2-binary` esté instalado.

## Próximos pasos sugeridos
- Autenticación y hashing de contraseña (PassLib + JWT).
## Autenticación (Registro / Login / Token JWT)
Se añadió un flujo básico de autenticación tipo tienda virtual:
- Registro: `POST /auth/register` (hash bcrypt de contraseña) crea automáticamente el carrito del cliente.
- Login: `POST /auth/login` retorna `access_token` JWT (Bearer) con `sub=correo`.
- Perfil: `GET /auth/me` devuelve datos mínimos del usuario autenticado.
- Carrito del usuario autenticado: `GET /carrito/me`.

Variables de entorno añadidas:
```
JWT_SECRET_KEY=dev-secret-change
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
Agrega estas a `.env` antes de ejecutar para producción (usa un secreto fuerte). Se actualizaron dependencias en `requirements.txt` con `passlib[bcrypt]` y `python-jose[cryptography]`.

### Esquemas nuevos
- `LoginRequest` (correo, contrasena)
- `Token` (access_token, token_type)
- `UserMe` (datos mínimos del cliente logueado)

### Frontend React
Se incorporó `AuthProvider` para gestionar token y usuario, persiste en `localStorage`.
Componentes nuevos:
```
frontend-react/src/context/AuthContext.jsx
frontend-react/src/components/Login.jsx
frontend-react/src/components/ProductCatalog.jsx
```
`api.js` ahora añade automáticamente el header `Authorization: Bearer <token>` si existe. El catálogo muestra productos en formato tarjeta y permite añadir al carrito (1 unidad) si el usuario está autenticado; si no, muestra aviso para iniciar sesión.

### Flujo recomendado usuario
1. Registrar cuenta (o iniciar sesión si ya existe).
2. Navegar al Catálogo, añadir productos.
3. Consultar el carrito (`/carrito/me`) y proceder a crear pedido y luego venta.

### Seguridad pendiente
- Expiración y refresh de token.
- Limitación de intentos login (rate limiting).
- Cifrado en tránsito (HTTPS) — depende del despliegue.

- Manejo completo de categorías (endpoints CRUD categoría y asignación producto-categoría).
- Paginación y filtrado en listados (query params: page, size, search).
- Manejo de stock y validación antes de crear pedido/venta.
- Tests automatizados (pytest) para controladores y capa CRUD.

## Mejora de Diseño (React)
Se actualizó el frontend React con:
- Layout con barra lateral y encabezado fijo.
- Iconografía por sección para rápida identificación.
- Sistema de variables CSS y sombras consistentes.
- Modo claro/oscuro con persistencia (localStorage) y toggle (`ThemeToggle`).
- Animaciones suaves (fade-in) y estados hover elevando elementos.
- Diseño responsive: la barra lateral se convierte en barra superior en pantallas pequeñas.

### Componentes UI avanzados añadidos
Se incorporó una pequeña capa de diseño reutilizable:
- `Card`: Contenedor con cabecera opcional y sombra suave.
- `Button`: Variantes (`primary`, `secondary`, `danger`) y estado disabled consistente.
- `Spinner`: Indicador de carga accesible (`role="status"`).
- `ToastProvider`: Sistema de notificaciones flotantes (success, error, info) con expiración automática.

Ejemplo de uso rápido (React):
```jsx
<Card title="Clientes" actions={<Button variant="secondary" onClick={reload}>Refrescar</Button>}>
	{loading && <Spinner size={24} />}
	<Button onClick={crear}>Crear</Button>
</Card>
```

Notificaciones:
```jsx
const toasts = useToasts();
toasts.push('Cliente creado', { type:'success', ttl:4000 });
```

Accesibilidad básica:
- Uso de `aria-live="polite"` en listados para anunciar cambios.
- Etiquetas `aria-label` en inputs para mayor claridad en lectores de pantalla.

Pendiente sugerido: migrar gradualmente a un design system formal (Tailwind, Radix UI o Chakra) si se requiere escalabilidad mayor.

Archivos modificados/agregados relevantes:
```
frontend-react/src/App.jsx          # Nuevo layout y sidebar
frontend-react/src/app.css          # Variables, theming, responsive, animaciones
frontend-react/src/components/ThemeToggle.jsx  # Toggle modo claro/oscuro
```

Para probar el modo oscuro:
1. Inicia el servidor React (`npm run dev`).
2. Haz clic en el botón "🌙 Oscuro" / "☀️ Claro" en la barra lateral o el encabezado.

Puedes ajustar la paleta en `:root` dentro de `app.css`. Para incorporar un framework (ej. Tailwind), bastaría con instalarlo y convertir gradualmente los estilos utilitarios.
