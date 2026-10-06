# Maintenance

Este contexto sigue domain/model, infrastructure (BaseApi, BaseEndpoint y assembler),
application (Pinia) y presentation (componentes, vistas y rutas). Referencias inspeccionadas
sin integrar ramas: IAM, Billing & Subscriptions, Fleet & Station Management y main/Trip.

## Probar

1. `npm install --package-lock=false` (el lockfile local previo se conserva).
2. `npm run dev`.
3. Abrir `/#/maintenance/report` y pulsar **Probar demostración**.
4. Crear un reporte y abrir `/#/maintenance/management`.
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
La URL base compartida usa `VITE_LEARNING_PLATFORM_API_URL`, según el código existente.

`status` representa disponibilidad de bicicleta, no resolución de incidente. Todos
los reportes de la misma bicicleta comparten el estado; la transición no borra reportes.
En la simulación un reporte nuevo usa AVAILABLE si esa bicicleta no tiene otro reporte.
Este valor no constituye una regla de negocio del backend ni verifica disponibilidad real.

La rama no contiene IAM operativo. `meta.audience` documenta ADMIN/OPERATOR, pero no es
un control de acceso. Integrar el guard real de IAM y la autorización del backend antes
de habilitar operaciones sobre bicicletas reales. No se implementó autenticación nueva.

## Verificación

`npm run build` y `node --test tests/maintenance.test.js`.
`node tests/maintenance.browser.mjs` verifica el build en Edge/Chrome headless sin
instalar dependencias de pruebas. Se puede especificar `MAINTENANCE_BROWSER_PATH`.
Comprueba ambas vistas a 1440, 768 y 390 px, navegación, idioma, validación, persistencia,
cancelación, transiciones y errores; guarda capturas y un perfil aislado en el temporal.
No existen scripts npm de lint ni test en esta rama.

Paleta: Billing (`#84cc16`, `#2f3b2f`, `#f8faf5`, `#1f2937`, `#6b7280`),
tokens y convenciones de formularios/feedback de IAM. Layout, selector de idioma y footer
compartidos adaptados desde el esqueleto ACME sin dependencias adicionales de PrimeVue.
No se modificaron archivos de IAM, Billing, Fleet ni Trip.
