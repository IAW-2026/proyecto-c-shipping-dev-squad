import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyApiKey } from "@/lib/apiAuth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { order_id } = await params

    const shipment = await prisma.shipment.findUnique({
      where: { orderId: order_id },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    const tracking = await prisma.tracking.findMany({
      where: { shipmentId: shipment.id },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(tracking)
  } catch (error) {
    console.error("Error al obtener el tracking:", error)
    return NextResponse.json({ error: "Error al obtener el tracking" }, { status: 500 })
  }
}