@extends('admin.layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Equipos</h2>
                    <a href="{{ route('admin.teams.create') }}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        + Crear Equipo
                    </a>
                </div>

                @if(session('success'))
                    <div class="bg-green-100 text-green-700 p-3 rounded mb-4">
                        {{ session('success') }}
                    </div>
                @endif

                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border p-2 text-left">#</th>
                            <th class="border p-2 text-left">Nombre</th>
                            <th class="border p-2 text-left">Ciudad</th>
                            <th class="border p-2 text-left">Año</th>
                            <th class="border p-2 text-left">Estado</th>
                            <th class="border p-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($teams as $team)
                            <tr>
                                <td class="border p-2">{{ $team->id }}</td>
                                <td class="border p-2">{{ $team->name }}</td>
                                <td class="border p-2">{{ $team->city ?? '-' }}</td>
                                <td class="border p-2">{{ $team->founded_year ?? '-' }}</td>
                                <td class="border p-2">
                                    <span class="px-2 py-1 text-sm rounded {{ $team->is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                        {{ $team->is_active ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td class="border p-2">
                                    <a href="{{ route('admin.teams.show', $team) }}" class="text-blue-500 hover:underline">Ver</a>
                                    <a href="{{ route('admin.teams.edit', $team) }}" class="text-yellow-500 hover:underline ml-2">Editar</a>
                                    <form action="{{ route('admin.teams.destroy', $team) }}" method="POST" class="inline" onsubmit="return confirm('¿Seguro que quieres eliminar este equipo?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-500 hover:underline ml-2 bg-transparent border-none cursor-pointer">Eliminar</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="border p-2 text-center text-gray-500">No hay equipos registrados.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection