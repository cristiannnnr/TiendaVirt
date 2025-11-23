from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
from sqlalchemy import text
from app.database import Base, engine, SessionLocal
from app.controllers import clientes, productos, carritos, envios, pedidos, ventas, auth

logger = logging.getLogger("uvicorn.error")

# Intento de creación de tablas (opcional). Si falla la conexión, se registra advertencia y la app sigue para permitir diagnóstico.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f"No se pudieron crear las tablas al inicio: {e}")

app = FastAPI(title='API Tienda Virtual')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.get('/diagnostic/db')
def diagnostic_db():
    """Verifica conexión básica a la base de datos y retorna el URL usado (sin contraseña)."""
    # Obtenemos URL sin password para mostrar
    from app.config import DATABASE_URL
    masked_url = DATABASE_URL.split('@')
    if len(masked_url) == 2:
        creds, rest = masked_url
        # Reemplazar password por ***
        if ':' in creds:
            user, pwd = creds.split(':', 1)
            creds_masked = f"{user}:***"
        else:
            creds_masked = creds
        display_url = creds_masked + '@' + rest
    else:
        display_url = DATABASE_URL

    try:
        with SessionLocal() as db:
            db.execute(text('SELECT 1'))
        return {'database_url': display_url, 'connection': 'ok'}
    except Exception as e:
        return {'database_url': display_url, 'connection': 'error', 'detail': str(e)}

# Registro de routers (Controladores)
app.include_router(clientes.router)
app.include_router(productos.router)
app.include_router(carritos.router)
app.include_router(envios.router)
app.include_router(pedidos.router)
app.include_router(ventas.router)
app.include_router(auth.router)

# Frontend estático (comentado - frontend se sirve desde Vite)
# app.mount('/frontend', StaticFiles(directory='frontend', html=True), name='frontend')
