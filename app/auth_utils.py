"""Utilidades de autorización para funciones administrativas"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models

async def get_current_admin_user(
    current_user: models.Cliente = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verificar que el usuario actual sea administrador"""
    if not current_user or not current_user.es_administrador:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren permisos de administrador"
        )
    
    return current_user
