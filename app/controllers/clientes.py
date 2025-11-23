from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user
from app.auth_utils import get_current_admin_user

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.post("", response_model=schemas.ClienteOut)
def crear_cliente(data: schemas.ClienteCreate, db: Session = Depends(get_db)):
    try:
        return crud.crear_cliente(db, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[schemas.ClienteOut])
def listar_clientes(db: Session = Depends(get_db)):
    return crud.listar_clientes(db)

@router.get("/{cliente_id}", response_model=schemas.ClienteOut)
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Obtener información de un cliente"""
    cliente = crud.obtener_cliente(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@router.get("/{cliente_id}/carritos", response_model=list[schemas.CarritoOut])
def obtener_carritos_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Obtener todos los carritos del cliente para ver todos sus pedidos históricos"""
    return crud.obtener_carritos_cliente(db, cliente_id)

@router.patch("/{cliente_id}/admin", response_model=schemas.ClienteOut)
def actualizar_estado_admin(
    cliente_id: int, 
    data: schemas.ClienteUpdateAdmin,
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Cambiar estado de administrador de un cliente (solo admin)"""
    try:
        return crud.actualizar_estado_admin(db, cliente_id, data.es_administrador)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
