from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/ventas", tags=["ventas"])

@router.post("", response_model=schemas.VentaOut)
def crear_venta(data: schemas.VentaCreate, db: Session = Depends(get_db)):
    try:
        return crud.registrar_venta(db, data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("", response_model=list[schemas.VentaList])
def listar_ventas(db: Session = Depends(get_db)):
    return crud.listar_ventas(db)
