import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Suspense } from "react"
import BuyerTrackingClient from "./BuyerTrackingClient"
import OperatorTrackingClient from "./OperatorTrackingClient"

export default async function PublicTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { userId, sessionClaims } = await auth()

  const role = userId
    ? ((sessionClaims?.metadata as any)?.role ??
       (sessionClaims?.publicMetadata as any)?.role ??
       (sessionClaims as any)?.role ??
       null)
    : null

  const { orderId } = await params
  const { mode } = await searchParams
  const id = orderId

  const shipment = await prisma.shipment.findUnique({
    where: { orderId: id },
    include: { items: true },
  })

  if (!shipment) notFound()

  const serialized = {
    id: shipment.id,
    orderId: shipment.orderId,
    buyerId: shipment.buyerId,
    status: shipment.status,
    address: shipment.address,
    carrier: shipment.carrier,
    shipmentDate: shipment.shipmentDate?.toISOString() ?? null,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate?.toISOString() ?? null,
    deliveryDate: shipment.deliveryDate?.toISOString() ?? null,
    shippingCost: shipment.shippingCost ?? null,
    createdAt: shipment.createdAt.toISOString(),
    items: shipment.items.map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      color: i.color ?? null,
      imageUrl: i.imageUrl,
      productOriginAddress: i.productOriginAddress ?? null,
    })),
  }

  // Operator siempre ve la vista de gestión
  if (role === "logistics_operator") {
    return (
      <Suspense fallback={null}>
        <OperatorTrackingClient shipment={serialized} role={role} />
      </Suspense>
    )
  }

  // Admin en modo edición ve la vista de gestión
  if (role === "admin" && mode === "edit") {
    return (
      <Suspense fallback={null}>
        <OperatorTrackingClient shipment={serialized} role={role} />
      </Suspense>
    )
  }

  // Admin sin modo edición y buyer ven la vista de detalle
  // Admin además recibe la prop canEdit para mostrar el botón Modificar
  return (
    <Suspense fallback={null}>
      <BuyerTrackingClient shipment={serialized} canEdit={role === "admin"} isGuest={!userId} />
    </Suspense>
  )
}