@extends('admin.layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Crear Equipo</h2>
                    <a href="{{ route('admin.teams.index') }}" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
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

                <form action="{{ route('admin.teams.store') }}" method="POST">
                    @csrf

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Nombre del Equipo</label>
                            <input type="text" name="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Ciudad</label>
                            <input type="text" name="city" value="{{ old('city') }}" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Año de Fundación</label>
                            <input type="number" name="founded_year" value="{{ old('founded_year') }}" min="1800" max="{{ date('Y') }}" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Color Principal</label>
                            <input type="color" name="primary_color" value="{{ old('primary_color', '#000000') }}" class="w-full border rounded px-3 py-2">
                        </div>

                        <div>
                            <label class="block text-sm font-medium mb-1">Color Secundario</label>
                            <input type="color" name="secondary_color" value="{{ old('secondary_color', '#FFFFFF') }}" class="w-full border rounded px-3 py-2">
                        </div>

                        <div class="col-span-2">
                            <label class="block text-sm font-medium mb-1">Historia</label>
                            <textarea name="history" rows="4" class="w-full border rounded px-3 py-2">{{ old('history') }}</textarea>
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
                            Crear Equipo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection