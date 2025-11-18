"""
Script para limpiar clientes con contraseñas sin hashear
"""
from app.database import SessionLocal
from app import models

def limpiar_clientes():
    db = SessionLocal()
    try:
        # Eliminar todos los clientes (para empezar limpio)
        clientes = db.query(models.Cliente).all()
        print(f"Encontrados {len(clientes)} clientes")
        
        for cliente in clientes:
            # Si la contraseña no comienza con $2b$ (hash bcrypt), eliminar
            if not cliente.contrasena.startswith('$2b$'):
                print(f"Eliminando cliente con contraseña sin hashear: {cliente.correo}")
                
                # Obtener el carrito del cliente
                carrito = db.query(models.CarritoCompra).filter(
                    models.CarritoCompra.fk_id_cliente == cliente.pk_id_cliente
                ).first()
                
                if carrito:
                    # Eliminar pedidos asociados al carrito
                    pedidos = db.query(models.Pedido).filter(
                        models.Pedido.fk_id_carrito_compra == carrito.pk_id_carrito_compra
                    ).all()
                    for pedido in pedidos:
                        # Eliminar ventas asociadas al pedido
                        ventas = db.query(models.Venta).filter(
                            models.Venta.fk_id_pedido == pedido.pk_id_pedido
                        ).all()
                        for venta in ventas:
                            db.delete(venta)
                        db.delete(pedido)
                    
                    # Eliminar productos del carrito
                    db.query(models.CarritoProducto).filter(
                        models.CarritoProducto.fk_id_carrito_compra == carrito.pk_id_carrito_compra
                    ).delete()
                    
                    # Eliminar carrito
                    db.delete(carrito)
                
                # Finalmente eliminar cliente
                db.delete(cliente)
        
        db.commit()
        print("✅ Limpieza completada")
    finally:
        db.close()

if __name__ == "__main__":
    limpiar_clientes()
