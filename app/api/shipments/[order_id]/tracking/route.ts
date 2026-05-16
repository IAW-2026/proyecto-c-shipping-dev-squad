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
    const tracking = await prisma.tracking.findMany({
      where: { shipmentId: shipment.id },
      orderBy: { timestamp: "desc" },
    });
    return NextResponse.json(tracking);
  } catch (error) {
    console.error("Error al obtener el tracking:", error)
    return NextResponse.json({ error: "Error al obtener el tracking" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ order_id: string }> }) {
  try {
    const { order_id } = await params
    const body = await req.json()

    if (!body.description?.trim()) {
      return NextResponse.json({ error: "La descripción es obligatoria" }, { status: 400 })
    }

    const shipment = await prisma.shipment.findUnique({
      where: { orderId: parseInt(order_id) },
    })
    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }
    const tracking = await prisma.tracking.create({
      data: {
        shipmentId: shipment.id,
        status: shipment.status,
        location: body.location ?? "",
        description: body.description,
      }
    })
    return NextResponse.json(tracking, { status: 201 })
  } catch (error) {
    console.error("Error al crear tracking:", error)
    return NextResponse.json({ error: "Error al crear tracking" }, { status: 500 })
  }
}