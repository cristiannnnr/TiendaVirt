CREATE TABLE CLIENTE (
    pk_id_cliente SERIAL PRIMARY KEY,
    primer_nombre VARCHAR(30) NOT NULL,
    segundo_nombre VARCHAR(30),
    primer_apellido VARCHAR(30) NOT NULL,
    segundo_apellido VARCHAR(30),
    fecha_nac DATE NOT NULL,
    cedula VARCHAR(15) NOT NULL,
    correo VARCHAR(50) NOT NULL,
    contraseña VARCHAR(100) NOT NULL
);

CREATE TABLE PRODUCTO (
    pk_id_producto SERIAL PRIMARY KEY,
    precio NUMERIC(8,2) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    descripcion VARCHAR(300)
);

CREATE TABLE CARRITO_COMPRA (
    pk_id_carrito_compra SERIAL PRIMARY KEY,
    fk_id_cliente INTEGER NOT NULL,
    FOREIGN KEY (fk_id_cliente) REFERENCES CLIENTE(pk_id_cliente)
);

CREATE TABLE ENVIO (
    pk_id_envio SERIAL PRIMARY KEY,
    tipo_envio VARCHAR(20) NOT NULL,
    costo_envio NUMERIC(7,2) NOT NULL
);

CREATE TABLE PEDIDO (
    pk_id_pedido SERIAL PRIMARY KEY,
    fk_id_carrito_compra INTEGER NOT NULL,
    fk_id_envio INTEGER NOT NULL,
    FOREIGN KEY (fk_id_carrito_compra) REFERENCES CARRITO_COMPRA(pk_id_carrito_compra),
    FOREIGN KEY (fk_id_envio) REFERENCES ENVIO(pk_id_envio)
);

CREATE TABLE VENTA (
    pk_id_venta SERIAL PRIMARY KEY,
    fk_id_pedido INTEGER NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    FOREIGN KEY (fk_id_pedido) REFERENCES PEDIDO(pk_id_pedido)
);

CREATE TABLE CARRITO_PRODUCTO (
    pk_id_carrito_producto SERIAL PRIMARY KEY,
    fk_id_carrito_compra INTEGER NOT NULL,
    fk_id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    FOREIGN KEY (fk_id_carrito_compra) REFERENCES CARRITO_COMPRA(pk_id_carrito_compra),
    FOREIGN KEY (fk_id_producto) REFERENCES PRODUCTO(pk_id_producto)
);

CREATE TABLE CATEGORIA (
    pk_id_categoria SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE PRODUCTO_CATEGORIA (
    pk_id_producto_categoria SERIAL PRIMARY KEY,
    fk_id_producto INTEGER NOT NULL,
    fk_id_categoria INTEGER NOT NULL,
    FOREIGN KEY (fk_id_producto) REFERENCES PRODUCTO(pk_id_producto),
    FOREIGN KEY (fk_id_categoria) REFERENCES CATEGORIA(pk_id_categoria)
);
