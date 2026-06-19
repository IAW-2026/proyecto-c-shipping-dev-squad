import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyApiKey } from "@/lib/apiAuth"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: corsHeaders })
  }

  try {
    const { order_id } = await params

    const shipment = await prisma.shipment.findUnique({
      where: { orderId: order_id },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404, headers: corsHeaders })
    }

    const tracking = await prisma.tracking.findMany({
      where: { shipmentId: shipment.id },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(tracking, { headers: corsHeaders })
  } catch (error) {
    console.error("Error al obtener el tracking:", error)
    return NextResponse.json({ error: "Error al obtener el tracking" }, { status: 500, headers: corsHeaders })
  }
}