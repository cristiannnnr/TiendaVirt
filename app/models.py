from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Cliente(Base):
    __tablename__ = 'cliente'

    pk_id_cliente = Column(Integer, primary_key=True, index=True)
    primer_nombre = Column(String(30), nullable=False)
    segundo_nombre = Column(String(30))
    primer_apellido = Column(String(30), nullable=False)
    segundo_apellido = Column(String(30))
    fecha_nac = Column(Date, nullable=False)
    cedula = Column(String(15), nullable=False)
    correo = Column(String(50), nullable=False)
    contrasena = Column('contraseña', String(100), nullable=False)
    es_administrador = Column(Boolean, nullable=False, default=False)

    carrito = relationship('CarritoCompra', back_populates='cliente', uselist=False)

class Producto(Base):
    __tablename__ = 'producto'

    pk_id_producto = Column(Integer, primary_key=True, index=True)
    precio = Column(Numeric(8,2), nullable=False)
    nombre = Column(String(100), nullable=False)
    marca = Column(String(50))
    descripcion = Column(String(300))

    categorias = relationship('ProductoCategoria', back_populates='producto')

class CarritoCompra(Base):
    __tablename__ = 'carrito_compra'

    pk_id_carrito_compra = Column(Integer, primary_key=True, index=True)
    fk_id_cliente = Column(Integer, ForeignKey('cliente.pk_id_cliente'), nullable=False)

    cliente = relationship('Cliente', back_populates='carrito')
    productos = relationship('CarritoProducto', back_populates='carrito', cascade='all, delete-orphan')
    pedidos = relationship('Pedido', back_populates='carrito')

class Envio(Base):
    __tablename__ = 'envio'

    pk_id_envio = Column(Integer, primary_key=True, index=True)
    tipo_envio = Column(String(20), nullable=False)
    costo_envio = Column(Numeric(7,2), nullable=False)

    pedidos = relationship('Pedido', back_populates='envio')

class Pedido(Base):
    __tablename__ = 'pedido'

    pk_id_pedido = Column(Integer, primary_key=True, index=True)
    fk_id_carrito_compra = Column(Integer, ForeignKey('carrito_compra.pk_id_carrito_compra'), nullable=False)
    fk_id_envio = Column(Integer, ForeignKey('envio.pk_id_envio'), nullable=False)

    carrito = relationship('CarritoCompra', back_populates='pedidos')
    envio = relationship('Envio', back_populates='pedidos')
    venta = relationship('Venta', back_populates='pedido', uselist=False)

class Venta(Base):
    __tablename__ = 'venta'

    pk_id_venta = Column(Integer, primary_key=True, index=True)
    fk_id_pedido = Column(Integer, ForeignKey('pedido.pk_id_pedido'), nullable=False)
    metodo_pago = Column(String(30), nullable=False)
    total = Column(Numeric(10,2), nullable=False)

    pedido = relationship('Pedido', back_populates='venta')

class CarritoProducto(Base):
    __tablename__ = 'carrito_producto'

    pk_id_carrito_producto = Column(Integer, primary_key=True, index=True)
    fk_id_carrito_compra = Column(Integer, ForeignKey('carrito_compra.pk_id_carrito_compra'), nullable=False)
    fk_id_producto = Column(Integer, ForeignKey('producto.pk_id_producto'), nullable=False)
    cantidad = Column(Integer, nullable=False)

    carrito = relationship('CarritoCompra', back_populates='productos')
    producto = relationship('Producto')
    __table_args__ = (
        UniqueConstraint('fk_id_carrito_compra', 'fk_id_producto', name='uq_carrito_producto_unico'),
    )

class Categoria(Base):
    __tablename__ = 'categoria'

    pk_id_categoria = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String(100), nullable=False)

    productos = relationship('ProductoCategoria', back_populates='categoria')

class ProductoCategoria(Base):
    __tablename__ = 'producto_categoria'

    pk_id_producto_categoria = Column(Integer, primary_key=True, index=True)
    fk_id_producto = Column(Integer, ForeignKey('producto.pk_id_producto'), nullable=False)
    fk_id_categoria = Column(Integer, ForeignKey('categoria.pk_id_categoria'), nullable=False)

    producto = relationship('Producto', back_populates='categorias')
    categoria = relationship('Categoria', back_populates='productos')
