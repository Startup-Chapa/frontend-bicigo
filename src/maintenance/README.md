# Maintenance

Este contexto sigue domain/model, infrastructure (BaseApi, BaseEndpoint y assembler),
application (Pinia) y presentation (componentes, vistas y rutas). En develop se integra
con IAM, Billing y Trip mediante el router y el layout compartidos.

## Probar

1. `npm install`.
2. Ejecutar `npm run dev:api` y `npm run dev` en terminales separadas.
3. Iniciar sesión, abrir `/#/maintenance/report` y pulsar **Probar demostración**.
4. Crear un reporte. La cuenta `operador@bicigo.test` puede abrir `/#/maintenance/management`.
5. Cambiar AVAILABLE → MAINTENANCE → AVAILABLE mediante la confirmación.

La demostración requiere activación explícita en cada recarga de la aplicación; los
reportes persisten en localStorage bajo `bicigo_maintenance_demo_v1`. No hay solicitudes
HTTP ni fallback automático. No hay bicicletas reales verificadas en la demostración.
Los datos empiezan vacíos, no se incluyen reportes ficticios precargados. Datos corruptos
o almacenamiento bloqueado producen errores y nunca se presentan como envío exitoso.

## Contrato pendiente

No se encontró evidencia de endpoints de Maintenance en las ramas indicadas, ni del
endpoint candidato `PATCH /api/admin/bikes/{bikeId}/status`. No se llama a esa ruta.
Hay que confirmar listado/creación de reportes, actualización de estado de bicicleta,
payloads, tipos de problema, estados reales, paginación, errores y reglas de autorización.

`MaintenanceApi` extiende `BaseApi` y solo construye `BaseEndpoint` cuando recibe un
`reportsPath` confirmado. El cambio de estado se integra con un `statusTransport`
que recibe el cliente HTTP compartido, bikeId, nuevo estado y estado esperado.
El singleton no configura ninguna ruta remota. Adaptar el assembler al contrato real
antes de habilitar producción; el modelo actual es un contrato interno del frontend.
La URL base compartida usa `VITE_BICIGO_API_URL` y mantiene `VITE_LEARNING_PLATFORM_API_URL`
como alternativa para compatibilidad con Billing y Trip.

`status` representa disponibilidad de bicicleta, no resolución de incidente. Todos
los reportes de la misma bicicleta comparten el estado; la transición no borra reportes.
En la simulación un reporte nuevo usa AVAILABLE si esa bicicleta no tiene otro reporte.
Este valor no constituye una regla de negocio del backend ni verifica disponibilidad real.

El guard compartido reutiliza IAM: requiere sesión y restringe `meta.audience` a
ADMIN/OPERATOR. Los roles y cuentas del servidor local son de demostración; el control
del frontend no sustituye la autorización de un backend real. Trip abre el reporte
con `bikeId` en la query. Cambiar de usuario limpia los stores de la sesión anterior.

## Verificación

`npm run build` y `node --test tests/maintenance.test.js`.
`node tests/maintenance.browser.mjs` verifica el build en Edge/Chrome headless sin
instalar dependencias de pruebas. Se puede especificar `MAINTENANCE_BROWSER_PATH`.
Comprueba las vistas a 1440, 768 y 390 px y los flujos entre contextos, navegación,
idioma, validación, persistencia, cancelación, transiciones y errores. Requiere puerto
3000 libre y usa JSON-server en memoria; no cambia server/db.json. Guarda capturas
y un perfil aislado en el temporal.
No existen scripts npm de lint ni test en esta rama.

Paleta: Billing (`#84cc16`, `#2f3b2f`, `#f8faf5`, `#1f2937`, `#6b7280`),
tokens y convenciones de formularios/feedback de IAM. Layout, selector de idioma y footer
compartidos adaptados desde el esqueleto ACME. PrimeVue se registra para los controles
existentes de IAM, Billing y Trip; Maintenance conserva sus controles nativos.
