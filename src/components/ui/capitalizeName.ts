function capitalizeName(str: string): string {
  // Asegúrate de que el string no es null/undefined y tiene longitud
  if (!str || str.length === 0) {
    return str;
  }

  // Si quieres que el resto del string esté en minúsculas (opcional pero recomendado)
  const restoEnMinusculas = str.slice(1).toLowerCase();

  // Combina la primera letra en mayúscula con el resto
  return str.charAt(0).toUpperCase() + restoEnMinusculas;
}

export default capitalizeName;
