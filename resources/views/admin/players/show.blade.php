@extends('admin.layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Detalles del Jugador</h2>
                    <div>
                        <a href="{{ route('admin.players.edit', $player) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                            Editar
                        </a>
                        <a href="{{ route('admin.players.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            ← Volver
                        </a>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Información Personal</h3>
                        <table class="w-full">
                            <tr>
                                <td class="font-medium py-2">Nombre completo:</td>
                                <td class="py-2">{{ $player->first_name }} {{ $player->last_name }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Fecha de nacimiento:</td>
                                <td class="py-2">{{ $player->date_of_birth ?? 'No especificada' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Nacionalidad:</td>
                                <td class="py-2">{{ $player->nationality ?? 'No especificada' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Altura:</td>
                                <td class="py-2">{{ $player->height ? $player->height . ' cm' : 'No especificada' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Peso:</td>
                                <td class="py-2">{{ $player->weight ? $player->weight . ' kg' : 'No especificado' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Estado:</td>
                                <td class="py-2">
                                    <span class="px-2 py-1 text-sm rounded {{ $player->is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                        {{ $player->is_active ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold mb-4">Información Deportiva</h3>
                        <table class="w-full">
                            <tr>
                                <td class="font-medium py-2">Equipo:</td>
                                <td class="py-2">{{ $player->team->name ?? 'Sin equipo' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Dorsal:</td>
                                <td class="py-2">{{ $player->dorsal ?? 'No asignado' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Posición:</td>
                                <td class="py-2">
                                    @php
                                        $positions = ['GK' => 'Portero', 'DF' => 'Defensa', 'MF' => 'Mediocampista', 'FW' => 'Delantero'];
                                    @endphp
                                    {{ $player->position ? ($positions[$player->position] ?? $player->position) : 'No especificada' }}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="col-span-2">
                        <h3 class="text-lg font-semibold mb-4">Biografía</h3>
                        <p class="text-gray-700">{{ $player->biography ?? 'No hay biografía disponible.' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection