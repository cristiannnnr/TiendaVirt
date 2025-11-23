from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.ClienteOut, status_code=201)
def register(data: schemas.ClienteCreate, db: Session = Depends(get_db)):
    # Validar correo único
    existente = crud.obtener_cliente_por_correo(db, data.correo)
    if existente:
        raise HTTPException(status_code=400, detail="Correo ya registrado")
    
    # Hashear contraseña
    hashed = get_password_hash(data.contrasena)
    
    # Crear cliente con contraseña hasheada
    from app import models
    cliente = models.Cliente(
        primer_nombre=data.primer_nombre,
        segundo_nombre=data.segundo_nombre,
        primer_apellido=data.primer_apellido,
        segundo_apellido=data.segundo_apellido,
        fecha_nac=data.fecha_nac,
        cedula=data.cedula,
        correo=data.correo,
        contrasena=hashed,
        es_administrador=False
    )
    db.add(cliente)
    db.flush()  # ID disponible
    
    # Crear carrito automático
    carrito = models.CarritoCompra(fk_id_cliente=cliente.pk_id_cliente)
    db.add(carrito)
    db.commit()
    db.refresh(cliente)
    return cliente

@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    cliente = crud.obtener_cliente_por_correo(db, payload.correo)
    if not cliente or not verify_password(payload.contrasena, cliente.contrasena):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    token = create_access_token(subject=cliente.correo)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserMe)
def me(current=Depends(get_current_user)):
    return current
