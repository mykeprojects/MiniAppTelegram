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

La Mini App obtiene `Telegram.WebApp.initData` y el actor autenticado, incluido
su rol. Una guardia de rol muestra el panel de administración a `DIRECTORA` y
el panel de noticias propias a los demás roles. La administración comparte una
lista reutilizable y gestiona noticias, colaboradores e información de contacto.

Al crear una noticia, el usuario puede escoger `BORRADOR` o
`PENDIENTE_APROBACION`. Solo la directora puede aprobarla y activarla para que
aparezca en la API pública. Los colaboradores únicamente pueden editar sus
borradores. La subida de imágenes de la Mini App sigue usando una firma de
Cloudinary y conserva la asociación con el usuario autorizado. `VITE_API_URL`
configura la URL base del backend (por
defecto `http://localhost:3000`). La Mini App debe abrirse desde Telegram.

El logo se importa desde `src/assets/logo.png`; si no se puede cargar, se
muestra un distintivo de texto de respaldo.
