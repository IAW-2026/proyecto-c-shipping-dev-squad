import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import OperatorClient from "./OperatorClient"

const PAGE_SIZE = 10

export default async function OperatorPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { page, status, search } = await searchParams
  const currentPage = parseInt(page ?? "1")
  const skip = (currentPage - 1) * PAGE_SIZE

  const where = {
    ...(status && status !== "TODOS" ? { status: status as any } : {}),
    ...(search ? { orderId: parseInt(search) || undefined } : {}),
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { orderId: "desc" }],
      include: { items: true },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.shipment.count({ where }),
  ])

  return (
    <OperatorClient
      total={total}
      currentPage={currentPage}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
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