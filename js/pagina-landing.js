/* ============================================================
   pagina-landing.js
   Portada publica (RF-28). Muestra oportunidades, mentores,
   comunidades, actividades y comunicados desde Local Storage.
   Las tarjetas son interactivas y se comportan segun el rol:
   - Rol administrativo (Registro / Bienestar): van a la zona de gestion.
   - Egresado o visitante: abren el detalle o el contacto del mentor.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();

  const sesion = (typeof Sesion !== "undefined") ? Sesion.actual() : null;
  const esAdmin = !!sesion && (sesion.rol === "Registro" || sesion.rol === "Bienestar Estudiantil");
  const esBienestar = !!sesion && sesion.rol === "Bienestar Estudiantil";
  const esEgresado = !!sesion && sesion.rol === "Egresado";
  function urlValida(v) { return /^https?:\/\/.+/i.test((v || "").trim()); }

  /* El egresado no administra: se oculta la seccion academica (solo Registro). */
  if (esEgresado) {
    const acad = document.getElementById("academico");
    if (acad) { acad.style.display = "none"; }
    const linkAcad = document.querySelector('.lp-nav a[href="#academico"]');
    if (linkAcad) { linkAcad.style.display = "none"; }
    document.querySelectorAll('#accesos a[href="egresados.html"], #accesos a[href="titulos.html"]')
      .forEach(el => { el.style.display = "none"; });
  }

  /* ---------- Encabezado al hacer scroll ---------- */
  const header = document.getElementById("lp-header");
  const alScroll = () => { header.classList.toggle("solido", window.scrollY > 40); };
  window.addEventListener("scroll", alScroll); alScroll();

  /* ---------- Menu segun la sesion ---------- */
  const navSesion = document.getElementById("lp-nav-sesion");
  const inicioPorRol = { "Registro": "inicio.html", "Bienestar Estudiantil": "actividades.html", "Egresado": "perfil.html" };
  if (sesion) {
    const destino = inicioPorRol[sesion.rol] || "inicio.html";
    navSesion.innerHTML =
      '<a href="' + destino + '">' + (sesion.rol === "Egresado" ? "Mi perfil" : "Mi panel") + "</a>" +
      '<a href="#" id="lp-cerrar">Cerrar sesion</a>';
    document.getElementById("lp-cerrar").addEventListener("click", (e) => {
      e.preventDefault(); Sesion.cerrar(); window.location.reload();
    });
  } else {
    navSesion.innerHTML = '<a href="login.html" class="lp-cta">Iniciar sesion</a>';
  }

  /* ---------- Utilidades ---------- */
  function fechaLegible(iso) {
    if (!iso) { return ""; }
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const p = iso.split("-");
    return Number(p[2]) + " de " + meses[Number(p[1]) - 1] + " " + p[0];
  }
  function iniciales(nombre) {
    return nombre.split(" ").filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join("");
  }
  function vacio(m) { return '<div class="lp-card"><p>' + m + "</p></div>"; }

  /* ============================================================
     MODAL reutilizable
     ============================================================ */
  const fondo = document.createElement("div");
  fondo.className = "modal-fondo"; fondo.id = "modal-fondo";
  fondo.innerHTML = '<div class="modal-caja" id="modal-caja"></div>';
  document.body.appendChild(fondo);
  const caja = document.getElementById("modal-caja");

  function abrirModal(html) { caja.innerHTML = html; fondo.classList.add("abierto"); }
  function cerrarModal() { fondo.classList.remove("abierto"); }
  fondo.addEventListener("click", (e) => { if (e.target === fondo) { cerrarModal(); } });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { cerrarModal(); } });

  /* ---------- Modal: contactar a un mentor ---------- */
  function modalContactoMentor(mentor) {
    abrirModal(
      '<div class="lp-avatar">' + iniciales(mentor.egresado) + "</div>" +
      "<h3>" + mentor.egresado + "</h3>" +
      '<p class="modal-sub">' + mentor.area + " &middot; " + mentor.experiencia + " años de experiencia</p>" +
      '<p class="modal-dato"><strong>Especialidades:</strong> ' + mentor.especialidades + "</p>" +
      '<p class="modal-dato"><strong>Disponibilidad:</strong> ' + mentor.disponibilidad + "</p>" +
      '<form id="form-contacto">' +
        '<label for="c-nombre">Tu nombre</label>' +
        '<input type="text" id="c-nombre" placeholder="Nombre y apellidos">' +
        '<label for="c-correo">Tu correo</label>' +
        '<input type="email" id="c-correo" placeholder="tucorreo@ejemplo.com">' +
        '<label for="c-mensaje">Mensaje para el mentor</label>' +
        '<textarea id="c-mensaje" placeholder="Contale que te gustaría aprender..."></textarea>' +
        '<div class="modal-error" id="c-error">Completa todos los campos con datos válidos.</div>' +
        '<div class="modal-acciones">' +
          '<button type="button" class="lp-btn lp-btn-linea" id="c-cerrar">Cancelar</button>' +
          '<button type="submit" class="lp-btn lp-btn-claro">Enviar mensaje</button>' +
        "</div>" +
      "</form>"
    );
    document.getElementById("c-cerrar").addEventListener("click", cerrarModal);
    document.getElementById("form-contacto").addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.getElementById("c-nombre").value.trim();
      const correo = document.getElementById("c-correo").value.trim();
      const mensaje = document.getElementById("c-mensaje").value.trim();
      const err = document.getElementById("c-error");
      const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
      if (!nombre || !correoOk || !mensaje) { err.classList.add("visible"); return; }

      /* Guarda el mensaje de contacto en Local Storage (mensajeria simulada). */
      const contactos = Almacenamiento.obtener("contactosMentor");
      contactos.push({
        id: Almacenamiento.generarId(), mentor: mentor.egresado,
        de: nombre, correo: correo, mensaje: mensaje,
        fecha: new Date().toISOString().slice(0, 10)
      });
      Almacenamiento.guardar("contactosMentor", contactos);

      abrirModal(
        '<div class="modal-ok">' +
          '<div class="check">&#10003;</div>' +
          "<h3>Mensaje enviado</h3>" +
          '<p class="modal-sub">Tu mensaje fue enviado a ' + mentor.egresado + ". Te responderá a " + correo + ".</p>" +
          '<div class="modal-acciones" style="justify-content:center">' +
            '<button type="button" class="lp-btn lp-btn-claro" id="ok-cerrar">Listo</button>' +
          "</div>" +
        "</div>"
      );
      document.getElementById("ok-cerrar").addEventListener("click", cerrarModal);
    });
  }

  /* ---------- Modal: detalle de oportunidad ---------- */
  function modalOportunidad(o) {
    abrirModal(
      '<span class="lp-tag">' + o.area + "</span>" +
      "<h3>" + o.puesto + "</h3>" +
      '<p class="modal-sub">' + o.empresa + " &middot; " + o.modalidad + " &middot; " + o.ubicacion + "</p>" +
      '<p class="modal-dato">' + o.descripcion + "</p>" +
      '<p class="modal-dato"><strong>Vence:</strong> ' + fechaLegible(o.vencimiento) + "</p>" +
      '<p class="modal-dato"><strong>Contacto:</strong> ' + o.contacto + "</p>" +
      '<div class="modal-acciones">' +
        '<button type="button" class="lp-btn lp-btn-linea" id="o-cerrar">Cerrar</button>' +
        '<a class="lp-btn lp-btn-claro" href="mailto:' + o.contacto + "?subject=" +
          encodeURIComponent("Postulacion: " + o.puesto) + '">Postular por correo</a>' +
      "</div>"
    );
    document.getElementById("o-cerrar").addEventListener("click", cerrarModal);
  }

  /* ---------- Modal: aviso simple ---------- */
  function modalMensaje(titulo, texto) {
    abrirModal(
      "<h3>" + titulo + "</h3>" +
      '<p class="modal-sub">' + texto + "</p>" +
      '<div class="modal-acciones"><button type="button" class="lp-btn lp-btn-claro" id="m-cerrar">Entendido</button></div>'
    );
    document.getElementById("m-cerrar").addEventListener("click", cerrarModal);
  }

  /* ---------- Modal: Bienestar configura el link de inscripcion ---------- */
  function modalConfigInscripcion(actividad) {
    abrirModal(
      '<span class="lp-tag">' + actividad.tipo + "</span>" +
      "<h3>" + actividad.titulo + "</h3>" +
      '<p class="modal-sub">Pega el enlace del formulario de inscripcion (Google Forms u otro). Los egresados lo abriran al tocar "Inscribirse aquí".</p>' +
      '<form id="form-inscripcion">' +
        '<label for="i-link">Enlace del formulario</label>' +
        '<input type="url" id="i-link" placeholder="https://forms.gle/..." value="' + (actividad.formInscripcion || "") + '">' +
        '<div class="modal-error" id="i-error">Ingresa un enlace valido (http:// o https://).</div>' +
        '<div class="modal-acciones">' +
          (actividad.formInscripcion ? '<a class="lp-btn lp-btn-linea" href="' + actividad.formInscripcion + '" target="_blank" rel="noopener">Abrir formulario</a>' : "") +
          '<button type="submit" class="lp-btn lp-btn-claro">Guardar enlace</button>' +
        "</div>" +
      "</form>"
    );
    document.getElementById("form-inscripcion").addEventListener("submit", (e) => {
      e.preventDefault();
      const link = document.getElementById("i-link").value.trim();
      const err = document.getElementById("i-error");
      if (!urlValida(link)) { err.classList.add("visible"); return; }
      Almacenamiento.actualizar(CLAVES.actividades, actividad.id, { formInscripcion: link });
      abrirModal(
        '<div class="modal-ok">' +
          '<div class="check">&#10003;</div>' +
          "<h3>Enlace guardado</h3>" +
          '<p class="modal-sub">Los egresados ya pueden inscribirse a "' + actividad.título + '".</p>' +
          '<div class="modal-acciones" style="justify-content:center">' +
            '<button type="button" class="lp-btn lp-btn-claro" id="ok-cerrar2">Listo</button>' +
          "</div>" +
        "</div>"
      );
      document.getElementById("ok-cerrar2").addEventListener("click", cerrarModal);
    });
  }

  /* ---------- Modal: detalle de actividad ---------- */
  function modalActividad(a) {
    abrirModal(
      '<span class="lp-tag">' + a.tipo + "</span>" +
      "<h3>" + a.titulo + "</h3>" +
      '<p class="modal-sub">' + fechaLegible(a.fecha) + " &middot; " + a.modalidad + (a.lugar ? " &middot; " + a.lugar : "") + "</p>" +
      '<p class="modal-dato">' + (a.descripcion || "Sin descripción.") + "</p>" +
      '<div class="modal-acciones">' +
        '<button type="button" class="lp-btn lp-btn-linea" id="a-cerrar">Cerrar</button>' +
        (a.formInscripcion ? '<a class="lp-btn lp-btn-claro" href="' + a.formInscripcion + '" target="_blank" rel="noopener">Inscribirse</a>' : "") +
      "</div>"
    );
    document.getElementById("a-cerrar").addEventListener("click", cerrarModal);
  }

  /* ---------- Modal: detalle de comunidad ---------- */
  function modalComunidad(c) {
    abrirModal(
      '<span class="lp-tag">' + c.area + "</span>" +
      "<h3>" + c.nombre + "</h3>" +
      '<p class="modal-sub">' + c.miembros + " miembros &middot; " + c.estado + "</p>" +
      '<p class="modal-dato">' + (c.descripcion || "Comunidad profesional de egresados que comparten un area de especialidad.") + "</p>" +
      '<div class="modal-acciones">' +
        '<button type="button" class="lp-btn lp-btn-linea" id="cm-cerrar">Cerrar</button>' +
      "</div>"
    );
    document.getElementById("cm-cerrar").addEventListener("click", cerrarModal);
  }

  /* ============================================================
     RENDER de las secciones dinamicas
     ============================================================ */

  /* Oportunidades */
  const cOpo = document.getElementById("lp-oportunidades");
  if (cOpo) {
    const lista = Almacenamiento.obtener(CLAVES.oportunidades).filter(o => o.estado === "Publicada").slice(0, 6);
    cOpo.innerHTML = lista.length ? lista.map((o, i) =>
      '<div class="lp-card clickable reveal ' + ("d" + (i % 3 + 1)) + '" data-opo="' + o.id + '">' +
        '<span class="lp-tag">' + o.area + "</span>" +
        "<h3>" + o.puesto + "</h3>" +
        "<p>" + o.empresa + " &middot; " + o.modalidad + "</p>" +
        '<div class="lp-meta">' + o.ubicacion + " &middot; vence el " + fechaLegible(o.vencimiento) + "</div>" +
        '<span class="lp-card-accion">' + (esAdmin ? "Gestionar &rarr;" : "Ver detalle &rarr;") + "</span>" +
      "</div>").join("") : vacio("Pronto se publicaran nuevas oportunidades.");

    cOpo.addEventListener("click", (e) => {
      const card = e.target.closest("[data-opo]"); if (!card) { return; }
      if (esAdmin) { window.location.href = "oportunidades.html"; return; }
      const o = Almacenamiento.obtener(CLAVES.oportunidades).find(x => x.id === card.dataset.opo);
      if (o) { modalOportunidad(o); }
    });
  }

  /* Mentores */
  const cMen = document.getElementById("lp-mentores");
  if (cMen) {
    const lista = Almacenamiento.obtener(CLAVES.mentores).slice(0, 6);
    cMen.innerHTML = lista.length ? lista.map((m, i) =>
      '<div class="lp-card clickable reveal ' + ("d" + (i % 3 + 1)) + '" data-mentor="' + m.id + '">' +
        '<div class="lp-avatar">' + iniciales(m.egresado) + "</div>" +
        '<span class="lp-tag">' + m.area + "</span>" +
        "<h3>" + m.egresado + "</h3>" +
        "<p>" + m.especialidades + "</p>" +
        '<div class="lp-meta">' + m.experiencia + " años &middot; " + m.disponibilidad + "</div>" +
        '<span class="lp-card-accion">' + (esAdmin ? "Gestionar &rarr;" : "Contactar mentor &rarr;") + "</span>" +
      "</div>").join("") : vacio("Aun no hay mentores registrados.");

    cMen.addEventListener("click", (e) => {
      const card = e.target.closest("[data-mentor]"); if (!card) { return; }
      if (esAdmin) { window.location.href = "mentorias.html"; return; }
      const m = Almacenamiento.obtener(CLAVES.mentores).find(x => x.id === card.dataset.mentor);
      if (m) { modalContactoMentor(m); }
    });
  }

  /* Comunidades */
  const cCom2 = document.getElementById("lp-comunidades");
  if (cCom2) {
    const lista = Almacenamiento.obtener(CLAVES.comunidades).filter(c => c.estado === "Activa").slice(0, 6);
    cCom2.innerHTML = lista.length ? lista.map((c, i) =>
      '<div class="lp-card clickable reveal ' + ("d" + (i % 3 + 1)) + '" data-com="' + c.id + '">' +
        '<span class="lp-tag">' + c.area + "</span>" +
        "<h3>" + c.nombre + "</h3>" +
        "<p>" + (c.descripcion || "Comunidad profesional de egresados.") + "</p>" +
        '<div class="lp-meta">' + c.miembros + " miembros</div>" +
        '<span class="lp-card-accion">' + (esAdmin ? "Gestionar &rarr;" : "Ver informacion &rarr;") + "</span>" +
      "</div>").join("") : vacio("Pronto se abriran nuevas comunidades.");

    cCom2.addEventListener("click", (e) => {
      const card = e.target.closest("[data-com]"); if (!card) { return; }
      if (esAdmin) { window.location.href = "comunidades.html"; return; }
      const c = Almacenamiento.obtener(CLAVES.comunidades).find(x => x.id === card.dataset.com);
      if (c) { modalComunidad(c); }
    });
  }

  /* Actividades (con boton de inscripcion) */
  const cAct = document.getElementById("lp-actividades");
  if (cAct) {
    const lista = Almacenamiento.obtener(CLAVES.actividades).filter(a => a.estado === "Programada")
      .sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 3);
    cAct.innerHTML = lista.length ? lista.map((a, i) =>
      '<div class="lp-card clickable reveal ' + ("d" + (i % 3 + 1)) + '" data-act="' + a.id + '">' +
        '<span class="lp-tag">' + a.tipo + "</span>" +
        "<h3>" + a.titulo + "</h3>" +
        "<p>" + a.descripcion + "</p>" +
        '<div class="lp-meta">' + fechaLegible(a.fecha) + " &middot; " + a.modalidad + "</div>" +
        '<button type="button" class="lp-card-accion" data-inscribir="' + a.id + '">' +
          (esBienestar ? "Configurar inscripción &rarr;" : "Inscribirse aquí &rarr;") + "</button>" +
      "</div>").join("") : vacio("No hay actividades programadas por ahora.");

    cAct.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-inscribir]");
      if (btn) {
        const a = Almacenamiento.obtener(CLAVES.actividades).find(x => x.id === btn.dataset.inscribir);
        if (!a) { return; }
        if (esBienestar) {
          modalConfigInscripcion(a);
        } else if (a.formInscripcion) {
          window.open(a.formInscripcion, "_blank", "noopener");
        } else {
          modalMensaje("Inscripciones no disponibles", "Todavia no hay un formulario de inscripción para esta actividad. Vuelve pronto.");
        }
        return;
      }
      /* Clic en el resto de la tarjeta: abre el detalle de la actividad. */
      const card = e.target.closest("[data-act]"); if (!card) { return; }
      const act = Almacenamiento.obtener(CLAVES.actividades).find(x => x.id === card.dataset.act);
      if (act) { modalActividad(act); }
    });
  }

  /* Comunicados */
  const cCom = document.getElementById("lp-comunicados");
  if (cCom) {
    const lista = Almacenamiento.obtener(CLAVES.comunicados).filter(c => c.estado === "Publicado")
      .sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3);
    cCom.innerHTML = lista.length ? lista.map((c, i) =>
      '<div class="lp-card reveal ' + ("d" + (i % 3 + 1)) + '">' +
        '<span class="lp-tag">' + c.categoria + "</span>" +
        "<h3>" + c.titulo + "</h3>" +
        "<p>" + c.contenido + "</p>" +
        '<div class="lp-meta">' + fechaLegible(c.fecha) + "</div>" +
      "</div>").join("") : vacio("No hay comunicados recientes.");
  }

  /* ============================================================
     Animaciones de aparicion al hacer scroll
     ============================================================ */
  document.querySelectorAll(".lp-seccion-titulo, .lp-split, .lp-tile").forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
  }
});
