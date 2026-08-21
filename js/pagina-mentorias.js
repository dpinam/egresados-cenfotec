/* ============================================================
   pagina-mentorias.js
   Modulo de mentorias (RF-18 a RF-22).
   - RF-18: registro voluntario de mentores.
   - RF-19: solicitud de mentoria por parte del egresado.
   - RF-20: asignacion o rechazo de solicitudes por Bienestar.
   - RF-21: registro de mentorias (inicio, fin, estado, observaciones).
   - RF-22: consulta de todas las mentorias.
   Todo persiste en Local Storage.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  /* ---------- Utilidades ---------- */
  function fechaLegible(iso) {
    if (!iso) { return "-"; }
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function claseSolicitud(estado) {
    if (estado === "Pendiente") { return "estado-alerta"; }
    if (estado === "Activa") { return "estado-exito"; }
    return "estado-error";
  }
  function claseMentoria(estado) {
    if (estado === "Cancelada") { return "estado-error"; }
    if (estado === "Finalizada") { return "estado-exito"; }
    if (estado === "Activa") { return "estado-neutro"; }
    return "estado-alerta";
  }
  function opcionesEgresados(select, incluirVacio) {
    select.innerHTML = "";
    Almacenamiento.obtener(CLAVES.egresados).forEach(e => {
      const op = document.createElement("option");
      op.value = e.nombre;
      op.textContent = e.nombre;
      select.appendChild(op);
    });
    if (incluirVacio && select.options.length === 0) {
      const op = document.createElement("option");
      op.textContent = "(no hay egresados)";
      select.appendChild(op);
    }
  }

  /* ---------- Resumen (tarjetas) ---------- */
  function actualizarResumen() {
    const mentores = Almacenamiento.obtener(CLAVES.mentores);
    const solicitudes = Almacenamiento.obtener(CLAVES.solicitudes);
    const mentorias = Almacenamiento.obtener(CLAVES.mentorias);
    document.getElementById("num-mentores").textContent = mentores.length;
    document.getElementById("num-pendientes").textContent = solicitudes.filter(s => s.estado === "Pendiente").length;
    document.getElementById("num-activas").textContent = mentorias.filter(m => m.estado === "Activa").length;
    document.getElementById("num-finalizadas").textContent = mentorias.filter(m => m.estado === "Finalizada").length;
  }

  /* ============================================================
     RF-18: Registro de mentores
     ============================================================ */
  const formMentor = document.getElementById("form-mentor");

  function pintarMentores() {
    const cuerpo = document.getElementById("tabla-mentores");
    const lista = Almacenamiento.obtener(CLAVES.mentores);
    cuerpo.innerHTML = "";
    if (lista.length === 0) {
      cuerpo.innerHTML = '<tr class="fila-vacia"><td colspan="7">No hay mentores registrados.</td></tr>';
      return;
    }
    lista.forEach(m => {
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + m.egresado + "</td>" +
        "<td>" + m.area + "</td>" +
        "<td>" + m.especialidades + "</td>" +
        "<td>" + m.experiencia + "</td>" +
        "<td>" + m.disponibilidad + "</td>" +
        '<td><span class="estado estado-exito">' + m.estado + "</span></td>" +
        '<td><a href="#" class="boton boton-peligro boton-pequeno" data-borra-mentor="' + m.id + '">Eliminar</a></td>';
      cuerpo.appendChild(fila);
    });
  }

  formMentor.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formMentor);
    let ok = true;

    const especialidades = document.getElementById("m-especialidades").value;
    const experiencia = document.getElementById("m-experiencia").value;
    const disponibilidad = document.getElementById("m-disponibilidad").value;

    if (Almacenamiento.obtener(CLAVES.egresados).length === 0) {
      Mensajes.aviso("aviso-mentoria", "Primero deben existir egresados registrados.", "error");
      return;
    }
    if (!Validar.requerido(especialidades)) { Mensajes.mostrarError("m-especialidades", "Indique al menos una especialidad."); ok = false; }
    if (!Validar.requerido(disponibilidad)) { Mensajes.mostrarError("m-disponibilidad", "Indique la disponibilidad."); ok = false; }
    if (experiencia === "" || Number(experiencia) < 0) { Mensajes.mostrarError("m-experiencia", "Años de experiencia inválidos."); ok = false; }
    if (!ok) { return; }

    const egresado = document.getElementById("m-egresado").value;
    const repetido = Almacenamiento.obtener(CLAVES.mentores).some(m => m.egresado === egresado);
    if (repetido) {
      Mensajes.aviso("aviso-mentoria", "Ese egresado ya esta registrado como mentor.", "error");
      return;
    }

    Almacenamiento.agregar(CLAVES.mentores, {
      id: Almacenamiento.generarId(),
      egresado: egresado,
      area: document.getElementById("m-area").value,
      especialidades: especialidades.trim(),
      experiencia: Number(experiencia),
      disponibilidad: disponibilidad.trim(),
      estado: "Disponible"
    });
    Mensajes.aviso("aviso-mentoria", "Mentor registrado correctamente.", "exito");
    formMentor.reset();
    refrescar();
  });

  ["m-especialidades", "m-experiencia", "m-disponibilidad"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id)));

  /* ============================================================
     RF-19: Solicitud de mentoria (creada por el egresado)
     ============================================================ */
  const formSolicitud = document.getElementById("form-solicitud-nueva");

  formSolicitud.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formSolicitud);
    let ok = true;

    const objetivo = document.getElementById("s-objetivo").value;
    const oportunidad = document.getElementById("s-oportunidad").value;
    if (!Validar.requerido(objetivo)) { Mensajes.mostrarError("s-objetivo", "El objetivo es obligatorio."); ok = false; }
    if (!Validar.requerido(oportunidad)) { Mensajes.mostrarError("s-oportunidad", "Indique la oportunidad de mentoría."); ok = false; }
    if (Almacenamiento.obtener(CLAVES.egresados).length === 0) {
      Mensajes.aviso("aviso-mentoria", "Primero deben existir egresados registrados.", "error"); ok = false;
    }
    if (!ok) { return; }

    Almacenamiento.agregar(CLAVES.solicitudes, {
      id: Almacenamiento.generarId(),
      solicitante: document.getElementById("s-solicitante").value,
      objetivo: objetivo.trim(),
      oportunidad: oportunidad.trim(),
      mentor: "",
      comentarios: document.getElementById("s-comentarios").value.trim(),
      fecha: new Date().toISOString().slice(0, 10),
      estado: "Pendiente"
    });
    Mensajes.aviso("aviso-mentoria", "Solicitud de mentoría enviada.", "exito");
    formSolicitud.reset();
    refrescar();
  });

  ["s-objetivo", "s-oportunidad"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id)));

  /* ============================================================
     RF-20: Gestion de solicitudes (asignar o rechazar)
     ============================================================ */
  const formAsignar = document.getElementById("form-asignar");
  const selSolicitante = document.getElementById("solicitante");
  const selOportunidad = document.getElementById("oportunidad");
  const selMentor = document.getElementById("mentor");

  function cargarSelectsAsignar() {
    const pendientes = Almacenamiento.obtener(CLAVES.solicitudes).filter(s => s.estado === "Pendiente");
    selSolicitante.innerHTML = "";
    pendientes.forEach(s => {
      const op = document.createElement("option");
      op.value = s.id;
      op.textContent = s.solicitante;
      selSolicitante.appendChild(op);
    });

    selMentor.innerHTML = "";
    Almacenamiento.obtener(CLAVES.mentores).forEach(m => {
      const op = document.createElement("option");
      op.value = m.egresado;
      op.textContent = m.egresado;
      selMentor.appendChild(op);
    });
    sincronizarOportunidad();
  }

  function sincronizarOportunidad() {
    const s = Almacenamiento.obtener(CLAVES.solicitudes).find(x => x.id === selSolicitante.value);
    selOportunidad.innerHTML = "";
    const op = document.createElement("option");
    op.textContent = s ? s.oportunidad : "(sin solicitudes pendientes)";
    selOportunidad.appendChild(op);
  }
  selSolicitante.addEventListener("change", sincronizarOportunidad);

  function pintarSolicitudes() {
    const cuerpo = document.getElementById("tabla-solicitudes");
    const lista = Almacenamiento.obtener(CLAVES.solicitudes);
    cuerpo.innerHTML = "";
    if (lista.length === 0) {
      cuerpo.innerHTML = '<tr class="fila-vacia"><td colspan="5">No hay solicitudes.</td></tr>';
      return;
    }
    lista.forEach(s => {
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + s.solicitante + "</td>" +
        "<td>" + s.objetivo + "</td>" +
        "<td>" + (s.mentor || "-") + "</td>" +
        "<td>" + fechaLegible(s.fecha) + "</td>" +
        '<td><span class="estado ' + claseSolicitud(s.estado) + '">' + s.estado + "</span></td>";
      cuerpo.appendChild(fila);
    });
  }

  formAsignar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const idSol = selSolicitante.value;
    if (!idSol) {
      Mensajes.aviso("aviso-mentoria", "No hay solicitudes pendientes para asignar.", "error");
      return;
    }
    if (Almacenamiento.obtener(CLAVES.mentores).length === 0) {
      Mensajes.aviso("aviso-mentoria", "Registre al menos un mentor antes de asignar.", "error");
      return;
    }
    const solicitud = Almacenamiento.obtener(CLAVES.solicitudes).find(s => s.id === idSol);
    const mentor = selMentor.value;

    /* RF-20: la solicitud queda activa con su mentor asignado. */
    Almacenamiento.actualizar(CLAVES.solicitudes, idSol, { estado: "Activa", mentor: mentor });

    /* RF-21: se registra automaticamente la mentoria correspondiente. */
    Almacenamiento.agregar(CLAVES.mentorias, {
      id: Almacenamiento.generarId(),
      mentor: mentor,
      egresado: solicitud.solicitante,
      inicio: new Date().toISOString().slice(0, 10),
      fin: "",
      estado: "Activa",
      observaciones: solicitud.comentarios || "Asignada desde solicitud"
    });

    Mensajes.aviso("aviso-mentoria", "Mentor asignado y mentoría registrada.", "exito");
    refrescar();
  });

  document.getElementById("btn-rechazar").addEventListener("click", () => {
    const idSol = selSolicitante.value;
    if (!idSol) {
      Mensajes.aviso("aviso-mentoria", "No hay solicitudes pendientes.", "error");
      return;
    }
    Almacenamiento.actualizar(CLAVES.solicitudes, idSol, { estado: "Cancelada" });
    Mensajes.aviso("aviso-mentoria", "Solicitud rechazada.", "exito");
    refrescar();
  });

  /* ============================================================
     RF-21 y RF-22: Registro y consulta de mentorias
     ============================================================ */
  const formMentoria = document.getElementById("form-mentoria");
  let idMentoriaEdicion = null;

  function cargarSelectsMentoria() {
    const selMen = document.getElementById("mto-mentor");
    selMen.innerHTML = "";
    Almacenamiento.obtener(CLAVES.mentores).forEach(m => {
      const op = document.createElement("option");
      op.value = m.egresado; op.textContent = m.egresado;
      selMen.appendChild(op);
    });
    opcionesEgresados(document.getElementById("mto-egresado"), true);
  }

  function pintarMentorias() {
    const cuerpo = document.getElementById("tabla-mentorias");
    const lista = Almacenamiento.obtener(CLAVES.mentorias);
    cuerpo.innerHTML = "";
    if (lista.length === 0) {
      cuerpo.innerHTML = '<tr class="fila-vacia"><td colspan="7">No hay mentorias registradas.</td></tr>';
      return;
    }
    lista.forEach(m => {
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + m.mentor + "</td>" +
        "<td>" + m.egresado + "</td>" +
        "<td>" + fechaLegible(m.inicio) + "</td>" +
        "<td>" + (m.fin ? fechaLegible(m.fin) : "-") + "</td>" +
        '<td><span class="estado ' + claseMentoria(m.estado) + '">' + m.estado + "</span></td>" +
        "<td>" + (m.observaciones || "-") + "</td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-edita-mto="' + m.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-borra-mto="' + m.id + '">Eliminar</a>' +
        "</td>";
      cuerpo.appendChild(fila);
    });
  }

  formMentoria.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formMentoria);
    let ok = true;

    const inicio = document.getElementById("mto-inicio").value;
    const fin = document.getElementById("mto-fin").value;
    if (Almacenamiento.obtener(CLAVES.mentores).length === 0) {
      Mensajes.aviso("aviso-mentoria", "Registre al menos un mentor primero.", "error"); return;
    }
    if (!Validar.requerido(inicio)) { Mensajes.mostrarError("mto-inicio", "La fecha de inicio es obligatoria."); ok = false; }
    if (fin && fin < inicio) { Mensajes.mostrarError("mto-fin", "El fin no puede ser anterior al inicio."); ok = false; }
    if (!ok) { return; }

    const datos = {
      mentor: document.getElementById("mto-mentor").value,
      egresado: document.getElementById("mto-egresado").value,
      inicio: inicio,
      fin: fin,
      estado: document.getElementById("mto-estado").value,
      observaciones: document.getElementById("mto-observaciones").value.trim()
    };

    if (idMentoriaEdicion) {
      Almacenamiento.actualizar(CLAVES.mentorias, idMentoriaEdicion, datos);
      Mensajes.aviso("aviso-mentoria", "Mentoría actualizada.", "exito");
      idMentoriaEdicion = null;
      formMentoria.querySelector("button[type=submit]").textContent = "Registrar mentoría";
    } else {
      datos.id = Almacenamiento.generarId();
      Almacenamiento.agregar(CLAVES.mentorias, datos);
      Mensajes.aviso("aviso-mentoria", "Mentoría registrada.", "exito");
    }
    formMentoria.reset();
    refrescar();
  });

  ["mto-inicio", "mto-fin"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id)));

  formMentoria.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formMentoria);
    idMentoriaEdicion = null;
    formMentoria.querySelector("button[type=submit]").textContent = "Registrar mentoría";
  });

  /* ---------- Delegacion de clics (eliminar mentor / editar-eliminar mentoria) ---------- */
  document.querySelector(".contenido").addEventListener("click", (evento) => {
    const borraMentor = evento.target.getAttribute("data-borra-mentor");
    const editaMto = evento.target.getAttribute("data-edita-mto");
    const borraMto = evento.target.getAttribute("data-borra-mto");

    if (borraMentor) {
      evento.preventDefault();
      if (confirm("Eliminar este mentor?")) {
        Almacenamiento.eliminar(CLAVES.mentores, borraMentor);
        Mensajes.aviso("aviso-mentoria", "Mentor eliminado.", "exito");
        refrescar();
      }
    }
    if (editaMto) {
      evento.preventDefault();
      const m = Almacenamiento.obtener(CLAVES.mentorias).find(x => x.id === editaMto);
      if (!m) { return; }
      document.getElementById("mto-mentor").value = m.mentor;
      document.getElementById("mto-egresado").value = m.egresado;
      document.getElementById("mto-inicio").value = m.inicio;
      document.getElementById("mto-fin").value = m.fin || "";
      document.getElementById("mto-estado").value = m.estado;
      document.getElementById("mto-observaciones").value = m.observaciones || "";
      idMentoriaEdicion = m.id;
      formMentoria.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
    if (borraMto) {
      evento.preventDefault();
      if (confirm("Eliminar esta mentoría?")) {
        Almacenamiento.eliminar(CLAVES.mentorias, borraMto);
        Mensajes.aviso("aviso-mentoria", "Mentoría eliminada.", "exito");
        refrescar();
      }
    }
  });

  /* ---------- Refresco general ---------- */
  function refrescar() {
    actualizarResumen();
    pintarMentores();
    pintarSolicitudes();
    pintarMentorias();
    opcionesEgresados(document.getElementById("m-egresado"), true);
    opcionesEgresados(document.getElementById("s-solicitante"), true);
    cargarSelectsAsignar();
    cargarSelectsMentoria();
  }

  refrescar();
});
