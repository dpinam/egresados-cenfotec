/* ============================================================
   datos-iniciales.js
   Carga datos de ejemplo la PRIMERA vez que se abre el sistema.
   Cada coleccion se representa como un arreglo de objetos, de
   acuerdo con las entidades del proyecto de egresados.
   Si la coleccion ya existe en Local Storage, no se sobrescribe.
   ============================================================ */

const DatosIniciales = {

  egresados: [
    { id: "egr-1", identificacion: "1-1234-5678", nombre: "Dylan Pina Moya", correo: "dylan.pina@cenfotec.ac.cr", telefono: "8888-1234", fechaRegistro: "2023-02-10", empresa: "Soluciones Digitales CR", puesto: "Desarrollador de software", area: "Desarrollo de software", linkedin: "https://linkedin.com/in/dylanpina", portafolio: "https://dylanpina.dev", estado: "Activo" },
    { id: "egr-2", identificacion: "2-0456-0912", nombre: "Luis Alonso Aguero", correo: "luis.aguero@cenfotec.ac.cr", telefono: "8712-3344", fechaRegistro: "2022-08-01", empresa: "NetSecure LATAM", puesto: "Analista de seguridad", area: "Ciberseguridad", linkedin: "", portafolio: "", estado: "Activo" },
    { id: "egr-3", identificacion: "3-0345-0678", nombre: "Ana Jimenez Rojas", correo: "ana.jimenez@cenfotec.ac.cr", telefono: "8600-7788", fechaRegistro: "2021-11-20", empresa: "", puesto: "", area: "Infraestructura y redes", linkedin: "", portafolio: "", estado: "Inactivo" }
  ],

  titulos: [
    { id: "tit-1", egresadoId: "egr-1", tipo: "Bachillerato", carrera: "Ingenieria del Software", escuela: "Escuela de Ingenieria del Software", anio: 2022, estado: "Graduado" },
    { id: "tit-2", egresadoId: "egr-1", tipo: "Tecnico", carrera: "Desarrollo de Software", escuela: "Escuela de Ingenieria del Software", anio: 2020, estado: "Graduado" },
    { id: "tit-3", egresadoId: "egr-2", tipo: "Maestria", carrera: "Ciberseguridad", escuela: "Escuela de Computacion", anio: 2025, estado: "En tramite" }
  ],

  carreras: [
    { id: "car-1", nombre: "Ingenieria del Software", escuela: "Escuela de Ingenieria del Software", descripcion: "", estado: "Activa" },
    { id: "car-2", nombre: "Ciberseguridad", escuela: "Escuela de Computacion", descripcion: "", estado: "Activa" },
    { id: "car-3", nombre: "Redes y Telecomunicaciones", escuela: "Escuela de Computacion", descripcion: "", estado: "Activa" }
  ],

  escuelas: [
    { id: "esc-1", nombre: "Escuela de Ingenieria del Software", director: "Roberto Sanchez", descripcion: "", estado: "Activa" },
    { id: "esc-2", nombre: "Escuela de Computacion", director: "Marcela Vindas", descripcion: "", estado: "Activa" }
  ],

  actividades: [
    { id: "act-1", titulo: "Entrevistas tecnicas para egresados de Software", tipo: "Taller", modalidad: "Virtual", fecha: "2026-07-15", lugar: "Enlace virtual", descripcion: "Practica de entrevistas tecnicas.", estado: "Programada", formInscripcion: "https://docs.google.com/forms" },
    { id: "act-2", titulo: "Tendencias en desarrollo web 2026", tipo: "Conversatorio", modalidad: "Presencial", fecha: "2026-07-22", lugar: "Auditorio CENFOTEC", descripcion: "Panel con profesionales de la industria.", estado: "Programada" },
    { id: "act-3", titulo: "Feria de egresados 2025", tipo: "Actividad de extension", modalidad: "Presencial", fecha: "2025-12-05", lugar: "Campus CENFOTEC", descripcion: "Feria anual de egresados.", estado: "Finalizada" }
  ],

  comunidades: [
    { id: "com-1", nombre: "Comunidad de Desarrollo Web", area: "Desarrollo de software", descripcion: "", miembros: 312, estado: "Activa" },
    { id: "com-2", nombre: "Comunidad de Seguridad Informatica", area: "Ciberseguridad", descripcion: "", miembros: 146, estado: "Activa" },
    { id: "com-3", nombre: "Comunidad de Infraestructura y Redes", area: "Infraestructura y redes", descripcion: "", miembros: 98, estado: "Inactiva" }
  ],

  mentores: [
    { id: "men-1", egresado: "Dylan Pina Moya", area: "Desarrollo de software", especialidades: "Frontend, APIs REST", experiencia: 3, disponibilidad: "4 horas / semana", estado: "Disponible" },
    { id: "men-2", egresado: "Diana Rojas Umana", area: "Ciberseguridad", especialidades: "Pentesting, redes", experiencia: 6, disponibilidad: "2 horas / semana", estado: "Disponible" }
  ],

  solicitudesMentoria: [
    { id: "sol-1", solicitante: "Paola Solis Chaves", objetivo: "Preparacion para entrevistas tecnicas", oportunidad: "Preparacion para entrevistas tecnicas", mentor: "", comentarios: "", fecha: "2026-06-25", estado: "Pendiente" },
    { id: "sol-2", solicitante: "Ana Jimenez Rojas", objetivo: "Transicion a liderazgo tecnico", oportunidad: "Transicion a liderazgo tecnico", mentor: "", comentarios: "", fecha: "2026-06-21", estado: "Pendiente" }
  ],

  mentorias: [
    { id: "mto-1", mentor: "Dylan Pina Moya", egresado: "Paola Solis Chaves", inicio: "2026-06-28", fin: "2026-08-28", estado: "Activa", observaciones: "Sesiones semanales" },
    { id: "mto-2", mentor: "Diana Rojas Umana", egresado: "Kevin Salas Nunez", inicio: "2026-05-02", fin: "2026-07-02", estado: "Activa", observaciones: "Enfoque en pentesting" }
  ],

  oportunidades: [
    { id: "opo-1", empresa: "Soluciones Digitales CR", puesto: "Desarrollador Backend Jr.", area: "Desarrollo de software", modalidad: "Hibrido", ubicacion: "San Jose", contacto: "rrhh@solucionescr.com", publicacion: "2026-06-20", vencimiento: "2026-07-15", descripcion: "Backend junior con Node.js y bases de datos relacionales.", estado: "Publicada" },
    { id: "opo-2", empresa: "NetSecure LATAM", puesto: "Analista de Ciberseguridad", area: "Ciberseguridad", modalidad: "Remoto", ubicacion: "Costa Rica", contacto: "empleo@netsecure.com", publicacion: "2026-06-10", vencimiento: "2026-08-01", descripcion: "Analista de seguridad con experiencia en pentesting.", estado: "Publicada" }
  ],

  comunicados: [
    { id: "cnd-1", titulo: "Apertura de convocatoria de mentores 2026-C2", categoria: "Bienestar Estudiantil", audiencia: "Todos los egresados", contenido: "Se abre la convocatoria para egresados que deseen participar como mentores.", fecha: "2026-06-20", estado: "Publicado" },
    { id: "cnd-2", titulo: "Actualizacion de datos para graduados 2025", categoria: "Registro", audiencia: "Por carrera", contenido: "Solicitamos actualizar la informacion profesional en el perfil.", fecha: "2026-06-10", estado: "Publicado" }
  ],

  /* Version de los datos de ejemplo. Al cambiarla, la proxima vez
     que se abra el sistema se recargan los datos actualizados. */
  version: "2026-08-4",

  /* Carga las colecciones de ejemplo. Si la version cambio, las
     vuelve a escribir para reflejar los datos mas recientes. */
  cargar() {
    const mapa = {
      egresados: this.egresados,
      titulos: this.titulos,
      carreras: this.carreras,
      escuelas: this.escuelas,
      actividades: this.actividades,
      comunidades: this.comunidades,
      mentores: this.mentores,
      solicitudesMentoria: this.solicitudesMentoria,
      mentorias: this.mentorias,
      oportunidades: this.oportunidades,
      comunicados: this.comunicados
    };
    const reiniciar = localStorage.getItem("datosVersion") !== this.version;
    Object.keys(mapa).forEach(clave => {
      if (reiniciar || localStorage.getItem(clave) === null) {
        localStorage.setItem(clave, JSON.stringify(mapa[clave]));
      }
    });
    if (reiniciar) { localStorage.setItem("datosVersion", this.version); }
  }
};
