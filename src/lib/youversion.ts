// Helper para generar URLs de YouVersion (bible.com)
// Más info: https://www.bible.com/

// Mapeo de versiones de la Biblia a sus IDs en YouVersion
const VERSION_IDS: Record<string, number> = {
    NVI: 128, // Nueva Versión Internacional
    RVR1960: 149, // Reina Valera 1960
    NTV: 127, // Nueva Traducción Viviente
    DHH: 128, // Dios Habla Hoy
    TLA: 188, // Traducción en Lenguaje Actual
    PDT: 731, // Palabra de Dios para Todos
};

/**
 * Genera una URL de YouVersion para abrir un capítulo específico
 * @param book - Código OSIS del libro (e.g., "JER", "GEN", "MAT")
 * @param chapter - Número del capítulo
 * @param version - Versión de la Biblia (default: "NVI")
 * @returns URL completa de bible.com
 * 
 * @example
 * getYouVersionUrl("JER", 13, "NVI")
 * // Returns: "https://www.bible.com/bible/128/JER.13.NVI"
 */
export function getYouVersionUrl(
    book: string,
    chapter: number,
    version: string = "NVI"
): string {
    const versionId = VERSION_IDS[version] || VERSION_IDS.NVI;
    return `https://www.bible.com/bible/${versionId}/${book}.${chapter}.${version}`;
}

/**
 * Genera una URL de YouVersion para abrir un rango de versículos
 * @param book - Código OSIS del libro
 * @param chapter - Número del capítulo
 * @param startVerse - Versículo inicial
 * @param endVerse - Versículo final (opcional)
 * @param version - Versión de la Biblia (default: "NVI")
 * @returns URL completa de bible.com
 * 
 * @example
 * getYouVersionUrlWithVerses("JHN", 3, 16, 18, "NVI")
 * // Returns: "https://www.bible.com/bible/128/JHN.3.16-18.NVI"
 */
export function getYouVersionUrlWithVerses(
    book: string,
    chapter: number,
    startVerse: number,
    endVerse?: number,
    version: string = "NVI"
): string {
    const versionId = VERSION_IDS[version] || VERSION_IDS.NVI;
    const verseRange = endVerse ? `${startVerse}-${endVerse}` : `${startVerse}`;
    return `https://www.bible.com/bible/${versionId}/${book}.${chapter}.${verseRange}.${version}`;
}

/**
 * Obtiene el nombre de la versión por su código
 */
export function getVersionName(versionCode: string): string {
    const names: Record<string, string> = {
        NVI: "Nueva Versión Internacional",
        RVR1960: "Reina Valera 1960",
        NTV: "Nueva Traducción Viviente",
        DHH: "Dios Habla Hoy",
        TLA: "Traducción en Lenguaje Actual",
        PDT: "Palabra de Dios para Todos",
    };
    return names[versionCode] || versionCode;
}

/**
 * Obtiene todas las versiones disponibles
 */
export function getAvailableVersions(): { code: string; name: string; id: number }[] {
    return Object.entries(VERSION_IDS).map(([code, id]) => ({
        code,
        name: getVersionName(code),
        id,
    }));
}
