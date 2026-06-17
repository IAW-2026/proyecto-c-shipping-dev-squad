import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apiAuth";

const ORDER = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  // Acepta API key (otras apps) o sesión de Clerk (tu propio frontend)
  if (!verifyApiKey(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const { order_id } = await params;
    const shipment = await prisma.shipment.findUnique({
      where: { orderId: parseInt(order_id) },
    });
    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
    }
    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Error al obtener el envío:", error)
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
      where: { orderId: parseInt(order_id) },
    })

    if (!current) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    if (body.status && ORDER.indexOf(body.status) < ORDER.indexOf(current.status)) {
      return NextResponse.json({ error: "No podés retroceder el estado de un envío" }, { status: 400 })
    }

    const shipment = await prisma.shipment.update({
      where: { orderId: parseInt(order_id) },
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
      const webhookUrl = process.env.DELIVERY_WEBHOOK_URL
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "shipment.delivered",
              orderId: shipment.orderId,
              buyerId: shipment.buyerId,
              deliveredAt: new Date().toISOString(),
            }),
          })
        } catch (webhookError) {
          console.warn("No se pudo notificar el webhook de entrega:", webhookError)
        }
      } else {
        console.warn("DELIVERY_WEBHOOK_URL no configurada, se omite la notificación")
      }
    }

    return NextResponse.json(shipment)
  } catch (error) {
    console.error("Error al actualizar el envío:", error)
    return NextResponse.json({ error: "Error al actualizar el envío" }, { status: 500 })
  }
}