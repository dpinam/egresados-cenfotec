/* ============================================================
   almacenamiento.js
   Capa de persistencia del sistema.
   Encapsula el acceso a Local Storage usando JSON.stringify()
   y JSON.parse(), para que el resto del codigo no dependa
   directamente de la API del navegador.
   ============================================================ */

const Almacenamiento = {

  /* Devuelve la coleccion guardada bajo una clave.
     Si no existe todavia, devuelve un arreglo vacio. */
  obtener(clave) {
    const contenido = localStorage.getItem(clave);
    if (contenido === null) {
      return [];
    }
    try {
      return JSON.parse(contenido);
    } catch (error) {
      console.error("No se pudo leer la clave " + clave, error);
      return [];
    }
  },

  /* Guarda una coleccion completa bajo una clave. */
  guardar(clave, coleccion) {
    localStorage.setItem(clave, JSON.stringify(coleccion));
  },

  /* Agrega un elemento a una coleccion y la vuelve a guardar. */
  agregar(clave, elemento) {
    const coleccion = this.obtener(clave);
    coleccion.push(elemento);
    this.guardar(clave, coleccion);
    return elemento;
  },

  /* Reemplaza un elemento existente (buscando por su id). */
  actualizar(clave, id, cambios) {
    const coleccion = this.obtener(clave);
    const indice = coleccion.findIndex(item => item.id === id);
    if (indice !== -1) {
      coleccion[indice] = Object.assign({}, coleccion[indice], cambios);
      this.guardar(clave, coleccion);
    }
    return coleccion[indice];
  },

  /* Elimina un elemento por su id. */
  eliminar(clave, id) {
    const coleccion = this.obtener(clave).filter(item => item.id !== id);
    this.guardar(clave, coleccion);
    return coleccion;
  },

  /* Genera un identificador unico simple para los registros nuevos. */
  generarId() {
    return "id-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1000);
  }
};

/* Claves usadas en todo el sistema. Se centralizan aqui para
   evitar errores de escritura entre modulos. */
const CLAVES = {
  egresados: "egresados",
  titulos: "titulos",
  carreras: "carreras",
  escuelas: "escuelas",
  actividades: "actividades",
  comunidades: "comunidades",
  mentores: "mentores",
  solicitudes: "solicitudesMentoria",
  mentorias: "mentorias",
  oportunidades: "oportunidades",
  comunicados: "comunicados",
  sesion: "sesionActual"
};
