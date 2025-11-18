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
Se puede personalizar estilos en `style.css` y extender lógica en `app.js`.

### Endpoints añadidos
## Frontend React (Vite)
en `frontend-react/`.

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

El backend permite CORS desde `http://localhost:5173`. Si necesita otro puerto, editar la lista en `main.py`.

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


Se añadió un flujo básico de autenticación tipo tienda virtual:
- Registro: `POST /auth/register` (hash bcrypt de contraseña) crea automáticamente el carrito del cliente.
- Login: `POST /auth/login` retorna `access_token` JWT (Bearer) con `sub=correo`.
- Perfil: `GET /auth/me` devuelve datos mínimos del usuario autenticado.
- Carrito del usuario autenticado: `GET /carrito/me`.


### Flujo recomendado usuario
1. Registrar cuenta (o iniciar sesión si ya existe).
2. Navegar al Catálogo, añadir productos.
3. Consultar el carrito (`/carrito/me`) y proceder a crear pedido y luego venta.



Para probar el modo oscuro:
1. Inicia el servidor React (`npm run dev`).
2. Haz clic en el botón "🌙 Oscuro" / "☀️ Claro" en la barra lateral o el encabezado.

Puedes ajustar la paleta en `:root` dentro de `app.css`. Para incorporar un framework (ej. Tailwind), bastaría con instalarlo y convertir gradualmente los estilos utilitarios.
