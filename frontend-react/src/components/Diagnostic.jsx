import { useState, useEffect } from 'react';
import { Card } from './ui/Card';

export function Diagnostic() {
  const [status, setStatus] = useState('Probando...');
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function test() {
      try {
        // Test 1: Health check
        const healthResp = await fetch('http://127.0.0.1:8000/health');
        const healthData = await healthResp.json();
        console.log('Health check:', healthData);
        
        // Test 2: Productos
        const prodResp = await fetch('http://127.0.0.1:8000/productos');
        const prodData = await prodResp.json();
        console.log('Productos:', prodData);
        
        setStatus('✅ Backend conectado');
        setProductos(prodData);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setStatus('❌ Error de conexión');
      }
    }
    test();
  }, []);

  return (
    <Card title="🔧 Diagnóstico de Conexión">
      <div style={{ padding: '1rem' }}>
        <p><strong>Estado:</strong> {status}</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {productos && (
          <div>
            <p><strong>Productos encontrados:</strong> {productos.length}</p>
            <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(productos, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}
