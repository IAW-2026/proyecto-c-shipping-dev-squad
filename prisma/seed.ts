import { PrismaClient, ShipmentStatus, CarrierType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const now = new Date()
const days = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000)
const hours = (date: Date, h: number) => new Date(date.getTime() + h * 60 * 60 * 1000)

// Fechas base de creación de cada pedido
const abril1  = new Date("2026-04-03T10:00:00Z")
const abril2  = new Date("2026-04-17T14:30:00Z")
const mayo1   = new Date("2026-05-02T09:00:00Z")
const mayo2   = new Date("2026-05-06T11:00:00Z")
const mayo3   = new Date("2026-05-22T16:00:00Z")
const mayo4   = new Date("2026-05-26T08:30:00Z")

const SHIPMENTS_SEED = [
  {
    orderId: 1,
    buyerId: "user_3EKShExQwqluXp2XDxRZwGjEPSJ",
    status: ShipmentStatus.DELIVERED,
    address: "Av. Siempreviva 742, Springfield",
    carrier: CarrierType.MAIL,
    shippingCost: 3500,
    shipmentDate: abril1,
    estimatedDeliveryDate: new Date("2026-04-18T00:00:00Z"),
    deliveryDate: new Date("2026-04-17T00:00:00Z"),
    createdAt: abril1,
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING,    description: "Envío registrado",           timestamp: abril1 },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING,  description: "Preparando el paquete",       timestamp: hours(abril1, 3) },
      { location: "En camino - Ruta 9",                  status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino",   timestamp: hours(abril1, 24) },
      { location: "Springfield",                         status: ShipmentStatus.DELIVERED,  description: "Entregado al destinatario",   timestamp: new Date("2026-04-17T14:00:00Z") },
    ],
    items: [
      { name: "Nike Air Max 90", size: 42, quantity: 1, price: 89999, imageUrl: "https://placehold.co/200x200?text=Air+Max+90", color: "Blanco", productOriginAddress: "Buenos Aires, Argentina" },
    ],
  },
  {
    orderId: 2,
    buyerId: "user_3DpAklmtRLrf6rB65ko5VHFqRhZ",
    status: ShipmentStatus.DELIVERED,
    address: "Belgrano 890, Mendoza",
    carrier: CarrierType.MAIL,
    shippingCost: 5100,
    shipmentDate: abril2,
    estimatedDeliveryDate: new Date("2026-04-30T00:00:00Z"),
    deliveryDate: new Date("2026-04-29T00:00:00Z"),
    createdAt: abril2,
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING,    description: "Envío registrado",           timestamp: abril2 },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING,  description: "Preparando el paquete",       timestamp: hours(abril2, 4) },
      { location: "En camino - Ruta 40",                 status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino",   timestamp: hours(abril2, 30) },
      { location: "Mendoza",                             status: ShipmentStatus.DELIVERED,  description: "Entregado al destinatario",   timestamp: new Date("2026-04-29T10:00:00Z") },
    ],
    items: [
      { name: "Puma Suede Classic", size: 44, quantity: 1, price: 67999, imageUrl: "https://placehold.co/200x200?text=Puma+Suede", color: "Azul marino", productOriginAddress: "Buenos Aires, Argentina" },
    ],
  },
  {
    orderId: 3,
    buyerId: "user_3EKShExQwqluXp2XDxRZwGjEPSJ",
    status: ShipmentStatus.DELIVERED,
    address: "Calle Falsa 123, Buenos Aires",
    carrier: CarrierType.MAIL,
    shippingCost: 4200,
    shipmentDate: mayo1,
    estimatedDeliveryDate: new Date("2026-05-12T00:00:00Z"),
    deliveryDate: new Date("2026-05-11T00:00:00Z"),
    createdAt: mayo1,
    tracking: [
      { location: "Centro de distribución Córdoba",       status: ShipmentStatus.PENDING,    description: "Envío registrado",           timestamp: mayo1 },
      { location: "Centro de distribución Córdoba",       status: ShipmentStatus.PREPARING,  description: "Preparando el paquete",       timestamp: hours(mayo1, 5) },
      { location: "En camino - Autopista Panamericana",   status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino",   timestamp: hours(mayo1, 48) },
      { location: "Buenos Aires",                         status: ShipmentStatus.DELIVERED,  description: "Entregado al destinatario",   timestamp: new Date("2026-05-11T13:00:00Z") },
    ],
    items: [
      { name: "Adidas Superstar", size: 41, quantity: 1, price: 74999, imageUrl: "https://placehold.co/200x200?text=Superstar", color: "Blanco/Negro", productOriginAddress: "Córdoba, Argentina" },
      { name: "Adidas Stan Smith", size: 41, quantity: 1, price: 64999, imageUrl: "https://placehold.co/200x200?text=Stan+Smith", color: "Blanco/Verde", productOriginAddress: "Córdoba, Argentina" },
    ],
  },
  {
    orderId: 4,
    buyerId: "user_3DpAklmtRLrf6rB65ko5VHFqRhZ",
    status: ShipmentStatus.PREPARING,
    address: "Italia 321, Córdoba",
    carrier: CarrierType.MAIL,
    shippingCost: 3900,
    shipmentDate: mayo2,
    estimatedDeliveryDate: new Date("2026-05-16T00:00:00Z"),
    deliveryDate: null,
    createdAt: mayo2,
    tracking: [
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PENDING,   description: "Envío registrado",     timestamp: mayo2 },
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PREPARING, description: "Preparando el paquete", timestamp: hours(mayo2, 2) },
    ],
    items: [
      { name: "Vans Old Skool", size: 42, quantity: 1, price: 58999, imageUrl: "https://placehold.co/200x200?text=Vans+Old+Skool", color: "Negro/Blanco", productOriginAddress: "Córdoba, Argentina" },
    ],
  },
  {
    orderId: 5,
    buyerId: "user_3EKShExQwqluXp2XDxRZwGjEPSJ",
    status: ShipmentStatus.IN_TRANSIT,
    address: "Av. Corrientes 1234, Buenos Aires",
    carrier: CarrierType.PICKUP,
    shippingCost: 0,
    shipmentDate: mayo3,
    estimatedDeliveryDate: days(3),
    deliveryDate: null,
    createdAt: mayo3,
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING,    description: "Envío registrado",         timestamp: mayo3 },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING,  description: "Preparando el paquete",     timestamp: hours(mayo3, 6) },
      { location: "En camino - Buenos Aires",            status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino", timestamp: hours(mayo3, 24) },
    ],
    items: [
      { name: "New Balance 574", size: 43, quantity: 2, price: 54999, imageUrl: "https://placehold.co/200x200?text=NB+574", color: "Gris", productOriginAddress: "Buenos Aires, Argentina" },
    ],
  },
  {
    orderId: 6,
    buyerId: "user_3DpAklmtRLrf6rB65ko5VHFqRhZ",
    status: ShipmentStatus.PENDING,
    address: "San Martín 456, Rosario",
    carrier: CarrierType.MAIL,
    shippingCost: 2800,
    shipmentDate: null,
    estimatedDeliveryDate: days(5),
    deliveryDate: null,
    createdAt: mayo4,
    tracking: [
      { location: "Centro de distribución Rosario", status: ShipmentStatus.PENDING, description: "Envío registrado", timestamp: mayo4 },
    ],
    items: [
      { name: "Converse Chuck Taylor", size: 40, quantity: 1, price: 49999, imageUrl: "https://placehold.co/200x200?text=Chuck+Taylor", color: "Negro", productOriginAddress: "Rosario, Santa Fe, Argentina" },
    ],
  },
]

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.tracking.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shipment.deleteMany();

  for (const { tracking, items, createdAt, ...shipmentData } of SHIPMENTS_SEED) {
    const shipment = await prisma.shipment.create({
      data: {
        ...shipmentData,
        items: { create: items },
      },
    });

    // Forzar createdAt del shipment
    await prisma.$executeRawUnsafe(
      `UPDATE "Shipment" SET "createdAt" = $1 WHERE id = $2`,
      createdAt,
      shipment.id
    );

    // Crear cada tracking item y forzar su timestamp
    for (const t of tracking) {
      const { timestamp, ...trackingData } = t
      const created = await prisma.tracking.create({
        data: { ...trackingData, shipmentId: shipment.id },
      })
      await prisma.$executeRawUnsafe(
        `UPDATE "Tracking" SET "timestamp" = $1 WHERE id = $2`,
        timestamp,
        created.id
      )
    }
  }

  console.log(`✅ ${SHIPMENTS_SEED.length} envíos creados con tracking e items`);
  console.log("🎉 Seed completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());