import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const estimatedDeliveryDate = new Date()
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 15)

    const shipment = await prisma.shipment.create({
      data: {
        orderId: body.orderId,
        buyerId: body.buyerId,
        address: body.address,
        carrier: body.carrier,
        estimatedDeliveryDate,
      },
    })
    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al crear el envío" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const buyerId = req.nextUrl.searchParams.get("buyer_id")
    
    const shipments = await prisma.shipment.findMany({
      where: buyerId ? { buyerId: parseInt(buyerId) } : undefined,
      orderBy: { createdAt: "desc" },
    })
    
    return NextResponse.json(shipments)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener los envíos" }, { status: 500 })
  }
}