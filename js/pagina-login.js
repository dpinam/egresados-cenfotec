/* ============================================================
   pagina-login.js
   Valida el formulario de inicio de sesion, guarda la sesion
   en Local Storage y redirige al usuario segun su rol.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  DatosIniciales.cargar();

  const formulario = document.getElementById("form-login");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    Mensajes.limpiarTodos(formulario);

    const nombre = document.getElementById("nombre").value;
    const rol = document.getElementById("rol").value;
    const correo = document.getElementById("correo").value;
    const clave = document.getElementById("clave").value;
    let valido = true;

    if (!Validar.requerido(nombre)) {
      Mensajes.mostrarError("nombre", "Ingrese su nombre completo.");
      valido = false;
    }
    if (!Validar.correo(correo)) {
      Mensajes.mostrarError("correo", "Ingrese un correo válido.");
      valido = false;
    }
    if (!Validar.requerido(clave)) {
      Mensajes.mostrarError("clave", "La contraseña es obligatoria.");
      valido = false;
    }

    if (!valido) { return; }

    /* La sesion usa el nombre ingresado por la persona. */
    const usuario = Sesion.iniciar(rol, nombre);
    window.location.href = usuario.inicio;
  });

  /* Limpia el error de un campo apenas el usuario lo corrige. */
  ["nombre", "correo", "clave"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => Mensajes.limpiarError(id));
  });
});
