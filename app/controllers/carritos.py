from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/carrito", tags=["carrito"])

@router.get("/me", response_model=schemas.CarritoOut)
def obtener_carrito_me(db: Session = Depends(get_db), current=Depends(get_current_user)):
    carrito = crud.obtener_carrito_cliente(db, current.pk_id_cliente)
    if not carrito:
        raise HTTPException(status_code=404, detail='Carrito no encontrado')
    return carrito

@router.get("/{id_cliente}", response_model=schemas.CarritoOut)
def obtener_carrito(id_cliente: int, db: Session = Depends(get_db)):
    carrito = crud.obtener_carrito_cliente(db, id_cliente)
    if not carrito:
        raise HTTPException(status_code=404, detail='Carrito no encontrado')
    return carrito

@router.post("/{carrito_id}/productos", response_model=schemas.CarritoProductoOut)
def agregar_producto(carrito_id: int, data: schemas.CarritoProductoAdd, db: Session = Depends(get_db)):
    try:
        return crud.agregar_producto_carrito(db, carrito_id, data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/{carrito_id}/productos", response_model=list[schemas.CarritoProductoOut])
def listar_productos_carrito(carrito_id: int, db: Session = Depends(get_db)):
    return crud.listar_carrito_productos(db, carrito_id)

@router.get("/{carrito_id}/resumen", response_model=schemas.CarritoResumen)
def obtener_resumen(carrito_id: int, db: Session = Depends(get_db)):
    data = crud.resumen_carrito(db, carrito_id)
    return schemas.CarritoResumen(**data)

@router.patch("/item/{carrito_producto_id}", response_model=schemas.CarritoProductoOut)
def actualizar_item(carrito_producto_id: int, payload: schemas.CarritoProductoUpdate, db: Session = Depends(get_db)):
    try:
        reg = crud.actualizar_carrito_producto(db, carrito_producto_id, payload.cantidad)
        return reg
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.delete("/item/{carrito_producto_id}")
def eliminar_item(carrito_producto_id: int, db: Session = Depends(get_db)):
    try:
        crud.eliminar_carrito_producto(db, carrito_producto_id)
        return {"deleted": True}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/nuevo", response_model=schemas.CarritoOut)
def solicitar_nuevo_carrito(db: Session = Depends(get_db), current=Depends(get_current_user)):
    """Crear un nuevo carrito para el usuario (después de hacer un pedido con el anterior)"""
    nuevo_carrito = crud.crear_nuevo_carrito(db, current.pk_id_cliente)
    return nuevo_carrito
