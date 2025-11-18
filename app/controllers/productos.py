from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/productos", tags=["productos"])

@router.post("", response_model=schemas.ProductoOut)
def crear_producto(data: schemas.ProductoCreate, db: Session = Depends(get_db)):
    return crud.crear_producto(db, data)

@router.get("", response_model=list[schemas.ProductoOut])
def listar_productos(db: Session = Depends(get_db)):
    return crud.listar_productos(db)
