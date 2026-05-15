import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
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
    return NextResponse.json({ error: "Error al obtener el envío" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  try {
    const { order_id } = await params
    const body = await req.json()
    

    const current = await prisma.shipment.findUnique({
      where: { orderId: parseInt(order_id) },
    })

    if (!current) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    const ORDER = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
    
    // Si manda un status, validar que sea mayor al actual
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

    return NextResponse.json(shipment)
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar el envío" }, { status: 500 })
  }
}