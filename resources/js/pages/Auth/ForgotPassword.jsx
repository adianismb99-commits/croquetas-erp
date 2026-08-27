import React from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/forgot-password');
  };

  return (
    <GuestLayout>
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-[#2D1B3D] text-center mb-6">Recuperar contraseña</h1>

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

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-[#6B3FA0] hover:bg-[#9B6FC0] text-white py-2 rounded-lg transition-colors"
            >
              Enviar enlace de recuperación
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          <a href="/login" className="text-[#6B3FA0] hover:underline">
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </GuestLayout>
  );
}