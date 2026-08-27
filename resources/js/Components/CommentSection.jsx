import { useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function CommentSection({ commentableType, commentableId, comments: initialComments = [] }) {
    const { auth } = usePage().props;
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isLoggedIn = auth && auth.user;

    const handleSubmit = async () => {
        console.log('✅ Botón clickeado');
        
        if (!isLoggedIn) {
            alert('Debes iniciar sesión');
            return;
        }
        
        if (!content.trim()) {
            alert('Escribe un comentario');
            return;
        }

        setIsSubmitting(true);
        console.log('📤 Enviando comentario...');

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/comentarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    _token: token,
                    content: content,
                    commentable_type: commentableType,
                    commentable_id: commentableId,
                    parent_id: null,
                }),
            });

            console.log('📡 Status:', response.status);
            const data = await response.json();
            console.log('📦 Data:', data);

            if (response.ok && data.success) {
                console.log('✅ Comentario guardado');
                // Recargar la página para mostrar el nuevo comentario
                window.location.reload();
            } else {
                alert('Error: ' + (data.message || 'Error desconocido'));
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error de conexión. Intenta de nuevo.');
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este comentario?')) return;

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/comentarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                window.location.reload();
            } else {
                alert('Error al eliminar el comentario.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión.');
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        try {
            return new Date(date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-[#162550] rounded-xl p-6 border border-[#E31837] text-center">
                <p className="text-gray-400">
                    <a href="/login" className="text-[#F5C518] hover:underline">
                        Inicia sesión
                    </a>
                    {' '}para dejar un comentario
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#162550] rounded-xl p-6 border border-[#E31837]">
            <h3 className="text-white font-bold text-lg mb-4">
                💬 Comentarios ({initialComments.length})
            </h3>

            {/* 👇 SIN FORMULARIO - SOLO UN DIV CON INPUT Y BOTÓN */}
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => {
                        console.log('✏️ Escribiendo:', e.target.value);
                        setContent(e.target.value);
                    }}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-[#0D1B3E] text-white border border-[#1A2F5A] rounded-lg px-4 py-2 focus:outline-none focus:border-[#F5C518]"
                />
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !content.trim()}
                    className="px-6 py-2 bg-[#F5C518] text-[#0D1B3E] rounded-lg font-semibold hover:bg-[#e0b000] transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                </button>
            </div>

            {/* Lista de comentarios */}
            {initialComments.length > 0 ? (
                <div className="space-y-4">
                    {initialComments.map((comment) => (
                        <div key={comment.id} className="border-b border-[#1A2F5A] pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-[#0D1B3E] rounded-full flex items-center justify-center text-xs font-bold text-[#F5C518] flex-shrink-0">
                                    {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-semibold text-sm">
                                            {comment.user?.name || 'Usuario'}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {comment.time_ago || formatDate(comment.created_at)}
                                        </span>
                                        {(auth.user && (auth.user.id === comment.user_id || auth.user.role === 'admin')) && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1 break-words">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 py-8">
                    <span className="text-4xl block mb-2">💬</span>
                    No hay comentarios aún. ¡Sé el primero en comentar!
                </div>
            )}
        </div>
    );
}