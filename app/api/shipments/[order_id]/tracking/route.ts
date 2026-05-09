import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ order_id: string } > }) {
  try {
    const {order_id} = await params;
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
    return NextResponse.json({ error: "Error al obtener el tracking" }, { status: 500 });
  }
}