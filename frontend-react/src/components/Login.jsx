import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useToasts } from './ui/ToastProvider';

export function Login(){
  const { login, register, loading } = useAuth();
  const { addToast } = useToasts();
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({correo:'', contrasena:'', primer_nombre:'', primer_apellido:'', fecha_nac:'', cedula:''});
  const isRegister = mode==='register';

  const submit = async (e) => {
    e.preventDefault();
    try {
      if(isRegister){
        await register({
          correo: form.correo,
          contrasena: form.contrasena,
          primer_nombre: form.primer_nombre,
          segundo_nombre: '',
          primer_apellido: form.primer_apellido,
          segundo_apellido: '',
          fecha_nac: form.fecha_nac,
          cedula: form.cedula
        });
        addToast('¡Registro exitoso! Bienvenido/a', 'success');
      } else {
        await login(form.correo, form.contrasena);
        addToast('¡Bienvenido/a de nuevo!', 'success');
      }
    } catch(err) {
      addToast(err.message || 'Error en la operación', 'error');
    }
  };

  return (
    <Card title={isRegister? 'Registro' : 'Ingreso'} actions={<Button variant="secondary" onClick={()=> setMode(isRegister?'login':'register')}>{isRegister?'Ya tengo cuenta':'Quiero registrarme'}</Button>}>
      <form onSubmit={submit} className="form-grid" aria-label={isRegister? 'Formulario registro':'Formulario login'}>
        <input type="email" placeholder="Correo" value={form.correo} onChange={e=>setForm(f=>({...f,correo:e.target.value}))} required />
        <input type="password" placeholder="Contraseña" value={form.contrasena} onChange={e=>setForm(f=>({...f,contrasena:e.target.value}))} required />
        {isRegister && (
          <>
            <input placeholder="Nombre" value={form.primer_nombre} onChange={e=>setForm(f=>({...f,primer_nombre:e.target.value}))} required />
            <input placeholder="Apellido" value={form.primer_apellido} onChange={e=>setForm(f=>({...f,primer_apellido:e.target.value}))} required />
            <input type="date" placeholder="Fecha Nac" value={form.fecha_nac} onChange={e=>setForm(f=>({...f,fecha_nac:e.target.value}))} required />
            <input placeholder="Cédula" value={form.cedula} onChange={e=>setForm(f=>({...f,cedula:e.target.value}))} required />
          </>
        )}
        <Button type="submit" disabled={loading}>{loading? <Spinner size={18}/> : (isRegister? 'Registrarme':'Ingresar')}</Button>
      </form>
    </Card>
  );
}
