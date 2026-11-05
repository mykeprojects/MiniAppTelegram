# Mini App de publicación de noticias

Formulario de tres pasos para preparar una noticia y enviarla desde una Telegram
Mini App. Ejecuta `npm run dev` para desarrollo y `npm run build` para validar
y generar la aplicación.

## Arquitectura

- `src/domain`: modelo de publicación y reglas de validación Yup.
- `src/application`: caso de uso y puertos de validación, almacenamiento y envío.
- `src/infrastructure`: adaptadores de Yup, Telegram Web App, API HTTP y Cloudinary.
- `src/presentation`: componentes React, coordinación del formulario y CSS
  Modules.

La Mini App obtiene `Telegram.WebApp.initData`, pide al backend una firma de
Cloudinary y sube la imagen directamente al proveedor. Después envía la noticia
y la URL segura al backend para guardarlas como borrador, asociadas al usuario
autorizado de Telegram. `VITE_API_URL` configura la URL base del backend (por
defecto `http://localhost:3000`). La Mini App debe abrirse desde Telegram.

El logo se importa desde `src/assets/logo.png`; si no se puede cargar, se
muestra un distintivo de texto de respaldo.
