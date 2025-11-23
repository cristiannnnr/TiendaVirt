from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth_utils import get_current_admin_user

router = APIRouter(prefix="/envios", tags=["envios"])

@router.post("", response_model=schemas.EnvioOut)
def crear_envio(
    data: schemas.EnvioCreate, 
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Crear tipo de envío (solo admin)"""
    return crud.crear_envio(db, data)

@router.get("", response_model=list[schemas.EnvioOut])
def listar_envios(db: Session = Depends(get_db)):
    return crud.listar_envios(db)
