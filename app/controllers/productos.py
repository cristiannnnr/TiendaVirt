from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user
from app.auth_utils import get_current_admin_user

router = APIRouter(prefix="/productos", tags=["productos"])

@router.post("", response_model=schemas.ProductoOut)
def crear_producto(
    data: schemas.ProductoCreate, 
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Crear producto (solo admin)"""
    return crud.crear_producto(db, data)

@router.get("", response_model=list[schemas.ProductoOut])
def listar_productos(db: Session = Depends(get_db)):
    return crud.listar_productos(db)
