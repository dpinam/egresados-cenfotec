/* ============================================================
   pagina-actividades.js
   Gestion de actividades institucionales.
   CRUD sobre Local Storage con validacion y filtros.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-actividad");
  const cuerpoTabla = document.getElementById("tabla-actividades");
  const formFiltros = document.getElementById("filtros-actividades");
  let idEnEdicion = null;

  /* Convierte una fecha yyyy-mm-dd a dd/mm/yyyy para mostrar. */
  function fechaLegible(iso) {
    if (!iso) { return "-"; }
    const partes = iso.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function claseEstado(estado) {
    return estado === "Finalizada" ? "estado-exito" : "estado-neutro";
  }

  function pintarTabla(lista) {
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="6">No hay actividades.</td></tr>';
      return;
    }
    lista.forEach(a => {
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + a.titulo + "</td>" +
        "<td>" + a.tipo + "</td>" +
        "<td>" + fechaLegible(a.fecha) + "</td>" +
        "<td>" + a.modalidad + "</td>" +
        '<td><span class="estado ' + claseEstado(a.estado) + '">' + a.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + a.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + a.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  function refrescar() {
    pintarTabla(Almacenamiento.obtener(CLAVES.actividades));
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formulario);
    let ok = true;

    const titulo = document.getElementById("titulo").value;
    const fecha = document.getElementById("fecha").value;
    if (!Validar.requerido(titulo)) { Mensajes.mostrarError("titulo", "El titulo es obligatorio."); ok = false; }
    if (!Validar.requerido(fecha)) { Mensajes.mostrarError("fecha", "Seleccione la fecha."); ok = false; }
    if (!ok) { return; }

    const datos = {
      titulo: titulo.trim(),
      tipo: document.getElementById("tipo").value,
      modalidad: document.getElementById("modalidad").value,
      fecha: fecha,
      lugar: document.getElementById("lugar").value.trim(),
      descripcion: document.getElementById("desc").value.trim(),
      estado: "Programada"
    };

    if (idEnEdicion) {
      const actual = Almacenamiento.obtener(CLAVES.actividades).find(x => x.id === idEnEdicion);
      datos.estado = actual ? actual.estado : "Programada";
      Almacenamiento.actualizar(CLAVES.actividades, idEnEdicion, datos);
      Mensajes.aviso("aviso-actividad", "Actividad actualizada.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Publicar actividad";
    } else {
      datos.id = Almacenamiento.generarId();
      Almacenamiento.agregar(CLAVES.actividades, datos);
      Mensajes.aviso("aviso-actividad", "Actividad publicada.", "exito");
    }
    formulario.reset();
    refrescar();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const a = Almacenamiento.obtener(CLAVES.actividades).find(x => x.id === editar);
      if (!a) { return; }
      document.getElementById("titulo").value = a.titulo;
      document.getElementById("tipo").value = a.tipo;
      document.getElementById("modalidad").value = a.modalidad;
      document.getElementById("fecha").value = a.fecha;
      document.getElementById("lugar").value = a.lugar || "";
      document.getElementById("desc").value = a.descripcion || "";
      idEnEdicion = a.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar esta actividad?")) {
        Almacenamiento.eliminar(CLAVES.actividades, eliminar);
        Mensajes.aviso("aviso-actividad", "Actividad eliminada.", "exito");
        refrescar();
      }
    }
  });

  ["titulo", "fecha"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id)));

  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Publicar actividad";
  });

  formFiltros.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const modalidad = document.getElementById("f-modalidad").value;
    const estado = document.getElementById("f-estado").value;
    const lista = Almacenamiento.obtener(CLAVES.actividades).filter(a => {
      if (modalidad !== "Todas" && a.modalidad !== modalidad) { return false; }
      if (estado !== "Todos" && a.estado !== estado) { return false; }
      return true;
    });
    pintarTabla(lista);
  });

  refrescar();
});
