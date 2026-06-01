import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminDashboardClient from "./AdminDashboardClient"

export default async function AdminDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const shipments = await prisma.shipment.findMany({
    orderBy: [{ createdAt: "desc" }, { orderId: "desc" }],
    include: { items: true },
  })

  return (
    <AdminDashboardClient
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
        createdAt: s.createdAt.toISOString(),
        items: [],
      }))}
    />
  )
}