# Shipping App — ZapasYa

Aplicación Shipping del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `DevSquad`.
Esta app corresponde al módulo de envíos y logística en el proyecto de tipo C (Marketplace).
Enunciado completo: https://iaw-2026.github.io/proyecto/

🔗 **Deploy:** https://proyecto-c-shipping-dev-squad.vercel.app/

---

## Descripción

App encargada del seguimiento y registro de envíos del marketplace ZapasYa. Cuando llega la confirmación de un pedido, se genera el envío y se registran los datos del mismo. A partir de ese punto, el cliente puede ir siguiendo el estado del pedido a medida que este evoluciona.

Los operadores logísticos y administradores pueden actualizar el estado a medida que avanza el envío, o registrar novedades sin cambiar el estado general. Cuando se confirma la entrega, se dispara una notificación automática a la app de buyers para que pueda seguir con su flujo.

El administrador tiene además acceso a un panel de estadísticas sobre los pedidos (cantidad recibida, distribución por estado y localidad de destino, entre otros), con posibilidad de filtrar entre los últimos 7 días o el mes completo.

---

## Usuarios de prueba

Todos los usuarios usan la contraseña: `iawuser#` y cumplen lo pedido por la catedra en cuanto al correo

### Cliente
Ve sus envíos, estados, contenido y historial de seguimiento.

| Usuario | Email |
|---|---|
| Cliente 1 | cliente1+clerk_test@iaw.com |
| Cliente 2 | cliente2+clerk_test@iaw.com |

### Operador Logístico
Ve todos los envíos del sistema y puede modificar su estado o agregar comentarios.

| Usuario | Email |
|---|---|
| Operador | oplogistico+clerk_test@iaw.com |

### Administrador
Dashboard con estadísticas de envíos por mes (últimos 7 días). También puede ver todos los envíos como cliente y editarlos como operador logístico.

| Usuario | Email |
|---|---|
| Administrador | admin+clerk_test@iaw.com |

---

## Stack tecnológico
- Next.js
- React
- TypeScript
- Prisma + PostgreSQL
- Clerk (autenticación y roles)
- Tailwind CSS
- Vercel (deploy)

---

## Simulación de webhook de entrega

Para simular la notificación a la app de buyers cuando un envío es entregado:

1. Entrá a [webhook.site](https://webhook.site) y copiá la URL que te genera
2. Pegala en el `.env` local:
   ```
   DELIVERY_WEBHOOK_URL=https://webhook.site/tu-url-aqui
   ```
3. Para hacer el PATCH a la API podés usar **Thunder Client** (extensión de VS Code):

   - Abrís la pestaña de Thunder Client en VS Code (ícono del rayo en la barra lateral)
   - Clickeás **New Request**
   - Cambiás el método a `PATCH`
   - Pegás la URL: `https://proyecto-c-shipping-dev-squad.vercel.app/api/shipments/5` (reemplazando el `5` por el número de orden que quieras marcar como entregado)
   - Vas a la pestaña **Body** → seleccionás **JSON**
   - Pegás el body:
   ```json
   {
     "status": "DELIVERED",
     "description": "Envío entregado al destinatario"
   }
   ```
   - Le das a **Send**

4. En webhook.site vas a ver la notificación llegar con un payload similar a:
   ```json
   {
     "event": "shipment.delivered",
     "orderId": 123,
     "buyerId": "user_abc123",
     "deliveredAt": "2026-05-28T22:25:30.828Z"
   }
   ```
   > Los valores de `orderId` y `buyerId` van a corresponder al envío que hayas actualizado.

> En producción, `DELIVERY_WEBHOOK_URL` debe apuntar al endpoint real de la app de buyers.

---

## Fortalezas

   - El panel de estadísticas del administrador ofrece una vista clara de la operación: cantidad de envíos recibidos, distribución por estado y por localidad de destino, con la posibilidad de filtrar entre los últimos 7 días o el mes completo. Es útil para detectar cuellos de botella logísticos de un vistazo.

   - El flujo de estados está restringido para evitar errores operativos: no es posible saltar pasos (por ejemplo, pasar directamente de Pendiente a Entregado). Cada estado solo habilita el siguiente en la cadena, lo que reduce la posibilidad de registros incorrectos.

   - La interfaz es completamente responsive y funciona tanto en desktop como en mobile, con adaptaciones específicas de layout para pantallas chicas. El soporte de modo oscuro y claro está implementado a nivel de variables CSS, sin dependencia de librerías externas de theming.

---

## Debilidades

No implementamos la funcionalidad de cancelar un pedido. En el estado actual, una vez generado el envío, el flujo solo avanza hacia adelante. Esto es algo que se contempla para una etapa futura, idealmente coordinado con las apps de pagos y sellers para manejar correctamente el estado global del pedido.

---

## Issue conocido

Al actualizar el estado de un pedido y luego navegar hacia atrás con las flechas del navegador, la vista puede mostrar el estado anterior al cambio. Se recomienda usar las flechas propias de la app (el botón "← Volver") en lugar de los controles del navegador.

---

## Observaciones

- La asignación de roles se hace mediante `publicMetadata.role` en Clerk.
- En algunos teléfonos con modo oscuro activado a nivel sistema, el toggle de tema claro puede no funcionar correctamente. Es una limitación de ciertos navegadores móviles que fuerzan el esquema de color del sistema, no un bug de la app.