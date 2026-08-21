/* ============================================================
   pagina-oportunidades.js
   Gestion de oportunidades laborales (RF-23, RF-24, RF-25).
   CRUD sobre Local Storage, filtros y panel de detalle.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-oportunidad");
  const cuerpoTabla = document.getElementById("tabla-oportunidades");
  const formFiltros = document.getElementById("filtros-oportunidades");
  let idEnEdicion = null;

  function fechaLegible(iso) {
    if (!iso) { return "-"; }
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function claseEstado(estado) {
    if (estado === "Publicada") { return "estado-exito"; }
    if (estado === "Vencida") { return "estado-error"; }
    return "estado-neutro";
  }

  function pintarTabla(lista) {
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="7">No hay oportunidades.</td></tr>';
      return;
    }
    lista.forEach(o => {
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + o.empresa + "</td>" +
        "<td>" + o.puesto + "</td>" +
        "<td>" + o.modalidad + "</td>" +
        "<td>" + o.ubicacion + "</td>" +
        "<td>" + fechaLegible(o.vencimiento) + "</td>" +
        '<td><span class="estado ' + claseEstado(o.estado) + '">' + o.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-ver="' + o.id + '">Ver</a> ' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + o.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + o.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  function refrescar() {
    pintarTabla(Almacenamiento.obtener(CLAVES.oportunidades));
  }

  function mostrarDetalle(o) {
    const panel = document.getElementById("detalle-oportunidad");
    panel.innerHTML =
      '<span class="estado ' + claseEstado(o.estado) + '">' + o.estado + "</span>" +
      "<h3>" + o.puesto + " - " + o.empresa + "</h3>" +
      '<p class="texto-ayuda">' + o.modalidad + " - " + o.ubicacion +
        " - Publicada el " + fechaLegible(o.publicacion) + " - Vence el " + fechaLegible(o.vencimiento) + "</p>" +
      "<p>" + (o.descripcion || "Sin descripción.") + "</p>" +
      '<p class="texto-ayuda">Contacto: ' + o.contacto + "</p>";
    panel.scrollIntoView({ behavior: "smooth" });
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formulario);
    let ok = true;

    const empresa = document.getElementById("empresa").value;
    const puesto = document.getElementById("puesto").value;
    const ubicacion = document.getElementById("ubicacion").value;
    const contacto = document.getElementById("contacto").value;
    const publicacion = document.getElementById("publicacion").value;
    const vencimiento = document.getElementById("vencimiento").value;
    const descripcion = document.getElementById("descripcion").value;

    if (!Validar.requerido(empresa)) { Mensajes.mostrarError("empresa", "La empresa es obligatoria."); ok = false; }
    if (!Validar.requerido(puesto)) { Mensajes.mostrarError("puesto", "El puesto es obligatorio."); ok = false; }
    if (!Validar.requerido(ubicacion)) { Mensajes.mostrarError("ubicacion", "La ubicación es obligatoria."); ok = false; }
    if (!Validar.requerido(contacto)) { Mensajes.mostrarError("contacto", "Indique un correo o enlace de contacto."); ok = false; }
    if (!Validar.requerido(publicacion)) { Mensajes.mostrarError("publicacion", "Seleccione la fecha de publicación."); ok = false; }
    if (!Validar.requerido(vencimiento)) { Mensajes.mostrarError("vencimiento", "Seleccione la fecha de vencimiento."); ok = false; }
    if (!Validar.requerido(descripcion)) { Mensajes.mostrarError("descripcion", "La descripción es obligatoria."); ok = false; }

    /* La fecha de vencimiento no puede ser anterior a la de publicacion. */
    if (ok && vencimiento < publicacion) {
      Mensajes.mostrarError("vencimiento", "El vencimiento no puede ser anterior a la publicación.");
      ok = false;
    }
    if (!ok) { return; }

    const datos = {
      empresa: empresa.trim(),
      puesto: puesto.trim(),
      area: document.getElementById("area").value,
      modalidad: document.getElementById("modalidad").value,
      ubicacion: ubicacion.trim(),
      contacto: contacto.trim(),
      publicacion: publicacion,
      vencimiento: vencimiento,
      descripcion: descripcion.trim(),
      estado: document.getElementById("estado").value
    };

    if (idEnEdicion) {
      Almacenamiento.actualizar(CLAVES.oportunidades, idEnEdicion, datos);
      Mensajes.aviso("aviso-oportunidad", "Oportunidad actualizada.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Publicar oportunidad";
    } else {
      datos.id = Almacenamiento.generarId();
      Almacenamiento.agregar(CLAVES.oportunidades, datos);
      Mensajes.aviso("aviso-oportunidad", "Oportunidad publicada.", "exito");
    }
    formulario.reset();
    refrescar();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const ver = evento.target.getAttribute("data-ver");
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (ver) {
      evento.preventDefault();
      const o = Almacenamiento.obtener(CLAVES.oportunidades).find(x => x.id === ver);
      if (o) { mostrarDetalle(o); }
    }

    if (editar) {
      evento.preventDefault();
      const o = Almacenamiento.obtener(CLAVES.oportunidades).find(x => x.id === editar);
      if (!o) { return; }
      document.getElementById("empresa").value = o.empresa;
      document.getElementById("puesto").value = o.puesto;
      document.getElementById("area").value = o.area;
      document.getElementById("modalidad").value = o.modalidad;
      document.getElementById("ubicacion").value = o.ubicacion;
      document.getElementById("contacto").value = o.contacto;
      document.getElementById("publicacion").value = o.publicacion;
      document.getElementById("vencimiento").value = o.vencimiento;
      document.getElementById("descripcion").value = o.descripcion;
      document.getElementById("estado").value = o.estado;
      idEnEdicion = o.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar esta oportunidad?")) {
        Almacenamiento.eliminar(CLAVES.oportunidades, eliminar);
        Mensajes.aviso("aviso-oportunidad", "Oportunidad eliminada.", "exito");
        refrescar();
      }
    }
  });

  ["empresa", "puesto", "ubicacion", "contacto", "publicacion", "vencimiento", "descripcion"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id)));

  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Publicar oportunidad";
  });

  formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const empresa = (document.getElementById("f-empresa").value || "").toLowerCase().trim();
    const area = document.getElementById("f-area").value;
    const modalidad = document.getElementById("f-modalidad").value;
    const ubicacion = (document.getElementById("f-ubicacion").value || "").toLowerCase().trim();

    const lista = Almacenamiento.obtener(CLAVES.oportunidades).filter(o => {
      if (empresa && !o.empresa.toLowerCase().includes(empresa)) { return false; }
      if (area !== "Todas" && o.area !== area) { return false; }
      if (modalidad !== "Todas" && o.modalidad !== modalidad) { return false; }
      if (ubicacion && !o.ubicacion.toLowerCase().includes(ubicacion)) { return false; }
      return true;
    });
    pintarTabla(lista);
  });

  refrescar();
});
