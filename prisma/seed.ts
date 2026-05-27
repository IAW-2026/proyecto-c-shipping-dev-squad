import { PrismaClient, ShipmentStatus, CarrierType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const now = new Date()
const days = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000)
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

const SHIPMENTS_SEED = [
  {
    orderId: 1,
    buyerId: "user_3DVNSzm8Sg2CfzaTIjXYgiC2Ttw",
    status: ShipmentStatus.DELIVERED,
    address: "Av. Siempreviva 742, Springfield",
    carrier: CarrierType.MAIL,
    shippingCost: 3500,
    shipmentDate: daysAgo(30),
    estimatedDeliveryDate: daysAgo(15),
    deliveryDate: daysAgo(16),
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
      { location: "En camino - Ruta 9", status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino" },
      { location: "Springfield", status: ShipmentStatus.DELIVERED, description: "Entregado al destinatario" },
    ],
    items: [
      { name: "Nike Air Max 90", size: 42, quantity: 1, price: 89999, imageUrl: "https://placehold.co/200x200?text=Air+Max+90", color: "Blanco", productOriginAddress: "Buenos Aires, Argentina" },
    ],
  },
  {
    orderId: 2,
    buyerId: "user_3DVNSzm8Sg2CfzaTIjXYgiC2Ttw",
    status: ShipmentStatus.IN_TRANSIT,
    address: "Calle Falsa 123, Buenos Aires",
    carrier: CarrierType.MAIL,
    shippingCost: 4200,
    shipmentDate: daysAgo(5),
    estimatedDeliveryDate: days(10),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
      { location: "En camino - Autopista Panamericana", status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino" },
    ],
    items: [
      { name: "Adidas Superstar", size: 41, quantity: 1, price: 74999, imageUrl: "https://placehold.co/200x200?text=Superstar", color: "Blanco/Negro", productOriginAddress: "Córdoba, Argentina" },
      { name: "Adidas Stan Smith", size: 41, quantity: 1, price: 64999, imageUrl: "https://placehold.co/200x200?text=Stan+Smith", color: "Blanco/Verde", productOriginAddress: "Córdoba, Argentina" },
    ],
  },
  {
    orderId: 3,
    buyerId: "user_3DVNSzm8Sg2CfzaTIjXYgiC2Ttw",
    status: ShipmentStatus.PREPARING,
    address: "Av. Corrientes 1234, Buenos Aires",
    carrier: CarrierType.PICKUP,
    shippingCost: 0,
    shipmentDate: daysAgo(2),
    estimatedDeliveryDate: days(13),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Buenos Aires", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
    ],
    items: [
      { name: "New Balance 574", size: 43, quantity: 2, price: 54999, imageUrl: "https://placehold.co/200x200?text=NB+574", color: "Gris", productOriginAddress: "Buenos Aires, Argentina" },
    ],
  },
  {
    orderId: 4,
    buyerId: "user_3DVNSzm8Sg2CfzaTIjXYgiC2Ttw",
    status: ShipmentStatus.PENDING,
    address: "San Martín 456, Rosario",
    carrier: CarrierType.MAIL,
    shippingCost: 2800,
    shipmentDate: null,
    estimatedDeliveryDate: days(15),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Rosario", status: ShipmentStatus.PENDING, description: "Envío registrado" },
    ],
    items: [
      { name: "Converse Chuck Taylor", size: 40, quantity: 1, price: 49999, imageUrl: "https://placehold.co/200x200?text=Chuck+Taylor", color: "Negro", productOriginAddress: "Rosario, Santa Fe, Argentina" },
    ],
  },
  {
    orderId: 5,
    buyerId: "user_3DpAklmtRLrf6rB65ko5VHFqRhZ",
    status: ShipmentStatus.DELIVERED,
    address: "Belgrano 890, Mendoza",
    carrier: CarrierType.MAIL,
    shippingCost: 5100,
    shipmentDate: daysAgo(14),
    estimatedDeliveryDate: now,
    deliveryDate: now,
    tracking: [
      { location: "Centro de distribución Mendoza", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Mendoza", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
      { location: "En camino - Ruta 40", status: ShipmentStatus.IN_TRANSIT, description: "El paquete está en camino" },
      { location: "Mendoza", status: ShipmentStatus.DELIVERED, description: "Entregado al destinatario" },
    ],
    items: [
      { name: "Puma Suede Classic", size: 44, quantity: 1, price: 67999, imageUrl: "https://placehold.co/200x200?text=Puma+Suede", color: "Azul marino", productOriginAddress: "Buenos Aires, Argentina" },
    ],
  },
  {
    orderId: 6,
    buyerId: "user_3DpAklmtRLrf6rB65ko5VHFqRhZ",
    status: ShipmentStatus.PREPARING,
    address: "Italia 321, Córdoba",
    carrier: CarrierType.MAIL,
    shippingCost: 3900,
    shipmentDate: daysAgo(1),
    estimatedDeliveryDate: days(14),
    deliveryDate: null,
    tracking: [
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PENDING, description: "Envío registrado" },
      { location: "Centro de distribución Córdoba", status: ShipmentStatus.PREPARING, description: "Preparando el paquete" },
    ],
    items: [
      { name: "Vans Old Skool", size: 42, quantity: 1, price: 58999, imageUrl: "https://placehold.co/200x200?text=Vans+Old+Skool", color: "Negro/Blanco", productOriginAddress: "Córdoba, Argentina" },
    ],
  },
]

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.tracking.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shipment.deleteMany();

  for (const { tracking, items, ...shipmentData } of SHIPMENTS_SEED) {
    await prisma.shipment.create({
      data: {
        ...shipmentData,
        tracking: {
          create: tracking,
        },
        items: {
          create: items,
        },
      },
    });
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