@extends('admin.layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Crear Jugador</h2>
                    <a href="{{ route('admin.players.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        ← Volver
                    </a>
                </div>

                @if($errors->any())
                    <div class="bg-red-100 text-red-700 p-3 rounded mb-4">
                        <ul>
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form action="{{ route('admin.players.store') }}" method="POST">
                    @csrf

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Nombre</label>
                            <input type="text" name="first_name" value="{{ old('first_name') }}" class="w-full border rounded px-3 py-2" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Apellido</label>
                            <input type="text" name="last_name" value="{{ old('last_name') }}" class="w-full border rounded px-3 py-2" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Equipo</label>
                            <select name="team_id" class="w-full border rounded px-3 py-2">
                                <option value="">Sin equipo</option>
                                @foreach($teams as $team)
                                    <option value="{{ $team->id }}" {{ old('team_id') == $team->id ? 'selected' : '' }}>
                                        {{ $team->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Dorsal</label>
                            <input type="number" name="dorsal" value="{{ old('dorsal') }}" min="1" max="99" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Posición</label>
                            <select name="position" class="w-full border rounded px-3 py-2">
                                <option value="">Seleccionar</option>
                                <option value="GK" {{ old('position') == 'GK' ? 'selected' : '' }}>Portero (GK)</option>
                                <option value="DF" {{ old('position') == 'DF' ? 'selected' : '' }}>Defensa (DF)</option>
                                <option value="MF" {{ old('position') == 'MF' ? 'selected' : '' }}>Mediocampista (MF)</option>
                                <option value="FW" {{ old('position') == 'FW' ? 'selected' : '' }}>Delantero (FW)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                            <input type="date" name="date_of_birth" value="{{ old('date_of_birth') }}" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Nacionalidad</label>
                            <input type="text" name="nationality" value="{{ old('nationality') }}" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Altura (cm)</label>
                            <input type="number" name="height" value="{{ old('height') }}" min="100" max="250" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Peso (kg)</label>
                            <input type="number" name="weight" value="{{ old('weight') }}" min="30" max="200" class="w-full border rounded px-3 py-2">
                        </div>

                        <div class="col-span-2">
                            <label class="block text-sm font-medium mb-1">Biografía</label>
                            <textarea name="biography" rows="4" class="w-full border rounded px-3 py-2">{{ old('biography') }}</textarea>
                        </div>

                        <div>
                            <label class="flex items-center">
                                <input type="checkbox" name="is_active" value="1" {{ old('is_active') ? 'checked' : '' }} class="mr-2">
                                <span class="text-sm font-medium">Activo</span>
                            </label>
                        </div>
                    </div>

                    <div class="mt-6">
                        <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Guardar Jugador
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection