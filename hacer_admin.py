#!/usr/bin/env python3
"""Script para convertir un usuario existente a administrador"""

from app.database import SessionLocal
from app import crud

def hacer_admin(cliente_id: int):
    db = SessionLocal()
    try:
        print("=" * 60)
        print(f"Convirtiendo usuario {cliente_id} a administrador...")
        print("=" * 60)
        
        # Actualizar estado
        cliente = crud.actualizar_estado_admin(db, cliente_id, True)
        
        print("\n" + "=" * 60)
        print("✅ USUARIO CONVERTIDO A ADMINISTRADOR")
        print("=" * 60)
        print(f"ID: {cliente.pk_id_cliente}")
        print(f"Nombre: {cliente.primer_nombre} {cliente.primer_apellido}")
        print(f"Correo: {cliente.correo}")
        print(f"Estado: 👑 ADMINISTRADOR")
        print("=" * 60)
        
    except ValueError as e:
        print(f"❌ Error: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        try:
            cliente_id = int(sys.argv[1])
            hacer_admin(cliente_id)
        except ValueError:
            print("❌ Error: El ID debe ser un número")
    else:
        cliente_id = input("Ingresa el ID del cliente a convertir en admin: ").strip()
        try:
            cliente_id = int(cliente_id)
            hacer_admin(cliente_id)
        except ValueError:
            print("❌ Error: El ID debe ser un número")
