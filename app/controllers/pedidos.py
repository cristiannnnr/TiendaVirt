from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user
from app.auth_utils import get_current_admin_user

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

@router.post("", response_model=schemas.PedidoOut)
def crear_pedido(data: schemas.PedidoCreate, db: Session = Depends(get_db)):
    try:
        return crud.crear_pedido(db, data)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("", response_model=list[schemas.PedidoList])
def listar_pedidos(
    current_user: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Listar todos los pedidos (solo admin)"""
    return crud.listar_pedidos(db)

@router.get("/{pedido_id}/total")
def calcular_total(pedido_id: int, db: Session = Depends(get_db)):
    try:
        total = crud.calcular_total_pedido(db, pedido_id)
        return {"pedido_id": pedido_id, "total": total}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
