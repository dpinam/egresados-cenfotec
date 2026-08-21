/* ============================================================
   navegacion.js
   Genera el menu lateral de las paginas internas segun el rol
   de la sesion activa, para que la navegacion tenga sentido
   (cada rol ve solo sus opciones) sin tener que reiniciar sesion.
   ============================================================ */

const MENUS = {
  "Registro": [
    { t: "Portada", h: "index.html" },
    { t: "Panel de inicio", h: "inicio.html" },
    { sec: "Egresados" },
    { t: "Gestión de egresados", h: "egresados.html" },
    { t: "Gestión de títulos", h: "titulos.html" },
    { sec: "Catalogos" },
    { t: "Carreras", h: "carreras.html" },
    { t: "Escuelas académicas", h: "escuelas.html" }
  ],
  "Bienestar Estudiantil": [
    { t: "Portada", h: "index.html" },
    { t: "Panel de inicio", h: "inicio.html" },
    { sec: "Comunidad" },
    { t: "Actividades", h: "actividades.html" },
    { t: "Comunidades", h: "comunidades.html" },
    { t: "Comunicados", h: "comunicados.html" },
    { sec: "Programas" },
    { t: "Mentorías", h: "mentorias.html" },
    { t: "Oportunidades laborales", h: "oportunidades.html" },
    { t: "Consultar egresados", h: "egresados.html" }
  ],
  "Egresado": [
    { t: "Portada", h: "index.html" },
    { t: "Mi perfil", h: "perfil.html" },
    { sec: "Comunidad" },
    { t: "Actividades", h: "actividades.html" },
    { t: "Comunidades", h: "comunidades.html" },
    { t: "Comunicados", h: "comunicados.html" },
    { sec: "Programas" },
    { t: "Mentorías", h: "mentorias.html" },
    { t: "Oportunidades laborales", h: "oportunidades.html" }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  const barra = document.getElementById("barra-lateral");
  if (!barra) { return; }

  const sesion = (typeof Sesion !== "undefined") ? Sesion.actual() : null;
  const rol = sesion ? sesion.rol : "Registro";
  const items = MENUS[rol] || MENUS["Registro"];
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";

  let html =
    '<a href="index.html" class="logo">' +
      '<img src="assets/img/logo-emblema-blanco.png" alt="CENFOTEC">' +
      '<span class="marca">Egresados</span>' +
    "</a>" +
    '<span class="rol">' + rol + "</span>" +
    "<nav>";

  items.forEach(item => {
    if (item.sec) {
      html += '<p class="titulo-menu">' + item.sec + "</p>";
    } else {
      const activo = item.h === paginaActual ? " activo" : "";
      html += '<a href="' + item.h + '" class="' + activo.trim() + '">' + item.t + "</a>";
    }
  });

  html += "<hr>" + '<a href="#" id="cerrar-sesion">Cerrar sesion</a>' + "</nav>";
  barra.innerHTML = html;

  const cerrar = document.getElementById("cerrar-sesion");
  if (cerrar) {
    cerrar.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof Sesion !== "undefined") { Sesion.cerrar(); }
      window.location.href = "index.html";
    });
  }
});
