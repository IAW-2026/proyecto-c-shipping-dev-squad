import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyApiKey } from "@/lib/apiAuth"

const STATUS_ORDER = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
const CARRIERS = ["MAIL", "PICKUP"]
const STALE_THRESHOLD_DAYS = 5
const MAX_LIST_ITEMS = 10
const MAX_DESTINATIONS = 5

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

function daysBetween(a: Date, b: Date) {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function avg(values: number[]) {
  if (values.length === 0) return 0
  return round1(values.reduce((sum, v) => sum + v, 0) / values.length)
}

// Agrupa por mes en formato "YYYY-MM" (el front-end se encarga de
// formatear el label legible con date-fns, igual que hace feedback)
function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

// El campo `address` tiene formato "Calle, Ciudad, Provincia".
// La provincia es siempre el último segmento separado por comas.
function extractProvince(address: string): string | null {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return parts[parts.length - 1]
}

// Valida "YYYY-MM" y devuelve el rango [inicio, fin) del mes en UTC.
// Devuelve null si el param no vino o es inválido (se interpreta como "sin filtro").
function parseMonthRange(monthParam: string | null): { start: Date; end: Date } | null {
  if (!monthParam) return null
  const match = /^(\d{4})-(\d{2})$/.exec(monthParam)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) // 1-12
  if (month < 1 || month > 12) return null

  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

export async function GET(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401, headers: corsHeaders })
  }

  try {
    const monthParam = req.nextUrl.searchParams.get("month")
    const monthRange = parseMonthRange(monthParam)

    if (monthParam && !monthRange) {
      return NextResponse.json(
        { error: "Parámetro 'month' inválido. Formato esperado: YYYY-MM" },
        { status: 400, headers: corsHeaders }
      )
    }

    const shipments = await prisma.shipment.findMany({
      where: monthRange
        ? { createdAt: { gte: monthRange.start, lt: monthRange.end } }
        : undefined,
      select: {
        orderId: true,
        status: true,
        carrier: true,
        shippingCost: true,
        discount: true,
        address: true,
        createdAt: true,
        deliveryDate: true,
        estimatedDeliveryDate: true,
        lastStatusTimestamp: true,
        tracking: {
          select: { status: true, timestamp: true },
          orderBy: { timestamp: "asc" },
        },
      },
    })

    const now = new Date()

    // ---- KPIs ----
    const delivered = shipments.filter((s) => s.status === "DELIVERED")
    const deliveredWithDates = delivered.filter((s) => s.deliveryDate)

    const activeShipments = shipments.filter(
      (s) => s.status === "PREPARING" || s.status === "IN_TRANSIT"
    ).length

    const avgDeliveryDays = avg(
      deliveredWithDates.map((s) => daysBetween(s.createdAt, s.deliveryDate!))
    )

    const withSla = deliveredWithDates.filter((s) => s.estimatedDeliveryDate)
    const onTimeCount = withSla.filter((s) => s.deliveryDate! <= s.estimatedDeliveryDate!).length
    const onTimeRate = withSla.length ? Math.round((onTimeCount / withSla.length) * 100) : 0

    const shippingRevenue = delivered.reduce(
      (sum, s) => sum + (s.shippingCost ?? 0) - (s.discount ?? 0),
      0
    )

    // ---- Embudo: cuántos envíos alcanzaron al menos cada etapa ----
    const funnel = STATUS_ORDER.map((stage) => ({
      status: stage,
      count: shipments.filter(
        (s) => STATUS_ORDER.indexOf(s.status) >= STATUS_ORDER.indexOf(stage)
      ).length,
    }))

    // ---- Distribución por estado actual ----
    const statusDistribution = STATUS_ORDER.map((stage) => ({
      status: stage,
      count: shipments.filter((s) => s.status === stage).length,
    }))

    // ---- Tendencia mensual: creados vs entregados ----
    const monthMap = new Map<string, { created: number; delivered: number }>()
    for (const s of shipments) {
      const key = monthKey(s.createdAt)
      const entry = monthMap.get(key) ?? { created: 0, delivered: 0 }
      entry.created += 1
      monthMap.set(key, entry)
    }
    for (const s of deliveredWithDates) {
      const key = monthKey(s.deliveryDate!)
      const entry = monthMap.get(key) ?? { created: 0, delivered: 0 }
      entry.delivered += 1
      monthMap.set(key, entry)
    }
    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // ---- Comparativa por tipo de envío (carrier) ----
    const carrierComparison = CARRIERS.map((carrier) => {
      const inCarrier = shipments.filter((s) => s.carrier === carrier)
      const deliveredInCarrier = inCarrier.filter((s) => s.status === "DELIVERED" && s.deliveryDate)
      const carrierAvgDays = avg(
        deliveredInCarrier.map((s) => daysBetween(s.createdAt, s.deliveryDate!))
      )
      const carrierWithSla = deliveredInCarrier.filter((s) => s.estimatedDeliveryDate)
      const carrierOnTime = carrierWithSla.filter(
        (s) => s.deliveryDate! <= s.estimatedDeliveryDate!
      ).length

      return {
        carrier,
        count: inCarrier.length,
        avgDeliveryDays: carrierAvgDays,
        onTimeRate: carrierWithSla.length
          ? Math.round((carrierOnTime / carrierWithSla.length) * 100)
          : 0,
      }
    })

    // ---- Tiempo promedio por etapa (usando el historial de tracking) ----
    const pendingToPreparing: number[] = []
    const preparingToTransit: number[] = []
    const transitToDelivered: number[] = []

    for (const s of shipments) {
      const tPreparing = s.tracking.find((t) => t.status === "PREPARING")?.timestamp
      const tTransit = s.tracking.find((t) => t.status === "IN_TRANSIT")?.timestamp
      const tDelivered = s.tracking.find((t) => t.status === "DELIVERED")?.timestamp ?? s.deliveryDate ?? undefined

      if (tPreparing) {
        pendingToPreparing.push(daysBetween(s.createdAt, tPreparing))
      }
      if (tPreparing && tTransit) {
        preparingToTransit.push(daysBetween(tPreparing, tTransit))
      }
      if (tTransit && tDelivered) {
        transitToDelivered.push(daysBetween(tTransit, tDelivered))
      }
    }

    const stageTimes = [
      { stage: "Pendiente → Preparación", avgDays: avg(pendingToPreparing) },
      { stage: "Preparación → En camino", avgDays: avg(preparingToTransit) },
      { stage: "En camino → Entregado", avgDays: avg(transitToDelivered) },
    ]

    // ---- Costos de envío ----
    const withCost = shipments.filter((s) => s.shippingCost != null)
    const avgShippingCost = avg(withCost.map((s) => s.shippingCost!))
    const discountUsageRate = shipments.length
      ? Math.round(
          (shipments.filter((s) => (s.discount ?? 0) > 0).length / shipments.length) * 100
        )
      : 0

    // ---- Envíos estancados (sin cambio de estado hace varios días) ----
    const staleShipments = shipments
      .filter((s) => s.status !== "DELIVERED")
      .map((s) => ({
        orderId: s.orderId,
        status: s.status,
        daysSinceUpdate: Math.floor(daysBetween(s.lastStatusTimestamp, now)),
      }))
      .filter((s) => s.daysSinceUpdate >= STALE_THRESHOLD_DAYS)
      .sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
      .slice(0, MAX_LIST_ITEMS)

    // ---- Provincias con más envíos (extraído del campo address) ----
    const provinceMap = new Map<string, number>()
    for (const s of shipments) {
      const province = extractProvince(s.address)
      if (!province) continue
      provinceMap.set(province, (provinceMap.get(province) ?? 0) + 1)
    }
    const topDestinations = Array.from(provinceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_DESTINATIONS)

    return NextResponse.json(
      {
        kpis: {
          totalShipments: shipments.length,
          activeShipments,
          onTimeRate,
          avgDeliveryDays,
          shippingRevenue,
        },
        funnel,
        statusDistribution,
        monthlyTrend,
        carrierComparison,
        stageTimes,
        discounts: {
          avgShippingCost,
          discountUsageRate,
        },
        staleShipments,
        topDestinations,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("Error al generar el resumen de envíos:", error)
    return NextResponse.json(
      { error: "Error al generar el resumen de envíos" },
      { status: 500, headers: corsHeaders }
    )
  }
}