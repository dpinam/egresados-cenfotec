/* ============================================================
   sesion.js
   Maneja la sesion del usuario y el control de acceso por rol
   (RNF-03). La sesion se guarda en Local Storage al iniciar
   sesion y se lee en cada pagina interna.
   ============================================================ */

const Sesion = {

  /* Datos de demostracion para cada rol. En un sistema real
     esto vendria del backend; aqui simula el usuario autenticado. */
  usuariosDemo: {
    registro:  { rol: "Registro", nombre: "María Alvarado", inicio: "inicio.html" },
    bienestar: { rol: "Bienestar Estudiantil", nombre: "Julia Castro", inicio: "actividades.html" },
    egresado:  { rol: "Egresado", nombre: "Dylan Piña Moya", inicio: "perfil.html" }
  },

  /* Inicia sesion tomando el rol y el nombre que ingreso la persona.
     Si no se indica nombre, usa el de demostracion del rol. */
  iniciar(claveRol, nombre) {
    const base = this.usuariosDemo[claveRol];
    const usuario = {
      rol: base.rol,
      inicio: base.inicio,
      nombre: (nombre && nombre.trim()) ? nombre.trim() : base.nombre
    };
    Almacenamiento.guardar(CLAVES.sesion, usuario);
    return usuario;
  },

  actual() {
    const sesion = localStorage.getItem(CLAVES.sesion);
    return sesion ? JSON.parse(sesion) : null;
  },

  cerrar() {
    localStorage.removeItem(CLAVES.sesion);
  },

  /* Protege una pagina interna: si no hay sesion, vuelve al login.
     Ademas actualiza el nombre y el rol que se muestran en pantalla. */
  proteger() {
    const usuario = this.actual();
    if (!usuario) {
      window.location.href = "login.html";
      return null;
    }
    document.querySelectorAll("[data-usuario-nombre]").forEach(el => {
      el.textContent = usuario.nombre;
    });
    document.querySelectorAll("[data-usuario-rol]").forEach(el => {
      el.textContent = usuario.rol;
    });
    return usuario;
  }
};
