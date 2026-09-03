// formatters.js - Funciones para formatear valores de forma segura

export const formatNumber = (value) => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

export const formatInt = (value) => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'number' ? value : parseInt(value);
    return isNaN(num) ? 0 : num;
};

export const formatCurrency = (value) => {
    return `$${formatNumber(value)}`;
};
