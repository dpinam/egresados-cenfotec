/* ============================================================
   pagina-comunidades.js
   Gestion de comunidades profesionales.
   CRUD sobre Local Storage con validacion.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();
  Sesion.proteger();

  const formulario = document.getElementById("form-comunidad");
  const cuerpoTabla = document.getElementById("tabla-comunidades");
  let idEnEdicion = null;

  function pintarTabla() {
    const lista = Almacenamiento.obtener(CLAVES.comunidades);
    cuerpoTabla.innerHTML = "";
    if (lista.length === 0) {
      cuerpoTabla.innerHTML = '<tr class="fila-vacia"><td colspan="5">No hay comunidades.</td></tr>';
      return;
    }
    lista.forEach(c => {
      const clase = c.estado === "Activa" ? "estado-exito" : "estado-neutro";
      const fila = document.createElement("tr");
      fila.innerHTML =
        "<td>" + c.nombre + "</td>" +
        "<td>" + c.area + "</td>" +
        "<td>" + c.miembros + "</td>" +
        '<td><span class="estado ' + clase + '">' + c.estado + "</span></td>" +
        '<td>' +
          '<a href="#" class="boton boton-secundario boton-pequeno" data-editar="' + c.id + '">Editar</a> ' +
          '<a href="#" class="boton boton-peligro boton-pequeno" data-eliminar="' + c.id + '">Eliminar</a>' +
        "</td>";
      cuerpoTabla.appendChild(fila);
    });
  }

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formulario);

    const nombre = document.getElementById("nombre").value;
    if (!Validar.requerido(nombre)) {
      Mensajes.mostrarError("nombre", "El nombre de la comunidad es obligatorio.");
      return;
    }
    const repetida = Almacenamiento.obtener(CLAVES.comunidades)
      .some(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase() && c.id !== idEnEdicion);
    if (repetida) {
      Mensajes.mostrarError("nombre", "Ya existe una comunidad con ese nombre.");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      area: document.getElementById("area").value,
      descripcion: document.getElementById("desc").value.trim()
    };

    if (idEnEdicion) {
      Almacenamiento.actualizar(CLAVES.comunidades, idEnEdicion, datos);
      Mensajes.aviso("aviso-comunidad", "Comunidad actualizada.", "exito");
      idEnEdicion = null;
      formulario.querySelector("button[type=submit]").textContent = "Crear comunidad";
    } else {
      datos.id = Almacenamiento.generarId();
      datos.miembros = 0;
      datos.estado = "Activa";
      Almacenamiento.agregar(CLAVES.comunidades, datos);
      Mensajes.aviso("aviso-comunidad", "Comunidad creada.", "exito");
    }
    formulario.reset();
    pintarTabla();
  });

  cuerpoTabla.addEventListener("click", (evento) => {
    const editar = evento.target.getAttribute("data-editar");
    const eliminar = evento.target.getAttribute("data-eliminar");

    if (editar) {
      evento.preventDefault();
      const c = Almacenamiento.obtener(CLAVES.comunidades).find(x => x.id === editar);
      if (!c) { return; }
      document.getElementById("nombre").value = c.nombre;
      document.getElementById("area").value = c.area;
      document.getElementById("desc").value = c.descripcion || "";
      idEnEdicion = c.id;
      formulario.querySelector("button[type=submit]").textContent = "Guardar cambios";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (eliminar) {
      evento.preventDefault();
      if (confirm("Desea eliminar esta comunidad?")) {
        Almacenamiento.eliminar(CLAVES.comunidades, eliminar);
        Mensajes.aviso("aviso-comunidad", "Comunidad eliminada.", "exito");
        pintarTabla();
      }
    }
  });

  document.getElementById("nombre").addEventListener("input", () => Mensajes.limpiarError("nombre"));
  formulario.addEventListener("reset", () => {
    Mensajes.limpiarTodos(formulario);
    idEnEdicion = null;
    formulario.querySelector("button[type=submit]").textContent = "Crear comunidad";
  });

  pintarTabla();
});
