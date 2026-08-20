/* ============================================================
   pagina-comunicados.js
   Gestion de comunicados institucionales.
   Permite publicar o guardar como borrador, editar y eliminar,
   con persistencia en Local Storage.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-comunicado");
  const cuerpoTabla = document.getElementById("tabla-comunicados");
  const botonBorrador = document.getElementById("btn-borrador");
  let idEnEdicion = null;

  function fechaLegible(iso) {
    if (!iso) { return "-"; }
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function pintarTabla() {
    const lista = Almacenamiento.obtener(CLAVES.comunicados);
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="6">No hay comunicados.</td></tr>';
      return;
    }
    lista.forEach(c => {
      const clase = c.estado === "Publicado" ? "estado-exito" : "estado-neutro";
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + c.titulo + "</td>" +
        "<td>" + c.categoria + "</td>" +
        "<td>" + c.audiencia + "</td>" +
        "<td>" + fechaLegible(c.fecha) + "</td>" +
        '<td><span class="estado ' + clase + '">' + c.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + c.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + c.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  /* Valida los campos obligatorios del comunicado. */
  function validar() {
    Mensajes.limpiarTodos(formulario);
    let ok = true;
    const titulo = document.getElementById("titulo").value;
    const contenido = document.getElementById("contenido").value;
    if (!Validar.requerido(titulo)) { Mensajes.mostrarError("titulo", "El titulo es obligatorio."); ok = false; }
    if (!Validar.requerido(contenido)) { Mensajes.mostrarError("contenido", "El contenido es obligatorio."); ok = false; }
    return ok;
  }

  /* Guarda el comunicado con el estado indicado (Publicado o Borrador). */
  function guardar(estado) {
    if (!validar()) { return; }

    const datos = {
      titulo: document.getElementById("titulo").value.trim(),
      categoria: document.getElementById("categoria").value,
      audiencia: document.getElementById("audiencia").value,
      contenido: document.getElementById("contenido").value.trim(),
      estado: estado
    };

    if (idEnEdicion) {
      const actual = Almacenamiento.obtener(CLAVES.comunicados).find(x => x.id === idEnEdicion);
      datos.fecha = actual ? actual.fecha : new Date().toISOString().slice(0, 10);
      Almacenamiento.actualizar(CLAVES.comunicados, idEnEdicion, datos);
      Mensajes.aviso("aviso-comunicado", "Comunicado actualizado.", "exito");
      idEnEdicion = null;
    } else {
      datos.id = Almacenamiento.generarId();
      datos.fecha = new Date().toISOString().slice(0, 10);
      Almacenamiento.agregar(CLAVES.comunicados, datos);
      Mensajes.aviso("aviso-comunicado",
        estado === "Publicado" ? "Comunicado publicado." : "Borrador guardado.", "exito");
    }
    formulario.reset();
    pintarTabla();
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    guardar("Publicado");
  });

  botonBorrador.addEventListener("click", () => guardar("Borrador"));

  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const c = Almacenamiento.obtener(CLAVES.comunicados).find(x => x.id === editar);
      if (!c) { return; }
      document.getElementById("titulo").value = c.titulo;
      document.getElementById("categoria").value = c.categoria;
      document.getElementById("audiencia").value = c.audiencia;
      document.getElementById("contenido").value = c.contenido;
      idEnEdicion = c.id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar este comunicado?")) {
        Almacenamiento.eliminar(CLAVES.comunicados, eliminar);
        Mensajes.aviso("aviso-comunicado", "Comunicado eliminado.", "exito");
        pintarTabla();
      }
    }
  });

  ["titulo", "contenido"].forEach(id =>
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id)));

  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
  });

  pintarTabla();
});
