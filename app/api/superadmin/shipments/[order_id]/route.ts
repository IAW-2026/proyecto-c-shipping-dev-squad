import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyApiKey } from "@/lib/apiAuth"
import { capitalize } from "@/lib/format"

const ORDER = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]

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
      include: { items: true },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404, headers: corsHeaders })
    }

    return NextResponse.json({ ...shipment, address: capitalize(shipment.address) }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error al obtener el envío:", error)
    return NextResponse.json({ error: "Error al obtener el envío" }, { status: 500, headers: corsHeaders })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: corsHeaders })
  }

  try {
    const { order_id } = await params
    const body = await req.json()

    if (!body.status && !body.description) {
      return NextResponse.json({ error: "Debés enviar status o description" }, { status: 400, headers: corsHeaders })
    }

    if (body.status && !ORDER.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400, headers: corsHeaders })
    }

    const current = await prisma.shipment.findUnique({
      where: { orderId: order_id },
    })

    if (!current) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404, headers: corsHeaders })
    }

    if (body.status && ORDER.indexOf(body.status) < ORDER.indexOf(current.status)) {
      return NextResponse.json({ error: "No podés retroceder el estado de un envío" }, { status: 400, headers: corsHeaders })
    }

    const shipment = body.status
      ? await prisma.shipment.update({
          where: { orderId: order_id },
          data: {
            status: body.status,
            lastStatusTimestamp: new Date(),
          },
        })
      : current

    await prisma.tracking.create({
      data: {
        shipmentId: shipment.id,
        status: body.status ?? current.status,
        location: "",
        description: body.description ?? null,
      },
    })

    if (body.status === "DELIVERED") {
      try {
        const res = await fetch(`https://zapasya.vercel.app/api/orders/${shipment.orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "buyer-key": process.env.BUYER_SECRET!,
          },
          body: JSON.stringify({ status: "SHIPPED" }),
        })
        const text = await res.text()
        console.log("Buyer status:", res.status, text)
      } catch (webhookError) {
        console.warn("No se pudo notificar a la app buyer:", webhookError)
      }
    }

    return NextResponse.json({ ...shipment, address: capitalize(shipment.address) }, { headers: corsHeaders })
  } catch (error) {
    console.error("Error al actualizar el envío:", error)
    return NextResponse.json({ error: "Error al actualizar el envío" }, { status: 500, headers: corsHeaders })
  }
}