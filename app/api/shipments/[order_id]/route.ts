import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apiAuth";

const ORDER = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  // Acepta: API Key por header, sesión de Clerk, o acceso público (guest)
  // El endpoint de tracking es público para permitir ver envíos sin login
  if (!verifyApiKey(req)) {
    await auth(); // inicializa el contexto pero no bloquea si no hay sesión
  }

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
        discount: body.discount,
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

    const BUYER_STATUS_MAP: Record<string, string> = {
      IN_TRANSIT: "SHIPPED",
      DELIVERED: "DELIVERED",
    }

    if (body.status && BUYER_STATUS_MAP[body.status]) {
      try {
        const buyerUrl = `https://zapasya.vercel.app/api/orders/${shipment.orderId}/status`

        await fetch(buyerUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "buyer-key": process.env.BUYER_SECRET!,
          },
          body: JSON.stringify({
            status: BUYER_STATUS_MAP[body.status],
          }),
        })

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