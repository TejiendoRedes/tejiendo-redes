/**
 * Convierte un texto a formato Título (Title Case).
 * Ejemplo: "JUAN PEREZ" -> "Juan Perez"
 * Ejemplo: "MARÍA DE LOS ÁNGELES" -> "María De Los Ángeles"
 */
export function toTitleCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

/**
 * Capitaliza solo la primera letra de la cadena completa.
 */
export function toSentenceCase(str: string | null | undefined): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
