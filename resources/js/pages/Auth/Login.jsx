import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useForm } from '@inertiajs/react';

export default function Login({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <GuestLayout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-[#2D1B3D] text-center mb-6">Croquetas ERP</h1>
        
        {status && <div className="mb-4 text-green-600">{status}</div>}

        <form onSubmit={submit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#6B3FA0] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white py-2 rounded-lg transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-[#6B3FA0] hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </GuestLayout>
  );
}