import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.orderId || !body.buyerId || !body.address || !body.carrier) {
      return NextResponse.json({ error: "Faltan campos obligatorios: orderId, buyerId, address, carrier" }, { status: 400 })
    }

    const estimatedDeliveryDate = new Date()
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 15)

    const shipment = await prisma.shipment.create({
      data: {
        orderId: body.orderId,
        buyerId: body.buyerId,
        address: body.address,
        carrier: body.carrier,
        estimatedDeliveryDate,
        items: {
          create: body.items ?? [],
        },
        tracking: {
          create: {
            location: "Centro de distribución",
            status: "PENDING",
            description: "Envío registrado",
          }
        }
      },
    })
    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    console.error("Error al crear el envío:", error)
    return NextResponse.json({ error: "Error al crear el envío" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const buyerId = req.nextUrl.searchParams.get("buyer_id")

    const shipments = await prisma.shipment.findMany({
      where: buyerId ? { buyerId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })

    return NextResponse.json(shipments)
  } catch (error) {
    console.error("Error al obtener los envíos:", error)
    return NextResponse.json({ error: "Error al obtener los envíos" }, { status: 500 })
  }
}