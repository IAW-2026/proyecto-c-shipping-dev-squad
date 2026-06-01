# Shipping App — ZapasYa

Aplicación Shipping del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `DevSquad`.
Esta app corresponde al módulo de envíos y logística en el proyecto de tipo C (Marketplace).
Enunciado completo: https://iaw-2026.github.io/proyecto/

App encargada del seguimiento y registro de envíos del marketplace ZapasYa. Cuando llega la confirmación de un pedido, se genera el envío y se registran los datos del mismo. A partir de ese punto, el cliente puede ver el estado de su pedido en tiempo real. Los operadores logísticos y administradores pueden ir actualizando el estado a medida que avanza. Cuando se confirma la entrega, se le manda una notificación automática a la app de buyers para que pueda seguir con su flujo.
Sumado a lo dicho antes, el administrador tiene acceso a un panel de estadisticas sobre los pedidos(pedidos recibidos, distribucion por estado y localidad de destino, etc) de manera mensual o solo los ultimos 7 dias

🔗 **Deploy:** https://proyecto-c-shipping-dev-squad.vercel.app/

---

## Acceso por tipo de usuario

Todos los usuarios usan la contraseña: `IAW2026A`

### Cliente
Ve sus envíos, estados, contenido y historial de seguimiento.

| Usuario | Email |
|---|---|
| Cliente 1 | clienteiaw1@gmail.com |
| Cliente 2 | clienteiaw2@gmail.com |

### Operador Logístico
Ve todos los envíos del sistema y puede modificar su estado o agregar comentarios.

| Usuario | Email |
|---|---|
| Operador | oplogiaw@hotmail.com |

### Administrador
Dashboard con estadísticas de envíos por mes (últimos 7 días). También puede ver todos los envíos como cliente y editarlos como operador logístico.

| Usuario | Email |
|---|---|
| Administrador | adiaw1@hotmail.com |

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

4. En webhook.site vas a ver la notificación llegar en tiempo real con un payload similar a:
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

## Observaciones

### Modo oscuro en dispositivos móviles
En algunos teléfonos, si el sistema operativo está configurado en modo oscuro, el toggle de tema claro de la app puede no funcionar correctamente. Esto es una limitación de ciertos navegadores móviles que fuerzan el esquema de color del sistema y no respetan el cambio manual dentro de la app. No es un bug de la aplicación.

### Inicio de sesión con código de verificación
Clerk puede solicitar un código de verificación al iniciar sesión. En ese caso, accedé a la cuenta de mail del usuario en su plataforma correspondiente (Gmail u Hotmail) — todas las cuentas usan la misma contraseña: `IAW2026A`.