import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apiAuth";

const ORDER = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  // 1. Intentamos validar únicamente por Headers (para otras apps o scripts de backend)
  if (!verifyApiKey(req)) {
    // 2. Si no viene la API Key en los headers, revisamos si es tu propio frontend (sesión de Clerk)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  // 3. Si pasó alguna de las dos validaciones, continúa el flujo
  try {
    const { order_id } = await params;
    const shipment = await prisma.shipment.findUnique({
      where: { orderId: order_id },
    });
    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }
    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error al obtener el envío:", error);
    return NextResponse.json({ error: "Error al obtener el envío" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  // Solo lo usa tu frontend (operador/admin actualizando estado), no otras apps
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { order_id } = await params
    const body = await req.json()

    if (body.status && !ORDER.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const current = await prisma.shipment.findUnique({
      where: { orderId: order_id },
    })

    if (!current) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    if (body.status && ORDER.indexOf(body.status) < ORDER.indexOf(current.status)) {
      return NextResponse.json({ error: "No podés retroceder el estado de un envío" }, { status: 400 })
    }

    const shipment = await prisma.shipment.update({
      where: { orderId: order_id },
      data: {
        status: body.status ?? current.status,
        lastStatusTimestamp: new Date(),
      },
    })

    await prisma.tracking.create({
      data: {
        shipmentId: shipment.id,
        status: body.status ?? current.status,
        location: "",
        description: body.description ?? null,
      }
    })

   if (body.status === "DELIVERED") {
  try {
    console.log("shipment completo:", shipment)
    console.log("shipment.orderId:", shipment.orderId)

    const buyerUrl = `https://zapasya.vercel.app/api/orders/${shipment.orderId}/status`

    console.log("Buyer URL:", buyerUrl)

    const res = await fetch(buyerUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "buyer-key": process.env.BUYER_SECRET!,
      },
      body: JSON.stringify({
        status: "SHIPPED",
      }),
    })

    const text = await res.text()

    console.log("Buyer status:", res.status)
    console.log("Buyer body:", text)

  } catch (webhookError) {
    console.warn("No se pudo notificar a la app buyer:", webhookError)
  }
}

    return NextResponse.json(shipment)
  } catch (error) {
    console.error("Error al actualizar el envío:", error)
    return NextResponse.json({ error: "Error al actualizar el envío" }, { status: 500 })
  }
}