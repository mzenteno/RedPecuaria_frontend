# Arquitectura del proyecto — Frontend RedPecuaria

Este documento define las reglas de arquitectura del frontend. Es el equivalente del
`ARCHITECTURE.md` del backend — mismo criterio de rigor, adaptado a Next.js/React.

## 1. Stack

- **Next.js 16 (App Router)** + **React 19** (React Compiler habilitado — no hace falta
  `useMemo`/`useCallback` manuales).
- **TypeScript** estricto, alias `@/*` → `src/*`.
- **Tailwind CSS v4** — sin `tailwind.config.js`; los tokens de diseño viven en
  `src/app/globals.css` (`@theme inline`).
- **TanStack React Query** — cache/fetch de datos del servidor (listas, el menú autorizado).
- **react-hook-form + zod** — formularios y su validación. Es una decisión deliberada: el
  proyecto de referencia que inspiró este diseño (`prestamos/frontend`) valida a mano; acá se
  usa una librería porque es una práctica más robusta (menos boilerplate, validación
  declarativa) para un proyecto que va a crecer.
- **lucide-react** — íconos.
- Sin librería de componentes (ni shadcn ni MUI) — componentes propios mínimos, mismo criterio
  que el proyecto de referencia.

## 2. Diseño visual

- Paleta verde (`--primary: #2f9e44`), definida como variables CSS en `:root` (claro) y `.dark`
  (oscuro) — cambiar el color de marca es tocar solo `globals.css`, ningún componente lo
  hardcodea.
- **Esquinas cuadradas por diseño**: `* { border-radius: 0 !important }`, con `.circle` como
  única excepción (avatares). Es un rasgo visual deliberado, no un olvido.
- Tipografía semántica vía clases (`.tipo-titulo-card`, `.tipo-label`, etc.) en vez de repetir
  combinaciones de utilidades Tailwind.
- **Fuente: Poppins** (`next/font/google`, pesos 300–800), cargada en `app/layout.tsx` con
  `variable: '--font-app'` y mapeada a `--font-sans` en `@theme inline` — la misma fuente que
  usa el proyecto de referencia, para mantener fidelidad visual exacta.
- Anti-flash de tema: un `<script>` inline en `app/layout.tsx` aplica la clase `.dark` al
  `<html>` antes de la hidratación, leyendo el mismo `localStorage` (`rp_theme`) que usa
  `ThemeProvider` (`contexts/theme.context.tsx`).
- Las páginas de auth (`(auth)/login`) fuerzan tema claro (clase `.page-auth`), independiente
  del toggle global — igual que el proyecto de referencia.
- **Espaciado entre subtítulo y control**: un subtítulo/texto de ayuda nunca queda pegado al
  control que describe. En diálogos (`CompanyDialog`, `CompanySelectDialog`): un solo `gap-8`
  en el contenedor flex que envuelve título+subtítulo, campo(s) y footer — no márgenes sueltos
  por bloque (`mb-8`/`mb-4`/`mt-6` sin relación entre sí no garantizan espacios iguales, aunque
  el número final "parezca" parecido).
- **Formato de fecha: `DD/MM/YYYY`**, siempre — usar `lib/format-date.ts` (`formatDate()`), no
  `Intl.DateTimeFormat`/`toLocaleDateString` sueltos en cada componente.
- **Botones estandarizados** (`components/ui/button.tsx`, prop `variant`): **todo** botón que
  confirma una acción — Aceptar/Guardar/Confirmar, y también **Eliminar** — usa
  `variant="primary"` (`.btn-primary`, verde, el default, no hace falta pasarlo). Cancelar
  siempre usa `variant="secondary"` (`.btn-secondary`, gris, `--secondary` en `globals.css`).
  Ambas clases comparten tamaño/forma/estados hover-active-disabled — solo cambia el color.
  **No existe una variante roja/destructiva** — se probó una (`.btn-danger`) para "Desactivar"
  y se sacó: la regla del proyecto es que el color no depende de qué tan destructiva es la
  acción, todo confirma en verde. `.dialog-btn-cancel` (una versión más chica y sin relleno) se
  eliminó al introducir este estándar.
- **Confirmaciones de eliminar/desactivar: texto genérico**, no específico de la entidad —
  título "Eliminar este registro", subtítulo "¿Está seguro de eliminar el registro?" (ver
  `ConfirmDialog` en `app/(main)/companies/page.tsx`). Mismo texto para Empresas/Usuarios/
  Roles/Permisos, no hay que redactar uno por pantalla.
- **Cancelar y el botón de confirmar del mismo ancho**: `.dialog-footer .btn-primary`/
  `.btn-secondary` tienen `min-w-28` — sin esto, cada botón queda del ancho de su propio texto
  ("Cancelar" vs "Guardar" vs "Eliminar" no miden lo mismo) y no se leen como un mismo par de
  acciones. Es una regla en `.dialog-footer`, no algo que cada diálogo tenga que repetir.
- **Sin voseo** ("Modificá", "Completá", "Elegí") en ningún texto de la UI — imperativo neutro
  ("Modifica", "Completa", "Selecciona") en su lugar. Se había colado en varios diálogos
  (`CompanyDialog`, `RoleDialog`, `UserDialog`, `CompanySelectDialog`, el placeholder genérico
  de `Select`, `forgot-password`), corregido en todos a la vez.
- **En una tabla, solo los encabezados van en negrita** (`.data-table th` ya trae
  `font-semibold` por CSS) — los datos de cada fila van en peso normal, ningún `<td>` lleva
  `font-medium`/`font-semibold` a mano (se había colado en la primera columna de
  `CompanyTable`/`UserTable`, corregido).
- **Toda `.data-table` va envuelta en un `.data-table-wrapper`** (`overflow-x-auto`, ver
  `globals.css`) — sin esto, en una pantalla angosta las columnas se salen del `.card` en vez
  de generar su propio scroll horizontal (le pasó a `CompanyTable`/`UserTable`, corregido). La
  tabla en sí tiene `min-width: 40rem` para que las columnas no se aplasten ilegibles antes de
  activar el scroll.
- **Filas intercaladas en toda tabla** (`.data-table tbody tr:nth-child(even)`, variable
  `--bg-stripe`) — a propósito no es `--bg-page` ni `--bg-hover`: más marcada que la primera
  (si no, es casi indistinguible del blanco de `--bg-card`) pero más clara que la segunda,
  para que el hover se siga notando incluso sobre una fila par. Es una regla de `.data-table`,
  no algo que cada tabla nueva (Roles, Permisos) tenga que repetir.
- **`.data-table` es una grilla completa** (`border` en la tabla y en cada `th`/`td`, más
  `border-collapse: collapse` para que las líneas entre celdas no salgan dobles/más gruesas) —
  antes solo `border-b` (línea inferior), casi indistinguible entre el encabezado y los datos a
  simple vista. **Iteración previa, descartada**: se probó primero un fondo propio en `thead`
  (`--bg-page`, después `--bg-hover`) en vez de bordes — el usuario prefirió bordes en toda la
  tabla. Regla de `.data-table`, aplica a toda tabla de la app de una sola vez.

## 3. Estructura de carpetas

Mismo patrón en capas que usa el backend — **domain → application → infrastructure →
presentation** — pero acá `presentation` se reparte entre `app/` (rutas), `components/` y
`hooks/`, porque así es como Next.js espera que se organicen las páginas:

```
src/
  app/                        # Next.js App Router — SOLO rutas/páginas, sin lógica de negocio
    (auth)/                   # Route group: layout centrado, tema claro forzado
      login/page.tsx
    (main)/                   # Route group: layout protegido (guard de sesión)
      dashboard/page.tsx
      loading.tsx             # Se muestra en la transición de ruta dentro de (main)
    layout.tsx                # Root layout: fuente, providers, script anti-flash
    page.tsx                  # "/" → redirige a /dashboard o /login según haya sesión
    error.tsx                 # Error boundary raíz (App Router) — captura errores no manejados
    not-found.tsx             # 404 con el mismo diseño que el resto de la app
    globals.css

  domain/                     # SOLO interfaces/tipos — sin lógica, sin fetch
    auth/                     # auth.entity.ts, auth.repository.ts, login.use-case.ts
    menu/                     # menu.entity.ts, menu.repository.ts, get-menu.use-case.ts

  application/                # Implementación de los use-cases — orquesta, no sabe de HTTP
    auth/login.use-case.impl.ts
    menu/get-menu.use-case.impl.ts   # acá vive el armado del árbol de menú (ver §5)

  infrastructure/             # Detalles técnicos: HTTP, repos concretos, composition root
    http/
      http-client.ts          # wrapper de fetch — entiende el envoltorio real de la API
      session-storage.ts      # persistencia de la sesión (localStorage)
    repositories/
      auth/auth.repository.impl.ts
      menu/menu.repository.impl.ts
    di/                       # composition root — instancia repos + use-cases, una sola vez
      auth.container.ts
      menu.container.ts

  components/
    ui/                       # Button, Input — atómicos, sin lógica de negocio
    layout/                   # Shell, Sidebar, SidebarContext, TopBar, MenuIcon
    auth/                     # LoginForm

  hooks/                      # Puente entre componentes y casos de uso
    auth/use-login.ts
    menu/use-menu.ts          # envuelve el use-case en React Query

  contexts/                   # Providers globales de React
    theme.context.tsx
    query.provider.tsx

  lib/
    decode-jwt.ts             # decodifica (no valida) el payload del access token
```

**Regla de dependencia** (igual que el backend, mismo sentido): `domain` no importa nada de las
otras capas; `application` implementa las interfaces de `domain`, recibiendo el repositorio por
constructor; `infrastructure` es la única capa que sabe que existe `fetch`/una API REST;
`presentation` (`app`, `components`, `hooks`) solo consume `infrastructure/di/*` — nunca
instancia un repositorio o un use-case a mano.

## 4. Autenticación

- **Login por `username` + contraseña** (no email — así lo define el backend, ver
  `docs/user/user.md` del backend). El campo contraseña tiene un botón de mostrar/ocultar
  (ícono `Eye`/`EyeOff` de lucide-react) vía la prop `rightElement` de `components/ui/input.tsx`
  — un slot genérico para un ícono/botón flotante a la derecha del input, reutilizable para
  otros casos además de contraseñas.
- **Selector de empresa**: si el login devuelve `CompanySelectionRequiredException` (el usuario
  tiene más de una empresa activa), el backend manda la lista en `details.choices` (ver
  `ARCHITECTURE.md §6` del backend). `useLogin` (`hooks/auth/use-login.ts`) detecta ese error
  por nombre, guarda las credenciales pendientes y expone `companyChoices`; `LoginForm` muestra
  `CompanySelectDialog` (usa las clases `.dialog-*` del sistema de diseño, sin librería externa
  — necesita una lista dinámica de opciones, no solo mostrar un texto) y al elegir una reintenta
  el login con `companyId`.
- **"¿Olvidaste tu contraseña?" — solo el enlace, sin funcionalidad todavía**: apunta a
  `/forgot-password`, una página estática que explica que hay que contactar a un administrador.
  El backend no tiene endpoint de recuperación (ni tabla de reset tokens, ni envío de email) —
  queda pendiente como el resto de los puntos de esta sección, a implementar cuando se decida
  el proveedor de correo.
- **Sesión en `localStorage`** (`rp_access_token`, `rp_refresh_token`, `rp_user_id`,
  `rp_company_id`, `rp_role_id`) — **límite conocido, deliberado para esta entrega**: no hay
  cookies httpOnly. Un XSS podría robar el token. La alternativa correcta (refresh token en
  cookie httpOnly, seteada por un Route Handler de Next que actúe de proxy) es más robusta
  pero implica bastante más infraestructura (API routes intermedias) — queda pendiente si el
  proyecto lo requiere más adelante.
- **Guard de rutas del lado del cliente** (`app/(main)/layout.tsx`): si no hay `access_token` en
  `localStorage`, redirige a `/login`. **No es un middleware de Next.js** (esos corren en el
  edge/servidor y no pueden leer `localStorage`) — es un layout `'use client'` que verifica al
  montar. Mejor que no tener nada (que es lo que tenía el proyecto de referencia), pero no
  equivale a protección server-side real.
  El chequeo de `localStorage` vive en un `useEffect`, **no** en el inicializador de `useState`
  — un `'use client'` en el App Router igual se renderiza una vez en el servidor para el HTML
  inicial (`localStorage` no existe ahí), así que leerlo directo en el render hace que el
  servidor calcule "sin sesión" y el cliente "con sesión" en ese primer render, y React tira un
  error de hidratación. El estado arranca en `null` ("todavía verificando") en ambos lados por
  igual, y el efecto lo corrige después de montar — a costa de un `eslint-disable` puntual de
  `react-hooks/set-state-in-effect` (con comentario explicando por qué), porque acá sí hace
  falta el efecto: es justo el caso de "sincronizar con un sistema externo" que la regla espera.
- **Refresh automático de tokens**: `http-client.ts` intercepta cualquier `401`, llama a
  `POST /auth/refresh` una sola vez (con un candado para no disparar refreshes concurrentes si
  varias requests fallan a la vez), reintenta la request original, y si el refresh también
  falla, limpia la sesión y redirige a `/login`. El proyecto de referencia no tenía nada de
  esto — es una adición real, no una copia.
- **No hay página de registro público** — a propósito: el backend no expone un endpoint público
  de registro (`POST /users` requiere estar autenticado, ver `docs/user/user.md` del backend:
  "No hay auto-registro público"). Los usuarios los crea un administrador ya logueado.

## 5. Menú dinámico (no hardcodeado)

A diferencia del proyecto de referencia (`lib/nav.ts` estático), acá el menú sale de
`GET /me/menu` del backend — que entrega el catálogo completo de menús activos, cada uno con
los permisos del rol actual (`canView`, etc.), **sin filtrar ni armar el árbol** (así lo diseña
el backend a propósito, ver `docs/menu/menu.md` del backend).

Es responsabilidad del frontend (`application/menu/get-menu.use-case.impl.ts`) decidir qué se
ve:
- Un ítem hoja se muestra si `canView` es `true`.
- Un ítem padre puramente organizativo (`path === null`, ej. "Administración") se muestra si
  tiene **al menos un hijo visible**, aunque el padre no tenga fila de permiso propia.

El ícono de cada ítem se resuelve en el frontend por `key` (`components/layout/menu-icon.tsx`)
— el backend no manda nombre de ícono (el campo `icon` viene `null`), y elegir el ícono es una
decisión de presentación, no de negocio.

### Control de permisos en pantalla (`usePermission` / `RequirePermission`)

Los mismos 4 flags de `GET /me/menu` (`canView/canCreate/canEdit/canDelete`) también se usan
para ocultar acciones dentro de una pantalla ya construida, no solo para armar el sidebar:

- `hooks/menu/use-permission.ts` (`usePermission(menuKey)`) — devuelve los 4 flags del rol
  actual para un `key` puntual (ej. `'companies'`), para ocultar el botón "Nuevo"
  (`PageToolbar.onNew`, ahora opcional) o los íconos de editar/eliminar de una tabla
  (`CompanyTable.canEdit/canDelete`, mismo patrón a copiar en las próximas tablas).
- `components/auth/require-permission.tsx` (`<RequirePermission menuKey="...">`) — envuelve una
  página entera y redirige a `/dashboard` si el rol no tiene `canView`, para que escribir la URL
  a mano no alcance para entrar a una pantalla sin permiso (el sidebar ya la oculta, pero eso no
  bloquea la navegación directa).
- **Excepción única**: un **Super Administrador** siempre tiene los 4 flags en `true`, sin
  importar `role_menu_permissions` (`application/menu/apply-super-admin-override.ts`) — así no
  queda bloqueado si se crea un menú nuevo y nadie le concede el permiso a mano todavía.
- **Importante — esto NO es control de acceso real**: es solo UX (ocultar botones/pantallas).
  El backend no valida estos permisos (decisión explícita, ver
  `docs/permission/permission.md` del backend) — cualquiera con un token válido puede seguir
  llamando la API directamente sin pasar por estos chequeos.

## 6. Cliente HTTP — el envoltorio real de la API, no uno genérico

`infrastructure/http/http-client.ts` conoce la forma exacta de las respuestas del backend (ver
`ARCHITECTURE.md` §6 del backend):

```json
// éxito
{ "success": true, "statusCode": 200, "timestamp": "...", "path": "...", "data": { } }
// error
{ "success": false, "statusCode": 401, "timestamp": "...", "path": "...", "error": "...", "message": "..." }
```

- Un `204` (ej. logout) no lleva body — no se intenta parsear JSON en ese caso.
- Cualquier error (`success: false`) se convierte en una `ApiError` con `statusCode`,
  `errorName` y `message` (si `message` es un array de `class-validator`, se unen con coma).
- **`httpClient.getPaginated<T>()`** — variante de `get<T>()` para endpoints que devuelven
  `meta` (`{total, page, pageSize}`) junto a `data` en la raíz del sobre; lanza si `meta` no
  viene (protege contra usarlo en un endpoint que no pagina). Usado por `Users`, `Properties`,
  `Investments` (las 3 variantes) y `Kardex` — ver §9 y §14.

## 7. Convenciones de nombres

Mismo criterio que el proyecto de referencia, que ya es coherente y vale la pena mantener:

| Sufijo | Capa | Ejemplo |
|---|---|---|
| `.entity.ts` | domain | `auth.entity.ts` |
| `.repository.ts` | domain (interfaz) | `auth.repository.ts` |
| `.repository.impl.ts` | infrastructure (implementación) | `auth.repository.impl.ts` |
| `.use-case.ts` | domain (interfaz) | `login.use-case.ts` |
| `.use-case.impl.ts` | application (implementación) | `login.use-case.impl.ts` |
| `.container.ts` | infrastructure/di (composition root) | `auth.container.ts` |
| `.context.tsx` | contexts (React Context) | `theme.context.tsx` |
| `.provider.tsx` | contexts (wrapper de librería externa) | `query.provider.tsx` |

- Archivos y carpetas en **kebab-case**; componentes React en **PascalCase** dentro del
  archivo, exportados como *named export* (no `default`) salvo las páginas de `app/` (Next.js
  lo exige).
- Interfaces de puertos sin prefijo `I` — mismo criterio que el backend.

## 8. Límites conocidos de esta entrega (documentados, no olvidados)

- Sesión en `localStorage`, sin cookies httpOnly (§4).
- Guard de rutas client-side, no middleware server-side (§4).
- **Empresas** (`app/(main)/companies`, §9), **Usuarios** (`app/(main)/users`, §10), **Roles**
  (`app/(main)/roles`, §11) y **Permisos** (`app/(main)/permissions`, §12) ya tienen pantalla —
  el módulo `auth` completo tiene su CRUD/editor en el frontend.
- **Menú del usuario (`TopBar`)**: usa los 3 datos de identidad que trae el JWT (`username`,
  `fullName`, `email` — ver `docs/auth-sessions/auth-sessions.md` del backend) en 3 lugares
  distintos: el trigger (afuera del dropdown, con el avatar) y las iniciales muestran
  `username` (con el que la persona se loguea); el header del dropdown, ya abierto, muestra el
  **nombre real** (`fullName`) arriba y el **email** debajo. No hay una línea de "rol" (el
  nombre real del `Role` es por empresa, no viaja en el JWT). `username`/`fullName` pueden
  faltar en una sesión ya abierta antes de este cambio (el token no se reemite hasta el próximo
  login/refresh) — el email queda de respaldo. **"Mi perfil"** navega a `app/(main)/profile`
  (ver abajo). Sin ítem "Configuración" — se quitó por no navegar a ningún lado (no existe esa
  pantalla), en vez de dejarlo como acción decorativa. Los íconos de buscar/notificaciones sí
  quedan decorativos, sin funcionalidad (tampoco la tienen en la referencia) — esos no se
  quitaron, a diferencia de "Configuración".

### "Mi perfil" — acción sobre uno mismo, no un módulo de negocio

`app/(main)/profile` — a diferencia de todo lo demás en `(main)`, **sin `RequirePermission`**
(mismo criterio que `/dashboard`, §8): no es un módulo con permiso por rol, es algo que
cualquier usuario logueado puede hacer sobre su propia cuenta. Dos tarjetas, cada una con su
propio `useMutation` (`hooks/user/use-my-profile.ts`):

- **Datos personales** (`email`/`fullName`): reusa el mismo `PATCH /users/:id` que
  `app/(main)/users` — el "id" acá es siempre el del propio usuario logueado
  (`getUserId()` de `session-storage`), no uno elegido por un admin en una tabla. `username`
  se muestra pero no se puede editar, igual que en el diálogo de edición de Usuarios — no hay
  ningún flujo para eso todavía, ni acá ni allá.
- **Cambiar contraseña**: `PATCH /users/me/password` (nuevo endpoint, exige la contraseña
  actual) — ver `docs/user/user.md` del backend para el detalle de por qué esta acción SÍ
  necesitó una ruta propia en vez de reusar algo existente.

**`username`/`fullName`/`email` arrancan del token decodificado** (mismo criterio que
`TopBar` — no hay un `GET /users/:id` para traerlos frescos de la base), pero tras guardar
"Datos personales" con éxito, se actualizan con la respuesta real del `PATCH` (un `User`
completo), no con el token — el token queda desactualizado hasta el próximo login/refresh (ver
arriba), así que sin esto la pantalla mostraría el nombre viejo justo después de guardarlo.

## 9. CRUD de Empresas — patrón para los próximos CRUD (Usuarios, Roles, Permisos)

Antes de implementarlo se auditó el CRUD de "Clientes" del proyecto de referencia (dominio →
aplicación → infraestructura → hooks → componentes bien separado, pero con problemas reales:
filtraba "eliminados" en el frontend en vez de en la query, `userId` confiado del cliente sin
derivarlo de un token validado, colores hardcodeados en SweetAlert2 que ni siquiera coinciden
con la marca). El CRUD de Empresas replica la arquitectura pero corrige esos puntos:

- **Capas**: `domain/company/*` (una interfaz por caso de uso, como la referencia — separación
  más granular que `auth`, que junta todo en un solo archivo por tener una sola operación),
  `application/company/*.use-case.impl.ts` (pass-through, mismo criterio que `LoginUseCaseImpl`),
  `infrastructure/repositories/company/company.repository.impl.ts`,
  `infrastructure/di/company.container.ts`, `hooks/company/use-companies.ts` (React Query).
- **Sin paginación en el backend, a propósito — pero es la EXCEPCIÓN, no la regla por
  defecto**: **Empresas, Roles y Permisos son los únicos 3 listados que quedan en paginación de
  cliente** (catálogos chicos, se espera un puñado por mucho tiempo — `GET /companies` trae
  todas las activas de una). **Todo lo demás debe paginar en el servidor**, sea cual sea el
  volumen esperado hoy — no es una decisión caso por caso que cada módulo nuevo repita "tiene
  pocos registros, no hace falta". `useProperties()` y `useMyInvestments()` habían copiado ese
  razonamiento por error (comentarios que decían "mismo criterio que `useCompanies`/`useRoles`")
  — ya corregido: Propiedades, Inversiones (las 3 variantes: por gestión, por inversionista,
  "mías") y Kardex paginan en el servidor con el mismo patrón que `Users` (§10). Cada uno de
  esos módulos, además, expone un hook aparte "de opciones" sin paginar (`usePropertyOptions()`,
  `useInvestorUsers()`) para los combobox que necesitan la lista completa (hasta 100
  registros) en vez de una página — paginar ahí rompería el combo, no tendría sentido elegir
  "página 2" dentro de un `<select>`.
- **Paginación 100% del lado del cliente** (`hooks/use-client-pagination.ts` +
  `components/ui/pagination.tsx`) — **solo para Empresas, Roles y Permisos**: la tabla igual no
  muestra todo de una — corta el array ya descargado (10 por página) y filtra por nombre antes
  de paginar (buscar y no encontrar nada en la página 3 sería confuso). Si un listado nuevo cree
  que "tiene pocos registros" es motivo para usar este hook en vez de paginación real de
  servidor (como `Users`), la respuesta por defecto es que no — salvo que sea uno de esos 3.
- **"Desactivar", no "eliminar"**: `Company` no tiene soft-delete, solo `isDeleted` — no hay
  columna "Estado" en la tabla porque el backend ya filtra a solo activas.
- **Pendiente: no hay forma de reactivar una empresa** — el backend solo tiene
  `deactivate()`, sin `reactivate()`. Si se desactiva una por error, hoy no hay manera de
  deshacerlo desde la app (haría falta acceso directo a la base). Falta también un filtro/vista
  para listar inactivas — recién ahí tendría sentido un botón "Reactivar" en la tabla.
- **`components/ui/page-toolbar.tsx`** (nuevo, genérico): buscador + botón "Nuevo" — reutilizar
  para Usuarios/Roles/Permisos, no reimplementar.
- **`components/ui/confirm-dialog.tsx`** (nuevo, genérico) — confirmaciones (ej. "¿Desactivar?")
  y avisos de un solo botón (ej. errores), reutilizar para Usuarios/Roles/Permisos. Se probó
  primero con SweetAlert2 (`lib/swal.ts`, con `buttonsStyling: false` + `customClass` apuntando
  a `.btn-primary`/`.btn-secondary`/`.btn-danger`) pero la librería sigue imponiendo su propia
  tipografía/alineación en el título y el texto — "parecido" nunca es "igual". Se sacó
  `sweetalert2` del proyecto: `ConfirmDialog` usa los mismos bloques que `CompanyDialog`
  (`.dialog-overlay`/`.dialog-panel`/`.dialog-footer`), así un diálogo de confirmación se ve
  exactamente igual a uno de crear/editar, garantizado por construcción, no por CSS a medida
  peleando contra los estilos propios de una librería.
- **Formularios con react-hook-form + zod**, nunca validación a mano campo por campo.
- **Colapso del sidebar, mobile y desktop con el mismo botón, sin que se pisen entre sí**:
  `useSidebar()` expone `toggle()` (el botón "Alternar menú" del `TopBar`) y `close()` (lo
  llama `MenuNode` al navegar un link, pensado solo para cerrar el cajón en mobile). Ambos
  tocan el mismo estado `isOpen`, pero `close()` es un no-op en desktop
  (`sidebar-context.tsx` chequea `window.innerWidth` contra el breakpoint `lg` de Tailwind,
  1024px, antes de cerrar) — si no, navegar un link colapsaba el sidebar también en desktop,
  donde es parte fija del layout, no un cajón (bug real, no se había notado porque "Empresas"
  fue el primer ítem del menú con un `path` real). El CSS de `sidebar.tsx` interpreta
  `isOpen` distinto según el breakpoint: en mobile (`fixed`) lo traduce a
  `translate-x-0`/`-translate-x-full` (no afecta el layout, está fuera del flujo); en desktop
  (`lg:static`, dentro del flujo) lo traduce a `lg:w-64`/`lg:w-0` para que el contenido
  reocupe el espacio en vez de dejar un hueco.

## 10. CRUD de Usuarios — mismo patrón que Empresas, con 3 diferencias reales

Mismas capas y componentes genéricos que §9 (`PageToolbar`, `ConfirmDialog`, `Pagination`,
react-hook-form + zod, `usePermission`/`RequirePermission` de §5). Lo que cambia, a propósito,
por pedido explícito ("acá sí se debe paginar en el servidor"):

- **Paginación real de servidor**, no `useClientPagination`: `hooks/user/use-users.ts` manda
  `page/pageSize/search` en la query string y usa `placeholderData: keepPreviousData` (React
  Query v5) para que cambiar de página no parpadee a "Cargando..." — sigue mostrando la página
  anterior hasta que llega la siguiente. `components/ui/pagination.tsx` no necesitó cambios: ya
  era agnóstico de dónde sale `page/total/totalPages`.
- **Búsqueda de servidor, con debounce en el frontend**: como el listado pagina en el
  servidor, un filtro que solo mirara la página ya descargada sería engañoso (buscar algo que
  está en la página 3 y no aparecer). `app/(main)/users/page.tsx` debounce-a 300ms el input
  antes de mandarlo como `search` — evita un `GET /users?search=` por tecla. El backend hace
  `ILIKE` sobre `username/email/fullName` (`UserRepositoryAdapter.findAllPaginated`).
  `httpClient.getPaginated<T>()` (nuevo en `infrastructure/http/http-client.ts`) es lo que
  faltaba para esto — antes el cliente HTTP descartaba `meta` siempre (límite documentado en
  §6, cerrado acá).
- **Diálogo de alta/edición con formularios realmente distintos**: `components/user/user-dialog.tsx`
  separa alta y edición en dos componentes internos (no un único formulario con campos
  condicionales). El alta pide `username/email/password/fullName/userTypeId/roleId` — nunca
  `companyId` (no existe "usuario sin empresa", pero la empresa es siempre la activa de la
  sesión, ver `RegisterUserUseCase` del backend). `components/ui/select.tsx` (genérico) es el
  `<select>` que ya usaba `CompanySelectDialog` a mano, extraído para no repetirlo en cada
  combo — inyecta solo una opción vacía `disabled hidden` con el texto de placeholder (así no
  aparece como un renglón más al abrir el combo), y usa `required` + `:invalid` en CSS
  (`globals.css`) para pintarla del mismo gris que `Input::placeholder` mientras no se elija
  nada. **Ningún combo del proyecto ofrece una opción explícita de "Todos"/"Todas"** (regla
  general, no algo puntual de una pantalla) — cuando un combo es un filtro opcional, dejarlo sin
  elegir ya significa "sin filtro", no hace falta un renglón aparte para decirlo (ej.
  "Propiedad" en `app/(main)/investments`, §14: sin elegir, el filtro de propiedad no se aplica).
- **`Select` con `onClear`**: como la opción placeholder es `disabled hidden`, una vez elegido
  un valor real no hay forma nativa de volver a ella desde el `<select>` abierto (no aparece en
  la lista) — un problema real para un combo que actúa como **filtro** (a diferencia de un
  campo obligatorio de alta/edición, donde nunca hace falta "deshacer" la elección). `onClear`
  (prop opcional) agrega un botón "×" que solo se muestra cuando ya hay un valor elegido —
  vuelve el combo a "sin elegir" sin reintroducir una opción "Todos"/"Todas" dentro de la
  lista. Se pasa solo en combos-filtro (ej. los tres de `app/(main)/investments`, §14); un
  campo requerido de un diálogo (`UserDialog`, `CompanyDialog`) simplemente no lo recibe.
- **La edición SÍ permite tocar `userTypeId`/`roleId`, no solo `email`/`fullName`**: son 2
  llamadas separadas del `PATCH /users/:id` genérico (`changeUserTypeUseCase`,
  `changeUserRoleUseCase` — endpoints que ya existían en el backend pero no estaban
  conectados a ninguna pantalla hasta ahora), disparadas desde el mismo submit del diálogo
  solo si el valor cambió. `hooks/user-company/use-user-role.ts` (`useUserRole(userId)`) trae
  el vínculo (`userCompanyId` + `roleId` actuales) de forma asíncrona — el formulario usa la
  opción `values` de react-hook-form (no `defaultValues`) para resincronizarse solo apenas
  llega, sin un `reset()` manual. `username` se muestra pero deshabilitado (no hay endpoint
  para cambiarlo); no hay campo de contraseña en la edición (no existe un flujo de reset
  todavía) — ninguna de las dos es una restricción de la pantalla, son features que no
  existen en el backend.
- **`UserTable` muestra "Tipo de usuario"** (nombre, no id) — resuelto contra `useUserTypes()`
  en la página, pasado como prop a la tabla.
- **`domain/user-type/*`**: solo lectura (catálogo cerrado, sin CRUD propio), existe
  únicamente para alimentar el select "Tipo de usuario". `domain/role/*` sí tiene CRUD
  completo — ver §11, `useRoles()` es lo que alimenta el select "Rol" acá.
- **`domain/user-company/*`** (nuevo, mínimo): solo `getRole`/`changeRole` — lo justo para este
  diálogo. No es un CRUD propio, es el "vínculo" que ya existía en el backend
  (`docs/user-company/user-company.md`), sin pantalla dedicada todavía.

## 11. CRUD de Roles — mismo patrón que Empresas, sin `companyId` en ningún lado

Igual que §9 (paginación de cliente, un solo campo `name`, confirmación genérica). La única
particularidad: **nunca se elige ni se manda una empresa**, ni en la URL ni en el body — todo
sale de la empresa activa de la sesión, tanto para un usuario normal (fija) como para un Super
Administrador (la que haya elegido en el `CompanySwitcher`, ver §5). Antes, tanto Roles como
Usuarios aceptaban `companyId` como parámetro libre (URL o body) — corregido en los dos al
mismo tiempo (ver `docs/role/role.md` y `docs/user/user.md` del backend).

`hooks/role/use-roles.ts` (`useRoles()`) es el único hook de lectura/escritura de roles del
proyecto — lo usa tanto `app/(main)/roles/page.tsx` (la pantalla) como el diálogo de alta de
`UserDialog` (§10, para el select "Rol"): no hay una versión "solo lectura" separada, es el
mismo hook en los dos lugares.

## 12. Permisos — no es un CRUD de lista+diálogo, es un editor de matriz

Cierra el módulo `auth`, pero con una forma distinta a §9-11 a propósito: no hay "crear/editar/
eliminar una fila" desde la UI, hay un selector de **Rol** + una grilla (`PermissionMatrix`)
con una fila por menú y una casilla por acción (Ver/Crear/Editar/Eliminar) — forzar esto al
molde de `PageToolbar` + diálogo + `ConfirmDialog` hubiera sido peor que no reusarlo.

