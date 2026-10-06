# BiciGO - integración final

En este README dejamos cómo levantar el proyecto completo de BiciGO en local y qué partes están funcionando por ahora.

El frontend está hecho con Vue + Vite. También estamos usando Pinia, i18n, un router principal y un cliente HTTP compartido entre los módulos.

Las ramas originales de cada parte siguen existiendo. Para poder probar todo junto, se integraron los módulos en `integration/bicigo-final`, conservando IAM de `origin/develop`.

Las fuentes remotas se actualizaron con `git fetch origin`. Se integraron archivos por contexto, sin merge, rebase ni cherry-pick de commits completos. `backup/bicigo-integration` sirvió como referencia para la API local, documentación, pruebas y conexiones entre módulos; los archivos globales se combinaron sobre la base actual de IAM.

---

## Cómo levantar el proyecto

Primero instalamos las dependencias:

```powershell
npm install
```

Luego levantamos la API local:

```powershell
npm run dev:api
```

En otra terminal levantamos el frontend:

```powershell
npm run dev -- --host 127.0.0.1
```

Después entramos desde el navegador a:

```text
http://127.0.0.1:5173/
```

La API local queda corriendo en:

```text
http://127.0.0.1:3000/api/v1
```

---

## Usuarios para probar

Por ahora tenemos estas cuentas de prueba:

| Usuario | Contraseña | Acceso |
| --- | --- | --- |
| usuario@bicigo.test | BiciGO123! | Perfil, viajes, planes y reportes |
| operador@bicigo.test | BiciGO123! | Lo mismo + gestión de mantenimiento |

Estas cuentas son solamente para trabajar y probar el proyecto en local.

IAM todavía trabaja con JSON Server y una sesión simulada, así que no es todavía la autenticación real del backend.

Los roles también son parte de esta demo y se usan para mostrar u ocultar ciertas opciones dependiendo del usuario.

La contraseña no se guarda dentro de la sesión de `localStorage`.

---

## Módulos que tenemos integrados

| Módulo | Rama | Estado |
| --- | --- | --- |
| IAM | `origin/develop` | Login, registro, perfil y sesión |
| Billing | `feature/billing-subscriptions` | Planes y compra simulada |
| Trip | `origin/feature/trip-management` | Viajes del usuario |
| Maintenance | `feature/maintenance` | Reportes y gestión de mantenimiento |
| Fleet | `feature/fleet-station-management` | Estaciones y bicicletas: consulta, alta, edición y operaciones de flota |

---

## IAM

IAM se encarga principalmente del login, registro, perfil y sesión del usuario.

También tiene una recuperación de contraseña de prueba.

Por ahora todo esto funciona en modo local para poder probar los demás módulos sin depender todavía del backend final.

---

## Billing

Billing permite ver los planes disponibles y simular la compra de una suscripción.

Cuando el usuario compra un plan, también se intenta actualizar su plan dentro de IAM.

Si esa actualización falla, se puede volver a intentar sin tener que repetir toda la compra.

El plan actual también aparece en el dashboard y en la sección de planes.

---

## Trip

Trip muestra los viajes que hizo el usuario.

Desde un viaje también se puede ir directamente a Maintenance para reportar algún problema con la bicicleta que se usó.

Los viajes se están cargando desde la API local.

---

## Maintenance

Maintenance es la parte donde se pueden reportar problemas de las bicicletas.

El usuario puede indicar:

- qué bicicleta tuvo el problema;
- qué tipo de problema encontró;
- una pequeña descripción de lo que pasó.

También tenemos una parte de gestión para revisar los reportes y cambiar el estado de las bicicletas.

Por ejemplo, una bicicleta puede pasar de:

```text
AVAILABLE -> MAINTENANCE
```

y cuando ya está reparada:

```text
MAINTENANCE -> AVAILABLE
```

Por ahora todavía no tenemos confirmado el contrato final de Maintenance con el backend.

Para poder seguir avanzando y probarlo igual, se hizo un modo demo usando `localStorage`.

Eso permite que los reportes no se pierdan cuando se recarga la página.

También, si una bicicleta tiene varios reportes, cuando se cambia su estado se actualizan los reportes relacionados.

Para más detalle revisar:

```text
src/maintenance/README.md
```

---

## Fleet

Fleet integra el store, cliente HTTP, modelos y vistas de la versión más reciente de `origin/feature/fleet-station-management`.

Permite consultar, crear y editar estaciones y bicicletas, asignar bicicletas a estaciones y cambiar sus estados. La API local incluye las colecciones `/bike-points` y `/bicycles` con datos de demostración.

---

## Rutas principales

### Login y registro

```text
/#/auth/login
/#/auth/register
/#/auth/forgot
```

### Aplicación

```text
/#/app/dashboard
/#/app/profile
/#/app/trips
```

También se mantiene esta ruta:

```text
/#/trips
```

como alternativa.

### Billing

```text
/#/billing/plans
/#/billing/subscribe
/#/billing/success
/#/iam/register/plan
```

### Maintenance

```text
/#/maintenance/report
/#/maintenance/management
```

### Fleet

```text
/#/fleet/bike-points
```

Para entrar a las rutas internas hay que tener una sesión iniciada.

La parte de gestión de Maintenance está pensada para usuarios con rol:

```text
ADMIN
OPERATOR
```

También dejo algunas rutas antiguas como redirecciones para no romper partes que todavía las estaban usando.

---

## Configuración

Para trabajar en local estamos usando:

```text
.env
.env.development
```

La URL principal de la API se obtiene de:

```text
VITE_BICIGO_API_URL
```

También importante se mantiene:

```text
VITE_LEARNING_PLATFORM_API_URL
```

porque todavía hay algunas partes anteriores del proyecto que pueden usar esa variable asi que por las moscas.

---

## Pruebas

Para revisar que el proyecto compile sin problemas:

```powershell
npm run build
```

Para correr las pruebas:

```powershell
node --test tests/maintenance.test.js tests/integration.test.js
```

También tenemos una prueba de navegador:

```powershell
node tests/maintenance.browser.mjs
```

Para esa prueba hay que tener Edge o Chrome instalado y el puerto `3000` libre.

Las pruebas revisan principalmente:

- login;
- registro;
- perfil;
- sesión;
- roles;
- viajes;
- conexión entre Trip y Maintenance;
- conexión entre Billing e IAM;
- cambios de estado en Maintenance;
- idiomas;
- responsive en desktop, tablet y mobile.

---

## Cosas que todavía faltan

Todavía nos quedan varias cosas para tener el proyecto completo con backend real:

- autenticación y autorización real;
- contrato final de Maintenance;
- conectar Fleet con el backend de producción;
- pasarela de pagos;
- recuperación real de contraseña;
- OAuth.

Por ahora la idea es tener todos los módulos funcionando juntos en local y después ir reemplazando las partes simuladas cuando tengamos los contratos definitivos del backend.
