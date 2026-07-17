# LaborHub — Proyecto listo para publicar (PWA)

Esta carpeta convierte el prototipo de LaborHub en un sitio real que se puede
instalar en Android y iPhone, sin pasar por App Store ni Play Store.

## Publicarlo (sin usar la terminal)

1. Crea una cuenta gratis en **github.com** (si no tienes una).
2. Crea un repositorio nuevo (botón "New repository"). Ponle de nombre `laborhub`.
3. Descomprime este .zip en tu computadora y arrastra **todos** los archivos y
   carpetas (incluyendo `src/` y `public/`) a la página del repositorio en GitHub
   ("uploading an existing file" / arrastrar y soltar).
4. Crea una cuenta gratis en **vercel.com** o **netlify.com** (puedes entrar
   directamente con tu cuenta de GitHub).
5. Elige "Add New Project" (Vercel) o "Add new site → Import from Git" (Netlify)
   y selecciona el repositorio `laborhub` que acabas de subir.
6. Ambos detectan automáticamente que es un proyecto Vite y ya traen los
   comandos correctos. Solo da clic en **Deploy**.
7. En 1-2 minutos te dan una URL real, por ejemplo `laborhub.vercel.app`.

## Probarlo en un teléfono

- **Android (Chrome):** abre la URL, aparece un aviso para "Instalar app" o
  "Agregar a pantalla de inicio".
- **iPhone (Safari):** abre la URL, toca el botón de compartir (el cuadro con
  la flecha hacia arriba) → "Agregar a pantalla de inicio".

## Qué falta para que sea un producto real

Este sitio ya se puede compartir e instalar, pero todavía usa datos de
muestra (los mismos del prototipo). No hay todavía cuentas de usuario reales,
base de datos, ni pagos reales — ese es el siguiente paso, cuando ya haya
señales claras de que la idea funciona.

## Cambiar el ícono

Los archivos `public/icon-192.png` y `public/icon-512.png` son un ícono
provisional (una "L" sobre fondo oscuro). Reemplázalos por tu logo cuando
lo tengas, manteniendo esos mismos nombres y tamaños.
