import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#2D1B3D]">Dashboard</h1>
        <p className="text-gray-600">¡Bienvenido al panel de control!</p>
      </div>
    </AuthenticatedLayout>
  );
}