- **`GET /menus`** (nuevo en el backend) trae el catálogo completo, plano, sin permisos de
  nadie — a diferencia de `GET /me/menu` (§5), que además anota los `can*` de quien pregunta
  (irrelevante acá: se están editando los permisos de un rol ajeno, no los propios).
  `hooks/menu/use-menu-catalog.ts` (`useMenuCatalog()`) lo consume.
- **`hooks/permission/use-role-permissions.ts`** (`useRolePermissions(roleId)`) junta ese
  catálogo con `GET /roles/:roleId/permissions` (solo las filas ya configuradas) — un menú sin
  fila propia todavía se muestra con los 4 flags en `false`, no se omite, así se puede activar
  directo desde la grilla. Solo incluye menús "reales" (`path !== null`): un padre puramente
  organizativo (ej. "Administración") no tiene ningún caso de uso de negocio detrás de sus
  permisos, nadie los lee.
- **Guardado optimista por casilla, sin botón "Guardar"**: tocar una casilla dispara
  `PUT /roles/:roleId/menus/:menuId/permissions` con los 4 flags actuales (el endpoint no
  soporta "actualizar solo uno") y actualiza el cache de React Query antes de que vuelva la
  respuesta (`onMutate`) — si el `PUT` falla, `onError` revierte el cache solo, sin que el
  usuario tenga que notar nada raro salvo el error.
- **Gateado distinto al resto**: `canView` (vía `RequirePermission`, igual que las demás)
  bloquea la pantalla entera; `canEdit` deshabilita las casillas (`readOnly`) en vez de ocultar
  una fila o un botón — `canCreate`/`canDelete` no se usan acá, no hay un concepto de "crear" o
  "eliminar" una fila de permiso desde esta UI (todo es upsert).
- **Mismo hueco de scoping por empresa que Roles, cerrado al mismo tiempo**: `UpdateRoleUseCase`,
  `DeactivateRoleUseCase`, `SetRoleMenuPermissionUseCase` y `ListPermissionsByRoleUseCase` del
  backend no validaban que el rol fuera de la empresa activa — cualquiera con sesión podía
  tocar permisos de un rol ajeno adivinando su id. Corregido junto con esta pantalla (ver
  `docs/permission/permission.md` del backend).

## 13. Propiedades — primer módulo del negocio ganadero, con selector de mapa

Cierra el módulo `auth` y arranca el negocio en sí (fincas, inversiones, kardex — ver
`docs/property/property.md` y `docs/investment/investment.md` del backend). Mismo patrón que
Empresas (confirmación genérica), con un campo nuevo (ubicación) y una diferencia real:
**paginación de servidor**, no de cliente (§8/§9) — `useProperties(page, pageSize, search)`
para la pantalla CRUD, con debounce de 300ms en el buscador (mismo patrón que `Users`, §10).
Los combobox de Propiedad en Inversiones/Kardex no usan ese hook — usan
`usePropertyOptions()` (hasta 100 registros de una, sin paginar), porque un combo no puede
"pasar de página".

- **`components/property/location-map-picker.tsx`** — Leaflet + OpenStreetMap, **sin API key
  ni cuenta de Google** (decisión explícita del usuario, ver el hilo de diseño): clic en el
  mapa mueve el marcador y reporta lat/lng. "Ver en Google Maps" (tabla y diálogo) es solo un
  link (`google.com/maps?q=lat,lng`), nunca un embed de Google. Mapa de 520px de alto (antes
  260px) con zoom inicial 15 (antes 13, casi a nivel de calle), y `PropertyDialog` ensancha el
  panel a `64rem` (el resto de los diálogos usa el `max-w-md` por defecto de `.dialog-panel`,
  28rem) — el usuario encontró que la versión chica no daba suficiente precisión para marcar la
  ubicación con el mouse.
- **`next/dynamic` con `ssr: false`** en `PropertyDialog` para cargar el mapa — `leaflet` toca
  `window` al cargar el módulo (no solo al renderizar), lo que rompe el bundle de servidor de
  Next aunque el diálogo nunca se renderice de verdad ahí (problema clásico y documentado de
  Leaflet + Next.js).
- **Nunca leer un `ref.current` durante el render** (`react-hooks/refs` de React 19/Compiler lo
  marca como error): `LocationMapPicker` guarda el centro inicial del mapa con `useState`
  perezoso, no `useRef` — un ref es para leer *fuera* del render (handlers/efectos), un estado
  sí puede leerse durante el render.

## 14. Inversiones + Kardex — pantallas hermanas, cada una con su propio permiso

- **`app/(main)/investments`**: tres filtros, **ninguno con una opción "Todos"/"Todas"** (regla
  general de todo el proyecto, ver arriba), **y los tres son formas independientes de disparar
  la consulta** — cualquiera de los tres alcanza por sí solo, ninguno depende de los otros dos.
  `activeMode` (`'gestion' | 'investor' | 'property' | null`) decide cuál de los tres hooks
  (`useInvestmentsByGestion`/`useInvestmentsByInvestor`/`useInvestmentsByProperty`, los tres
  paginados en el servidor, §8/§9) provee los datos y las mutaciones (create/update/deactivate)
  que realmente se usan — sin ninguno de los tres elegido, la tabla ni se pide. La prioridad
  (Gestión > Inversionista > Propiedad, en ese orden) solo decide cuál dispara la consulta
  cuando hay más de uno elegido a la vez — los otros dos, ahí, viajan como parámetro extra de
  esa misma consulta de servidor (ej. con "Gestión" elegida, "Inversionista" viaja como
  `investorUserId` — sirve para "inversiones de tal inversionista en tal gestión"), nunca como
  `.filter()` sobre la página ya traída: con paginación real, filtrar solo lo ya descargado daría
  resultados incompletos o directamente vacíos si el match está en otra página. Cada uno de los
  tres `Select` recibe `onClear` (ver arriba) para poder volver a "sin elegir" y dejar de aplicar
  ese filtro — antes de esto, una vez elegido un valor no había forma de deshacerlo desde el
  combo (la opción placeholder es `disabled hidden`), y "Propiedad" sola no disparaba nada
  (**corregido** — antes solo Gestión/Inversionista podían ser el modo activo). Cambiar
  cualquiera de los tres filtros resetea la página a 1
  (`handleGestionChange`/`handlePropertyChange`/`handleInvestorChange`) — quedarse en, digamos,
  la página 3 de un resultado que ahora tiene 1 sola página mostraría la tabla vacía con un
  `<Pagination>` roto. Como la tabla puede mostrar
  inversiones de varias propiedades a la vez, `InvestmentTable` agrega la columna "Propiedad" —
  y por eso también necesita su propio `style={{ minWidth: '64rem' }}` en el `<table>` (mismo
  patrón que `KardexTable`), en vez de conformarse con el `min-width: 40rem` genérico de
  `.data-table`: con 6 columnas (una más que antes) y una de ellas con una lista de nombres sin
  `nowrap`, 40rem ya no alcanzaba — el navegador comprimía/envolvía el texto de las celdas en
  vez de dejar que `.data-table-wrapper` hiciera scroll horizontal.
