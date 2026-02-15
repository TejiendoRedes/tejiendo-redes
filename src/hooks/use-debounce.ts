import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce de valores
 * @param value Valor a observar
 * @param delay Retardo en milisegundos
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Actualizar el valor debounced después del retardo
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancelar el timeout si el valor cambia o el componente se desmonta
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
