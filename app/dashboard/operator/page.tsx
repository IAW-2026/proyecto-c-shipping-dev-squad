import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OperatorClient from "./OperatorClient"

export default async function OperatorPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  })

  return (
    <OperatorClient
      shipments={shipments.map(s => ({
        id: s.id,
        orderId: s.orderId,
        buyerId: s.buyerId,
        status: s.status,
        address: s.address,
        carrier: s.carrier,
        shipmentDate: s.shipmentDate?.toISOString() ?? null,
        estimatedDeliveryDate: s.estimatedDeliveryDate?.toISOString() ?? null,
        deliveryDate: s.deliveryDate?.toISOString() ?? null,
        shippingCost: s.shippingCost ?? null,
        items: s.items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color ?? null,
          imageUrl: i.imageUrl,
          productOriginAddress: i.productOriginAddress ?? null,
        })),
      }))}
    />
  )
}