# RedPecuaria — Frontend

Next.js 16 (App Router) + React 19 + Tailwind CSS v4. Ver `ARCHITECTURE.md` para las
decisiones de arquitectura y diseño.

## Puertos

Este proyecto corre a propósito en el **puerto 3001**, no el 3000 por defecto de Next —
el **backend** (NestJS) usa el 3010. `npm run dev`/`npm run start` ya llevan `-p 3001`
fijado en `package.json`, no hace falta pasarlo a mano.

| Servicio | Puerto | Dónde |
|---|---|---|
| Backend (API) | `3010` | `../backend` |
| Frontend (esta app) | `3001` | acá |

## Levantar el proyecto

Requiere el **backend corriendo** (con su Postgres) — este frontend no funciona solo, todo
sale de la API real.

```bash
# 1. copiar y ajustar las variables de entorno (si no existe .env.local)
cp .env.example .env.local

# 2. instalar dependencias
npm install

# 3. levantar en desarrollo
npm run dev
```

Abrir [http://localhost:3001](http://localhost:3001).

## Variables de entorno

| Variable | Qué es | Default en `.env.example` |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:3010` |

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo, puerto 3001 |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción, puerto 3001 |
| `npm run lint` | ESLint |
