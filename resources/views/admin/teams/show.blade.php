@extends('admin.layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Detalles del Equipo</h2>
                    <div>
                        <a href="{{ route('admin.teams.edit', $team) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                            Editar
                        </a>
                        <a href="{{ route('admin.teams.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            ← Volver
                        </a>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Información General</h3>
                        <table class="w-full">
                            <tr>
                                <td class="font-medium py-2">Nombre:</td>
                                <td class="py-2">{{ $team->name }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Ciudad:</td>
                                <td class="py-2">{{ $team->city ?? 'No especificada' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Año de Fundación:</td>
                                <td class="py-2">{{ $team->founded_year ?? 'No especificado' }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Colores:</td>
                                <td class="py-2">
                                    <span class="inline-block w-6 h-6 rounded border" style="background-color: {{ $team->primary_color ?? '#000' }}"></span>
                                    <span class="inline-block w-6 h-6 rounded border ml-2" style="background-color: {{ $team->secondary_color ?? '#FFF' }}"></span>
                                </td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Estado:</td>
                                <td class="py-2">
                                    <span class="px-2 py-1 text-sm rounded {{ $team->is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                        {{ $team->is_active ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold mb-4">Estadísticas</h3>
                        <table class="w-full">
                            <tr>
                                <td class="font-medium py-2">Slug:</td>
                                <td class="py-2">{{ $team->slug }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Creado:</td>
                                <td class="py-2">{{ $team->created_at->format('d/m/Y H:i') }}</td>
                            </tr>
                            <tr>
                                <td class="font-medium py-2">Última actualización:</td>
                                <td class="py-2">{{ $team->updated_at->format('d/m/Y H:i') }}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="col-span-2">
                        <h3 class="text-lg font-semibold mb-4">Historia</h3>
                        <p class="text-gray-700">{{ $team->history ?? 'No hay historia disponible.' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection