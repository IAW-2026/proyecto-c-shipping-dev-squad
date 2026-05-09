import { PrismaClient, ShipmentStatus, CarrierType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SHIPMENTS_SEED = [
  {
    orderId: 1,
    buyerId: 1,
    status: ShipmentStatus.DELIVERED,
    address: "Av. Siempreviva 742, Springfield",
    carrier: CarrierType.MAIL,
    shipmentDate: new Date("2026-04-01"),
    estimatedDeliveryDate: new Date("2026-04-05"),
    deliveryDate: new Date("2026-04-04"),
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
      { location: "En camino - Ruta 9", status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino" },
      { location: "Springfield", status: ShipmentStatus.DELIVERED, description: "Entregado al destinatario" },
    ],
  },
  {
    orderId: 2,
    buyerId: 2,
    status: ShipmentStatus.IN_TRANSIT,
    address: "Calle Falsa 123, Buenos Aires",
    carrier: CarrierType.MAIL,
    shipmentDate: new Date("2026-05-01"),
    estimatedDeliveryDate: new Date("2026-05-06"),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
      { location: "En camino - Autopista Panamericana", status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino" },
    ],
  },
  {
    orderId: 3,
    buyerId: 1,
    status: ShipmentStatus.PREPARING,
    address: "Av. Corrientes 1234, Buenos Aires",
    carrier: CarrierType.PICKUP,
    shipmentDate: new Date("2026-05-07"),
    estimatedDeliveryDate: new Date("2026-05-10"),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
    ],
  },
  {
    orderId: 4,
    buyerId: 3,
    status: ShipmentStatus.PENDING,
    address: "San Martín 456, Rosario",
    carrier: CarrierType.MAIL,
    shipmentDate: null,
    estimatedDeliveryDate: new Date("2026-05-12"),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Rosario", status: ShipmentStatus.PENDING, description: "Envío registrado" },
    ],
  },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.tracking.deleteMany();
  await prisma.shipment.deleteMany();

  for (const { tracking, ...shipmentData } of SHIPMENTS_SEED) {
    await prisma.shipment.create({
      data: {
        ...shipmentData,
        tracking: {
          create: tracking,
        },
      },
    });
  }

  console.log(`✅ ${SHIPMENTS_SEED.length} envíos creados con su tracking`);
  console.log("🎉 Seed completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());