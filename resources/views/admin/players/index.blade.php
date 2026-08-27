@extends('admin.layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Jugadores</h2>
                    <a href="{{ route('admin.players.create') }}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        + Crear Jugador
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
                            <th class="border p-2 text-left">Equipo</th>
                            <th class="border p-2 text-left">Posición</th>
                            <th class="border p-2 text-left">Dorsal</th>
                            <th class="border p-2 text-left">Estado</th>
                            <th class="border p-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($players as $player)
                            <tr>
                                <td class="border p-2">{{ $player->id }}</td>
                                <td class="border p-2">{{ $player->first_name }} {{ $player->last_name }}</td>
                                <td class="border p-2">{{ $player->team->name ?? 'Sin equipo' }}</td>
                                <td class="border p-2">
                                    @if($player->position)
                                        @php
                                            $positions = ['GK' => 'Portero', 'DF' => 'Defensa', 'MF' => 'Mediocampista', 'FW' => 'Delantero'];
                                        @endphp
                                        {{ $positions[$player->position] ?? $player->position }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td class="border p-2">{{ $player->dorsal ?? '-' }}</td>
                                <td class="border p-2">
                                    <span class="px-2 py-1 text-sm rounded {{ $player->is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                        {{ $player->is_active ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td class="border p-2">
                                    <a href="{{ route('admin.players.show', $player) }}" class="text-blue-500 hover:underline">Ver</a>
                                    <a href="{{ route('admin.players.edit', $player) }}" class="text-yellow-500 hover:underline ml-2">Editar</a>
                                    <form action="{{ route('admin.players.destroy', $player) }}" method="POST" class="inline" onsubmit="return confirm('¿Seguro que quieres eliminar este jugador?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-500 hover:underline ml-2 bg-transparent border-none cursor-pointer">Eliminar</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="border p-2 text-center text-gray-500">No hay jugadores registrados.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection