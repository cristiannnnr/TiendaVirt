from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

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

@router.get("/{cliente_id}/carritos", response_model=list[schemas.CarritoOut])
def obtener_carritos_cliente(cliente_id: int, db: Session = Depends(get_db)):
    """Obtener todos los carritos del cliente para ver todos sus pedidos históricos"""
    return crud.obtener_carritos_cliente(db, cliente_id)
