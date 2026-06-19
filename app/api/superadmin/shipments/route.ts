import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyApiKey } from "@/lib/apiAuth"

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const status = searchParams.get("status") ?? undefined

    const where = status ? { status: status as any } : {}

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.shipment.count({ where }),
    ])

    return NextResponse.json({
      shipments,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    })
  } catch (error) {
    console.error("Error al listar envíos:", error)
    return NextResponse.json({ error: "Error al listar envíos" }, { status: 500 })
  }
}