# Primalia (PWA)

Version web de Primalia, construida con React + Vite + Tailwind CSS. Replica el diseño,
la paleta de colores y el modelo de datos de la app iOS (Inicio, Campañas, Pagos, Cuentas, Gastos).

## Que incluye
- Los 5 apartados con altas, ediciones y borrados completos.
- Anillo de categorias, tarjeta "Total salidas del mes" (Gastos + Pagos computables).
- Interruptor "Avance automatico al marcar como Hecho" por pago con repeticion.
- Limites de gasto por categoria y aviso contextual al superarlos.
- Copia de seguridad exportable/importable en JSON.
- Instalable como PWA (Add to Home Screen) via vite-plugin-pwa.
- Todos los datos se guardan en localStorage del navegador.

## Que NO incluye (limitaciones reales de una PWA sin backend)
- Bloqueo con Face ID / biometria.
- Notificaciones push programadas (no hay servidor).
- Escaneo de tickets con camara (OCR) — se puede añadir despues con tesseract.js.

## Como ponerlo en marcha en local

```
npm install
npm run dev
```

Abre http://localhost:5173

## Como subirlo a GitHub

1. Crea un repositorio nuevo en GitHub (vacio, sin README).
2. Desde la carpeta del proyecto:

```
git init
git add .
git commit -m "Primalia PWA inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Como desplegarlo en Vercel

1. Entra en vercel.com e inicia sesion con tu cuenta de GitHub.
2. "Add New" -> "Project" -> selecciona el repositorio que acabas de subir.
3. Framework Preset: Vercel detecta Vite automaticamente. Si no, indica:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy. En un par de minutos tendras la URL publica.

## Iconos de la PWA

Antes de compilar en produccion, añade tus propios iconos en:
- `public/icons/icon-192.png` (192x192)
- `public/icons/icon-512.png` (512x512)

Son referenciados desde `vite.config.js`. Sin ellos, la app funciona igual,
pero el icono al instalarla en el movil se vera generico.

## Estructura del proyecto

```
primalia-web/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  public/
    icons/            <- pon aqui icon-192.png e icon-512.png
  src/
    main.jsx
    App.jsx
    index.css
    context/
      AppContext.jsx   <- toda la logica de negocio (equivalente a EstadoApp.swift)
    data/
      categories.js    <- categorias de Gasto, Pago, Cuenta (equivalente a los enums Swift)
    components/
      BottomNav.jsx
      Card.jsx
      Modal.jsx
      AnilloCategorias.jsx
      Dashboard.jsx
      Campanas.jsx
      Pagos.jsx
      Cuentas.jsx
      Gastos.jsx
      Ajustes.jsx
```
