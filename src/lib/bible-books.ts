// Constantes de libros de la Biblia con códigos OSIS estándar
// OSIS: Open Scripture Information Standard

export interface BibleBook {
    code: string; // Código OSIS
    name: string; // Nombre en español
    testament: "OT" | "NT"; // Antiguo o Nuevo Testamento
    chapters: number; // Número de capítulos
}

export const OLD_TESTAMENT_BOOKS: BibleBook[] = [
    // Pentateuco
    { code: "GEN", name: "Génesis", testament: "OT", chapters: 50 },
    { code: "EXO", name: "Éxodo", testament: "OT", chapters: 40 },
    { code: "LEV", name: "Levítico", testament: "OT", chapters: 27 },
    { code: "NUM", name: "Números", testament: "OT", chapters: 36 },
    { code: "DEU", name: "Deuteronomio", testament: "OT", chapters: 34 },

    // Libros Históricos
    { code: "JOS", name: "Josué", testament: "OT", chapters: 24 },
    { code: "JDG", name: "Jueces", testament: "OT", chapters: 21 },
    { code: "RUT", name: "Rut", testament: "OT", chapters: 4 },
    { code: "1SA", name: "1 Samuel", testament: "OT", chapters: 31 },
    { code: "2SA", name: "2 Samuel", testament: "OT", chapters: 24 },
    { code: "1KI", name: "1 Reyes", testament: "OT", chapters: 22 },
    { code: "2KI", name: "2 Reyes", testament: "OT", chapters: 25 },
    { code: "1CH", name: "1 Crónicas", testament: "OT", chapters: 29 },
    { code: "2CH", name: "2 Crónicas", testament: "OT", chapters: 36 },
    { code: "EZR", name: "Esdras", testament: "OT", chapters: 10 },
    { code: "NEH", name: "Nehemías", testament: "OT", chapters: 13 },
    { code: "EST", name: "Ester", testament: "OT", chapters: 10 },

    // Libros Poéticos
    { code: "JOB", name: "Job", testament: "OT", chapters: 42 },
    { code: "PSA", name: "Salmos", testament: "OT", chapters: 150 },
    { code: "PRO", name: "Proverbios", testament: "OT", chapters: 31 },
    { code: "ECC", name: "Eclesiastés", testament: "OT", chapters: 12 },
    { code: "SNG", name: "Cantares", testament: "OT", chapters: 8 },

    // Profetas Mayores
    { code: "ISA", name: "Isaías", testament: "OT", chapters: 66 },
    { code: "JER", name: "Jeremías", testament: "OT", chapters: 52 },
    { code: "LAM", name: "Lamentaciones", testament: "OT", chapters: 5 },
    { code: "EZK", name: "Ezequiel", testament: "OT", chapters: 48 },
    { code: "DAN", name: "Daniel", testament: "OT", chapters: 12 },

    // Profetas Menores
    { code: "HOS", name: "Oseas", testament: "OT", chapters: 14 },
    { code: "JOL", name: "Joel", testament: "OT", chapters: 3 },
    { code: "AMO", name: "Amós", testament: "OT", chapters: 9 },
    { code: "OBA", name: "Abdías", testament: "OT", chapters: 1 },
    { code: "JON", name: "Jonás", testament: "OT", chapters: 4 },
    { code: "MIC", name: "Miqueas", testament: "OT", chapters: 7 },
    { code: "NAM", name: "Nahúm", testament: "OT", chapters: 3 },
    { code: "HAB", name: "Habacuc", testament: "OT", chapters: 3 },
    { code: "ZEP", name: "Sofonías", testament: "OT", chapters: 3 },
    { code: "HAG", name: "Hageo", testament: "OT", chapters: 2 },
    { code: "ZEC", name: "Zacarías", testament: "OT", chapters: 14 },
    { code: "MAL", name: "Malaquías", testament: "OT", chapters: 4 },
];

export const NEW_TESTAMENT_BOOKS: BibleBook[] = [
    // Evangelios
    { code: "MAT", name: "Mateo", testament: "NT", chapters: 28 },
    { code: "MRK", name: "Marcos", testament: "NT", chapters: 16 },
    { code: "LUK", name: "Lucas", testament: "NT", chapters: 24 },
    { code: "JHN", name: "Juan", testament: "NT", chapters: 21 },

    // Historia
    { code: "ACT", name: "Hechos", testament: "NT", chapters: 28 },

    // Cartas de Pablo
    { code: "ROM", name: "Romanos", testament: "NT", chapters: 16 },
    { code: "1CO", name: "1 Corintios", testament: "NT", chapters: 16 },
    { code: "2CO", name: "2 Corintios", testament: "NT", chapters: 13 },
    { code: "GAL", name: "Gálatas", testament: "NT", chapters: 6 },
    { code: "EPH", name: "Efesios", testament: "NT", chapters: 6 },
    { code: "PHP", name: "Filipenses", testament: "NT", chapters: 4 },
    { code: "COL", name: "Colosenses", testament: "NT", chapters: 4 },
    { code: "1TH", name: "1 Tesalonicenses", testament: "NT", chapters: 5 },
    { code: "2TH", name: "2 Tesalonicenses", testament: "NT", chapters: 3 },
    { code: "1TI", name: "1 Timoteo", testament: "NT", chapters: 6 },
    { code: "2TI", name: "2 Timoteo", testament: "NT", chapters: 4 },
    { code: "TIT", name: "Tito", testament: "NT", chapters: 3 },
    { code: "PHM", name: "Filemón", testament: "NT", chapters: 1 },

    // Cartas Generales
    { code: "HEB", name: "Hebreos", testament: "NT", chapters: 13 },
    { code: "JAS", name: "Santiago", testament: "NT", chapters: 5 },
    { code: "1PE", name: "1 Pedro", testament: "NT", chapters: 5 },
    { code: "2PE", name: "2 Pedro", testament: "NT", chapters: 3 },
    { code: "1JN", name: "1 Juan", testament: "NT", chapters: 5 },
    { code: "2JN", name: "2 Juan", testament: "NT", chapters: 1 },
    { code: "3JN", name: "3 Juan", testament: "NT", chapters: 1 },
    { code: "JUD", name: "Judas", testament: "NT", chapters: 1 },

    // Profecía
    { code: "REV", name: "Apocalipsis", testament: "NT", chapters: 22 },
];

export const ALL_BIBLE_BOOKS: BibleBook[] = [
    ...OLD_TESTAMENT_BOOKS,
    ...NEW_TESTAMENT_BOOKS,
];

/**
 * Busca un libro por su código OSIS
 */
export function getBookByCode(code: string): BibleBook | undefined {
    return ALL_BIBLE_BOOKS.find((book) => book.code === code);
}

/**
 * Busca un libro por su nombre
 */
export function getBookByName(name: string): BibleBook | undefined {
    return ALL_BIBLE_BOOKS.find(
        (book) => book.name.toLowerCase() === name.toLowerCase()
    );
}

/**
 * Obtiene todos los libros de un testamento
 */
export function getBooksByTestament(testament: "OT" | "NT"): BibleBook[] {
    return ALL_BIBLE_BOOKS.filter((book) => book.testament === testament);
}

/**
 * Valida si un capítulo existe en un libro
 */
export function isValidChapter(bookCode: string, chapter: number): boolean {
    const book = getBookByCode(bookCode);
    if (!book) return false;
    return chapter >= 1 && chapter <= book.chapters;
}
