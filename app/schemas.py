from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional, List

class ClienteCreate(BaseModel):
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    fecha_nac: date
    cedula: str
    correo: EmailStr
    contrasena: str = Field(min_length=6)

class ClienteOut(BaseModel):
    pk_id_cliente: int
    primer_nombre: str
    segundo_nombre: Optional[str]
    primer_apellido: str
    segundo_apellido: Optional[str]
    fecha_nac: date
    cedula: str
    correo: EmailStr

    class Config:
        from_attributes = True

class ProductoCreate(BaseModel):
    precio: float
    nombre: str
    marca: Optional[str] = None
    descripcion: Optional[str] = None

class ProductoOut(BaseModel):
    pk_id_producto: int
    precio: float
    nombre: str
    marca: Optional[str]
    descripcion: Optional[str]

    class Config:
        from_attributes = True

class CarritoOut(BaseModel):
    pk_id_carrito_compra: int
    fk_id_cliente: int
    class Config:
        from_attributes = True

class CarritoProductoAdd(BaseModel):
    fk_id_producto: int
    cantidad: int = Field(gt=0)

class CarritoProductoOut(BaseModel):
    pk_id_carrito_producto: int
    fk_id_carrito_compra: int
    fk_id_producto: int
    cantidad: int
    producto: ProductoOut | None = None

    class Config:
        from_attributes = True

class CarritoProductoUpdate(BaseModel):
    cantidad: int = Field(gt=0)

class CarritoResumen(BaseModel):
    carrito_id: int
    total_items: int
    subtotal: float
    class Config:
        from_attributes = True

class EnvioCreate(BaseModel):
    tipo_envio: str
    costo_envio: float

class EnvioOut(BaseModel):
    pk_id_envio: int
    tipo_envio: str
    costo_envio: float

    class Config:
        from_attributes = True

class PedidoCreate(BaseModel):
    fk_id_carrito_compra: int
    fk_id_envio: int

class PedidoOut(BaseModel):
    pk_id_pedido: int
    fk_id_carrito_compra: int
    fk_id_envio: int

    class Config:
        from_attributes = True

class VentaOut(BaseModel):
    pk_id_venta: int
    fk_id_pedido: int
    metodo_pago: str
    total: float

    class Config:
        from_attributes = True

# Autenticación
class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserMe(BaseModel):
    pk_id_cliente: int
    correo: EmailStr
    primer_nombre: str
    primer_apellido: str

    class Config:
        from_attributes = True

class PedidoList(PedidoOut):
    pass

class VentaList(VentaOut):
    pass

class VentaCreate(BaseModel):
    fk_id_pedido: int
    metodo_pago: str
    total: float

class VentaOut(BaseModel):
    pk_id_venta: int
    fk_id_pedido: int
    metodo_pago: str
    total: float

    class Config:
        from_attributes = True
