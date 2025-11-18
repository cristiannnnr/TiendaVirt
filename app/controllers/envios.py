from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/envios", tags=["envios"])

@router.post("", response_model=schemas.EnvioOut)
def crear_envio(data: schemas.EnvioCreate, db: Session = Depends(get_db)):
    return crud.crear_envio(db, data)

@router.get("", response_model=list[schemas.EnvioOut])
def listar_envios(db: Session = Depends(get_db)):
    return crud.listar_envios(db)
