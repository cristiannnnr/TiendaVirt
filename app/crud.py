from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, desc
from . import models
from . import schemas

# CLIENTE

def crear_cliente(db: Session, data: schemas.ClienteCreate) -> models.Cliente:
    cliente = models.Cliente(
        primer_nombre=data.primer_nombre,
        segundo_nombre=data.segundo_nombre,
        primer_apellido=data.primer_apellido,
        segundo_apellido=data.segundo_apellido,
        fecha_nac=data.fecha_nac,
        cedula=data.cedula,
        correo=data.correo,
        contrasena=data.contrasena,
    )
    db.add(cliente)
    db.flush()  # ID disponible
    # Crear carrito automático si no existe
    carrito = models.CarritoCompra(fk_id_cliente=cliente.pk_id_cliente)
    db.add(carrito)
    db.commit()
    db.refresh(cliente)
    return cliente

def listar_clientes(db: Session):
    return db.execute(select(models.Cliente)).scalars().all()

def obtener_cliente_por_correo(db: Session, correo: str):
    q = select(models.Cliente).where(models.Cliente.correo == correo)
    return db.execute(q).scalar_one_or_none()

def obtener_carritos_cliente(db: Session, id_cliente: int):
    """Obtener todos los carritos del cliente (útil para ver todos sus pedidos históricos)"""
    q = select(models.CarritoCompra).where(models.CarritoCompra.fk_id_cliente == id_cliente)
    return db.execute(q).scalars().all()

# PRODUCTO

def crear_producto(db: Session, data: schemas.ProductoCreate):
    producto = models.Producto(**data.dict())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto

def listar_productos(db: Session):
    return db.execute(select(models.Producto)).scalars().all()

# CARRITO

def obtener_carrito_cliente(db: Session, id_cliente: int):
    """Obtener el carrito más reciente del cliente (ordenado por ID descendente)"""
    q = select(models.CarritoCompra).where(
        models.CarritoCompra.fk_id_cliente == id_cliente
    ).order_by(desc(models.CarritoCompra.pk_id_carrito_compra))
    return db.execute(q).scalars().first()

def crear_nuevo_carrito(db: Session, id_cliente: int) -> models.CarritoCompra:
    """Crear un nuevo carrito para el cliente (para cuando ya tiene uno bloqueado con un pedido)"""
    carrito = models.CarritoCompra(fk_id_cliente=id_cliente)
    db.add(carrito)
    db.commit()
    db.refresh(carrito)
    return carrito

# CARRITO PRODUCTO

def agregar_producto_carrito(db: Session, carrito_id: int, data: schemas.CarritoProductoAdd):
    # validar que existe producto
    prod = db.get(models.Producto, data.fk_id_producto)
    if not prod:
        raise ValueError('Producto no existe')
    # buscar si ya existe
    q = select(models.CarritoProducto).where(
        models.CarritoProducto.fk_id_carrito_compra == carrito_id,
        models.CarritoProducto.fk_id_producto == data.fk_id_producto
    )
    existente = db.execute(q).scalar_one_or_none()
    if existente:
        existente.cantidad += data.cantidad
        db.commit()
        db.refresh(existente)
        return existente
    registro = models.CarritoProducto(
        fk_id_carrito_compra=carrito_id,
        fk_id_producto=data.fk_id_producto,
        cantidad=data.cantidad
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro

def listar_carrito_productos(db: Session, carrito_id: int):
    q = select(models.CarritoProducto).where(
        models.CarritoProducto.fk_id_carrito_compra == carrito_id
    ).options(selectinload(models.CarritoProducto.producto))
    return db.execute(q).scalars().all()

def actualizar_carrito_producto(db: Session, carrito_producto_id: int, cantidad: int):
    registro = db.get(models.CarritoProducto, carrito_producto_id)
    if not registro:
        raise ValueError('Registro de carrito-producto no existe')
    registro.cantidad = cantidad
    db.commit()
    db.refresh(registro)
    return registro

def eliminar_carrito_producto(db: Session, carrito_producto_id: int):
    registro = db.get(models.CarritoProducto, carrito_producto_id)
    if not registro:
        raise ValueError('Registro no existe')
    db.delete(registro)
    db.commit()
    return True

def resumen_carrito(db: Session, carrito_id: int):
    q = select(models.CarritoProducto).where(models.CarritoProducto.fk_id_carrito_compra == carrito_id)
    items = db.execute(q).scalars().all()
    subtotal = 0.0
    total_items = 0
    for it in items:
        prod = db.get(models.Producto, it.fk_id_producto)
        if prod:
            subtotal += float(prod.precio) * it.cantidad
            total_items += it.cantidad
    return {'carrito_id': carrito_id, 'subtotal': round(subtotal, 2), 'total_items': total_items}

# ENVIO

def crear_envio(db: Session, data: schemas.EnvioCreate):
    envio = models.Envio(**data.dict())
    db.add(envio)
    db.commit()
    db.refresh(envio)
    return envio

def listar_envios(db: Session):
    return db.execute(select(models.Envio)).scalars().all()

# PEDIDO

def crear_pedido(db: Session, data: schemas.PedidoCreate):
    carrito = db.get(models.CarritoCompra, data.fk_id_carrito_compra)
    if not carrito:
        raise ValueError('Carrito no existe')
    envio = db.get(models.Envio, data.fk_id_envio)
    if not envio:
        raise ValueError('Envio no existe')
    pedido = models.Pedido(fk_id_carrito_compra=data.fk_id_carrito_compra, fk_id_envio=data.fk_id_envio)
    db.add(pedido)
    db.commit()
    db.refresh(pedido)
    return pedido

def listar_pedidos(db: Session):
    return db.execute(select(models.Pedido)).scalars().all()

# VENTA

def registrar_venta(db: Session, data: schemas.VentaCreate):
    pedido = db.get(models.Pedido, data.fk_id_pedido)
    if not pedido:
        raise ValueError('Pedido no existe')
    venta = models.Venta(**data.dict())
    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta

def listar_ventas(db: Session):
    return db.execute(select(models.Venta)).scalars().all()

def calcular_total_pedido(db: Session, pedido_id: int):
    pedido = db.get(models.Pedido, pedido_id)
    if not pedido:
        raise ValueError('Pedido no existe')
    carrito = db.get(models.CarritoCompra, pedido.fk_id_carrito_compra)
    envio = db.get(models.Envio, pedido.fk_id_envio)
    if not carrito or not envio:
        raise ValueError('Datos faltantes para calcular total')
    q = select(models.CarritoProducto).where(models.CarritoProducto.fk_id_carrito_compra == carrito.pk_id_carrito_compra)
    items = db.execute(q).scalars().all()
    subtotal = 0.0
    for it in items:
        prod = db.get(models.Producto, it.fk_id_producto)
        if prod:
            subtotal += float(prod.precio) * it.cantidad
    total = subtotal + float(envio.costo_envio)
    return round(total, 2)