- **La fila de filtros usa `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, no
  `flex flex-wrap` + `max-w-xs w-full` por combo** (que sí alcanza en pantallas con 1-2 filtros,
  como Permisos o el `investments` original) — con 3 filtros, ese patrón dejaba cada combo fijo
  en 320px (`max-w-xs`) sin importar cuánto sobrara al lado, un hueco vacío bien visible en
  anchos intermedios (ni tan angosto como para apilar 1 por fila, ni tan ancho como para que 3
  de 320px llenaran la fila). Con la grilla, cada combo ocupa el 100% de su columna en cualquier
  ancho — verificado con Playwright (viewport angosto, contra una copia efímera del frontend)
  en los mismos anchos exactos que reportó el usuario (894px, 636px, 390px): sin hueco en
  ninguno de los tres.
  "Nueva inversión" es **siempre visible cuando `canCreate`**, sin importar `activeMode` ni
  ningún filtro elegido — vive en su propia fila arriba de los 3 combos, no dentro de
  `PageToolbar` (que ahí solo se usa para el buscador, sin `onNew`). `InvestmentDialog` tiene su
  **propio** combobox de "Propiedad" (además de "Gestión" y el checklist de Inversionistas) —
  ahí es donde de verdad se elige a qué propiedad va la inversión nueva, no en el filtro de la
  página — pero si la página ya tiene una Propiedad elegida en su filtro, ese valor se precarga
  en el combo del diálogo (`defaultPropertyId`, prop nueva de `InvestmentDialog`) para no
  hacer elegir la misma propiedad dos veces — sigue siendo editable, no un valor fijo. **Al
  editar, el mismo combo también es editable** — a diferencia de otros campos "de identidad"
  del proyecto (`username` en `UserDialog`), no hay ninguna regla de negocio que impida "mudar"
  una inversión a otra propiedad de la misma empresa; `UpdateInvestmentUseCase` (backend) valida
  que la propiedad nueva sea de la empresa activa, mismo chequeo que al crear. Los
  inversionistas salen de `useInvestorUsers()` (filtra por tipo de usuario del lado del cliente
  — trae hasta 100 usuarios de la empresa activa y se queda con los de tipo Inversionista; si
  una empresa llega a tener más que eso hay que pasar esto a un filtro real de servidor, no está
  hecho todavía).
  **Iteración previa, descartada**: el combo de Propiedad se deshabilitaba al editar (mismo
  criterio que `username` en `UserDialog`) — el usuario aclaró que sí se puede/debe poder
  cambiar la propiedad de una inversión ya creada, a diferencia de un identificador de login.
  **Iteración previa, descartada**: el botón dependía de que la página ya tuviera una Propiedad
  elegida en su combo de filtro (`onNew={canCreate && propertyId ? ... : undefined}`) — el
  usuario señaló que no tenía sentido: con los tres filtros pudiendo estar vacíos a la vez (ver
  arriba), el botón desaparecía sin ningún motivo real para crear una inversión nueva.
  **Iteración previa, descartada**: "Propiedad" era el único filtro y el que disparaba la
  consulta (`GET /investments?propertyId=`, que sigue existiendo — lo usa el atajo "Ver kardex"
  de la tabla) — el usuario pidió primero agregar "Gestión" como filtro adicional, después
  aclaró que en realidad quería invertir los roles del todo.
- **`app/(main)/kardex`**: pantalla propia del sidebar, hermana de Propiedades e Inversiones
  bajo el grupo "Inversiones" — **no** un drill-down por ruta dinámica. Usa `menuKey="kardex"`,
  distinto de `"investments"`, con sus 4 flags de permiso independientes (permite dar "puede
  crear inversiones pero no tocar el kardex", o al revés, a un rol — ver `docs/menu/menu.md`
  del backend).
  **Iteración previa, descartada**: se probó primero un menú `kardex` invisible
  (`showInSidebar: false`, colgado de `investments`, alcanzable solo por un botón en la tabla de
  Inversiones) — el usuario aclaró que necesitaba que fuera una pantalla real del sidebar,
  porque un rol sin acceso a Inversiones no tenía ninguna forma de *llegar* a ese botón.
- **"Mis inversiones" (lista, no combobox) reemplazó al selector de Propiedad**: sin ninguna
  inversión elegida, `useMyInvestments()` (`GET /investments/mine`, `userId` siempre de la
  sesión) trae las inversiones donde el usuario logueado es inversionista, de cualquier
  propiedad, y se muestran como filas clickeables de una tabla — clic en una entra a su kardex.
  El botón "Ver kardex" de la tabla de Inversiones (`InvestmentTable`, prop `canViewKardex`
  separada de `canEdit`/`canDelete`) sigue navegando a `/kardex?propertyId=&investmentId=`, como
  atajo para quien administra inversiones pero no es necesariamente inversionista de ninguna —
  esa combinación se resuelve con un segundo hook, `useInvestments(shortcutPropertyId)`, en
  paralelo a `useMyInvestments()`; cuál de los dos resolvió la inversión elegida es invisible
  para el resto de la pantalla (`selectedInvestment` prueba una lista y después la otra).
  **Iteración previa, descartada**: se probó primero elegir "Propiedad" y luego "Inversión" con
  dos combobox (mismo patrón que `investments`) — el usuario aclaró que el primer filtro debía
  ser directamente las inversiones del usuario logueado, no una propiedad.
- **Dos tablas, dos paginaciones de servidor independientes, mismo patrón que `Users` (§10)**:
  "Mis inversiones" (`useMyInvestments(page, pageSize)`, `MY_INVESTMENTS_PAGE_SIZE = 10`) y,
  una vez elegida una inversión, la tabla de movimientos del kardex
  (`useKardexEntries(investmentId, page, pageSize, search)`, `ENTRIES_PAGE_SIZE = 20`, búsqueda
  server-side por `detail` con el mismo debounce de 300ms que `Properties`/`Users`) — cada una
  con su propio estado de página (`myInvestmentsPage`/`entriesPage`) y su propio
  `<Pagination>`, porque son listados independientes en la misma pantalla, no una tabla adentro
  de la otra.
- **Llegar a `/kardex` por el atajo de Inversiones no debe "sacarte" de Inversiones**: aunque la
  URL cambia a `/kardex`, el botón de "Volver" dice **"Volver a Inversiones"** (no "Volver a Mis
  inversiones") y navega a `/investments` — y el sidebar sigue resaltando el ítem "Inversiones",
  no "Kardex". La señal para distinguir los dos orígenes es la presencia de `propertyId` en la
  URL (`shortcutPropertyId` en `kardex/page.tsx`, `searchParams.has('propertyId')` en
  `sidebar.tsx`) — entrando directo desde el ítem "Kardex" del sidebar no hay `propertyId`, así
  que ahí sí se resalta "Kardex" y el botón dice "Volver a Mis inversiones", normal.
  **Caso especial reconocido a propósito**: `sidebar.tsx` es genérico (recorre el árbol que
  manda el backend sin conocer claves puntuales, salvo para el ícono — `menu-icon.tsx` ya rompe
  esa genericidad de la misma forma) — acá también hardcodea `node.key === 'investments'`/
  `'kardex'` para esta única excepción, comentado en el código como tal.
- **"Volver a Inversiones" reconstruye los filtros que estaban activos, no solo la ruta**:
  `investments/page.tsx` inicializa `gestion`/`propertyId` leyendo `useSearchParams()` (lazy
  init, mismo patrón que `kardex/page.tsx`), y "Ver kardex" manda esos mismos valores en la URL
  de destino (`/kardex?propertyId=&investmentId=&gestion=`) — `shortcutGestion` en
  `kardex/page.tsx` no se usa para nada más que devolverlo tal cual al armar el link de "Volver".
  Sin esto, volver a `/investments` remonta el componente de cero y los combos se ven vacíos —
  un `router.push` entre rutas distintas no preserva el `useState` local de la pantalla anterior,
  aunque conceptualmente sea "la misma pantalla de la que veniamos".
- **Al revés: cambiar el query string de la MISMA ruta NO remonta el componente**, y por eso
  `KardexPage`/`InvestmentsPage` (los `export default`, no el `...Content` de adentro) le pasan
  `key={searchParams.toString()}` a su respectivo `...PageContent`. Sin esto: entrar a
  `/kardex?propertyId=&investmentId=&gestion=` (atajo) y después hacer clic directo en el ítem
  "Kardex" del sidebar (`/kardex`, sin query params) deja la pantalla mostrando lo mismo de
  antes — Next trata ambas URLs como la misma página y solo re-renderiza, no remonta, así que
  los `useState(() => searchParams.get(...))` con inicialización perezosa nunca vuelven a leer
  la URL nueva. La `key` fuerza un remount real cada vez que cambia el query string de esa ruta,
  reseteando todo el estado local — mismo mecanismo que usa React para "reiniciar" un formulario
  al cambiar de ítem (ver `dialog.sessionId` en los diálogos de alta/edición, §9).
- **"Inversiones" es ahora también el nombre del grupo del sidebar** (`investment-management`)
  que contiene a "Propiedades", "Inversiones" y "Kardex" — mismo patrón que "Administración"
  agrupando Empresas/Usuarios/Roles/Permisos (§9-§12). La repetición del nombre (grupo e ítem
  con el mismo label "Inversiones") es intencional, a pedido del usuario.
- **El campo `order` de un menú es también el orden global de la tabla de Permisos**, no solo
  el orden entre hermanos (`use-role-permissions.ts` ordena el catálogo plano por `order` sin
  agrupar por `parentId`) — un error real de esta sesión: se le puso a `kardex` un `order`
  pensado como "único hijo de investments" (`1`), que chocaba con "Empresas" (también `1`) y lo
  hacía aparecer salteado en esa pantalla. Al agregar un menú nuevo, elegir un `order` único en
  el catálogo completo, no solo entre sus hermanos.
- **`KardexTable`/`KardexEntryDialog`** calcan la planilla de referencia: la tabla agrupa
  Entrada/Salida/Saldo con sus columnas Cantidad/Kilos, igual que el diálogo (de a pares, en
  vez de una columna larga de 10 campos sueltos).
- **`formatDateOnly`, no `formatDate`, para `entryDate`**: `entryDate` es una fecha pura
  (`YYYY-MM-DD`, sin hora) — pasarla por `formatDate` (que hace `new Date(...)`) la interpreta
  como medianoche UTC, y en un huso horario negativo (Bolivia, UTC-4) se lee un día antes.
  `formatDateOnly` (`lib/format-date.ts`) parsea el string directo, sin ningún `Date` de por
  medio — verificado en vivo (17/3/2025 se mostró como `17/03/2025`, no `16/03/2025`).

## 15. Dashboard — distinto por tipo de usuario, no un módulo de negocio más

`app/(main)/dashboard` es el destino fijo del login (`use-login.ts`) y el fallback de
`RequirePermission` — por eso, a diferencia de todo lo demás en `(main)`, **sin
`RequirePermission`** (mismo criterio que `/profile`, §8): tiene que mostrar algo para
cualquiera con sesión, sea cual sea su rol.

- **`useIsInvestor()`** (`hooks/menu/use-is-investor.ts`, nuevo — mismo patrón exacto que
  `useIsSuperAdmin()`: lee `isInvestor` del token decodificado, `useState` perezoso sin efecto)
  decide cuál de dos sub-componentes renderiza la página: `InvestorDashboard` o
  `AdminDashboard`. Ambos viven en el mismo `page.tsx`, no en archivos separados — es la misma
  pantalla con dos contenidos posibles, no dos rutas.
- **`InvestorDashboard`**: 2 tarjetas KPI (inversiones activas, total recibido en ventas) +
  tabla "Mis inversiones" (`useInvestorDashboard()`, `GET /dashboard/investor-summary`).
- **`AdminDashboard`**: 4 tarjetas KPI + "Top inversionistas" + tabla "Últimos movimientos"
  (`useAdminDashboard()`, `GET /dashboard/admin-summary`) — agregados de la empresa activa,
  igual criterio que el resto de la app (nunca de todas las empresas, ni para un Super
  Administrador).
- **Ninguna tarjeta usa `KardexEntry.total` sin acotar a `movementType === 'venta'`** — ese
  campo no tiene una fórmula definida todavía (ver `docs/investment/investment.md` del
  backend), así que no hay "capital invertido" ni "ganancia" en ningún lado, solo "total
  recibido/registrado en ventas" (el único cálculo de dinero con significado real hoy) y
  conteos simples. Ver `docs/dashboard/dashboard.md` del backend para el detalle completo.
- **"Top inversionistas" y "Últimos movimientos" van apiladas, no lado a lado
  (`grid-cols-2`)**: la tabla de movimientos tiene 4 columnas (fecha, propiedad/inversión,
  detalle, total) — a la mitad del ancho, la columna "Total" quedaba fuera de la vista sin
  scrollear (verificado con Playwright contra una copia efímera del frontend).
- **Reemplaza al dashboard con datos 100% hardcodeados** (`mockMeses`,
  `mockTopInversionistas`, `mockLotesEnAlerta`) que no llamaba a ningún endpoint — se mantuvo
  el mismo lenguaje visual de tarjetas KPI para las nuevas, con datos reales.
