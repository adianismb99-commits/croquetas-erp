// dateFormatter.js - Funciones para formatear fechas con zona horaria de Cuba

const TIMEZONE = 'America/Havana';
const LOCALE = 'es-CU';

/**
 * Formatea una fecha para mostrarla en la zona horaria de Cuba
 * @param {string|Date} fecha - La fecha a formatear
 * @param {Object} options - Opciones de formato (opcional)
 * @returns {string} Fecha formateada
 */
export const formatDate = (fecha, options = {}) => {
    if (!fecha) return '-';
    
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    const defaultOptions = {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options
    };
    
    return date.toLocaleString(LOCALE, defaultOptions);
};

/**
 * Formatea una fecha y hora completa
 */
export const formatDateTime = (fecha) => {
    if (!fecha) return '-';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleString(LOCALE, {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formatea solo la fecha (sin hora)
 */
export const formatDateOnly = (fecha) => {
    if (!fecha) return '-';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString(LOCALE, {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Formatea solo la hora
 */
export const formatTime = (fecha) => {
    if (!fecha) return '-';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleTimeString(LOCALE, {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Obtiene la fecha actual en la zona horaria de Cuba
 */
export const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
};

/**
 * Obtiene la fecha y hora actual en la zona horaria de Cuba
 */
export const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
};
