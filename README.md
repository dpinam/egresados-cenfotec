# Sistema de Gestión de Egresados - Universidad CENFOTEC

Proyecto del curso **SOFT-06 - Diseño y Programación Web** (Sección SCP0, Periodo 2026-C2).
Avance 2: interfaz web con HTML, CSS y JavaScript, con validación de formularios y
almacenamiento de datos en **Local Storage**.

## Integrantes
- Dylan Piña Moya
- Luis Alonso Agüero Suárez

## Como ejecutar
No requiere instalacion ni servidor.

1. Abrir la carpeta en VS Code (o hacer doble clic en `Egresados-CENFOTEC.code-workspace`).
2. Instalar la extensión **Live Server** si se sugiere.
3. Clic derecho en `index.html` -> **Open with Live Server**.

Alternativa: abrir `index.html` directamente en el navegador.

## Roles de acceso (demo)
Desde la portada, entrar por **Iniciar sesión**, escribir el nombre y elegir un rol:
- **Registro**: egresados, títulos, carreras y escuelas.
- **Bienestar Estudiantil**: actividades, comunidades, mentorías, comunicados y oportunidades.
- **Egresado**: perfil, mentorías, comunidades y oportunidades.

## Estructura
```
PROYECTO WEB/
├── index.html            Portada pública (landing)
├── login.html            Inicio de sesión
├── inicio.html           Panel de inicio
├── perfil.html           Perfil del egresado
├── egresados.html        Gestión de egresados (+ importación CSV)
├── títulos.html          Gestión de títulos
├── carreras.html         Gestión de carreras
├── escuelas.html         Gestión de escuelas
├── actividades.html      Gestión de actividades
├── comunidades.html      Gestión de comunidades
├── mentorías.html        Gestión de mentorías
├── oportunidades.html    Oportunidades laborales
├── comunicados.html      Comunicados
├── css/styles.css        Estilos
├── assets/img/           Imagenes y logos
└── js/                   Logica (validación, Local Storage, navegacion, por página)
```


## Notas
Los datos de ejemplo se cargan la primera vez. Para reiniciarlos, borrar el
almacenamiento del sitio en el navegador (o cambia solo al actualizar la versión de datos).
