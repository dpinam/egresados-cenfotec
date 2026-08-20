/* ============================================================
   validaciones.js
   Funciones reutilizables para validar formularios y para
   mostrar u ocultar los mensajes de error junto a cada campo.
   ============================================================ */

const Validar = {

  /* Un texto es valido si no esta vacio ni contiene solo espacios. */
  requerido(valor) {
    return valor !== null && valor !== undefined && valor.trim() !== "";
  },

  /* Valida un correo electronico con una expresion regular sencilla. */
  correo(valor) {
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patron.test(valor.trim());
  },

  /* Valida telefonos de Costa Rica: 8 digitos, con o sin guion. */
  telefono(valor) {
    const patron = /^\d{4}-?\d{4}$/;
    return patron.test(valor.trim());
  },

  /* Valida un ano de graduacion dentro de un rango razonable. */
  anio(valor) {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero >= 1990 && numero <= 2026;
  },

  /* Valida una direccion web (http o https). */
  url(valor) {
    if (valor.trim() === "") { return true; } /* opcional */
    const patron = /^https?:\/\/.+/i;
    return patron.test(valor.trim());
  }
};

/* Utilidades para pintar y limpiar los errores en pantalla. */
const Mensajes = {

  /* Marca un campo como invalido y muestra el texto del error.
     Se apoya en la estructura <div class="campo"> del HTML. */
  mostrarError(idCampo, texto) {
    const campo = document.getElementById(idCampo);
    if (!campo) { return; }
    const contenedor = campo.closest(".campo");
    contenedor.classList.add("invalido");
    let span = contenedor.querySelector(".mensaje-error");
    if (!span) {
      span = document.createElement("span");
      span.className = "mensaje-error";
      contenedor.appendChild(span);
    }
    span.textContent = texto;
  },

  /* Quita el estado de error de un campo (cuando se corrige). */
  limpiarError(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) { return; }
    const contenedor = campo.closest(".campo");
    contenedor.classList.remove("invalido");
    const span = contenedor.querySelector(".mensaje-error");
    if (span) { span.textContent = ""; }
  },

  /* Limpia todos los errores de un formulario. */
  limpiarTodos(formulario) {
    formulario.querySelectorAll(".campo.invalido").forEach(campo => {
      campo.classList.remove("invalido");
      const span = campo.querySelector(".mensaje-error");
      if (span) { span.textContent = ""; }
    });
  },

  /* Muestra un aviso general (exito o error) arriba de una seccion. */
  aviso(idAviso, texto, tipo) {
    const aviso = document.getElementById(idAviso);
    if (!aviso) { return; }
    aviso.textContent = texto;
    aviso.className = "aviso visible " + (tipo === "error" ? "aviso-error" : "aviso-exito");
    /* El aviso de exito se oculta solo despues de unos segundos. */
    if (tipo !== "error") {
      setTimeout(() => { aviso.className = "aviso"; }, 3500);
    }
  }
};

/* Exportacion para poder probar el modulo con Node en la verificacion. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Validar };
}
