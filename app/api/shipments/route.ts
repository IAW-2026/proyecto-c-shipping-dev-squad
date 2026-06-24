import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { geocodeAddress } from "@/lib/geocode";
import { verifyApiKey } from "@/lib/apiAuth";
import axios from "axios";

const ORS_API_KEY = process.env.ORS_API_KEY!;

const CARRIER_MAP: Record<string, "MAIL" | "PICKUP"> = {
  delivery: "MAIL",
  pickup: "PICKUP",
}

function nextWeekday(date: Date): Date {
  const day = date.getDay();
  if (day === 6) date.setDate(date.getDate() + 2);
  if (day === 0) date.setDate(date.getDate() + 1);
  return date;
}

async function calculateShippingTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<Date> {
  const response = await axios.post(
    `https://api.openrouteservice.org/v2/directions/driving-car`,
    {
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
    },
    {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const durationSeconds = response.data.routes[0].segments[0].duration;
  const PREP_SECONDS = 60 * 60;
  const BUFFER_DAYS = 2;

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setSeconds(
    estimatedDeliveryDate.getSeconds() + durationSeconds + PREP_SECONDS
  );
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + BUFFER_DAYS);

  return nextWeekday(estimatedDeliveryDate);
}

export async function POST(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "API key inválida o ausente" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Body recibido:", JSON.stringify(body));

    if (!body.orderId || !body.buyerId || !body.address || !body.carrier || body.shippingCost === undefined || body.shippingCost === null) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: orderId, buyerId, address, carrier, shippingCost" },
        { status: 400 }
      );
    }

    // Mapeo de valores del buyer ("delivery" / "pickup") al enum interno
    const carrier = CARRIER_MAP[body.carrier.toLowerCase()]
    if (!carrier) {
      return NextResponse.json(
        { error: "Valor de carrier inválido. Se esperaba 'delivery' o 'pickup'" },
        { status: 400 }
      );
    }

    // Idempotencia: si ya existe un envío para esta orden, lo devolvemos en vez de crear otro
    const normalizedOrderId = body.orderId.toLowerCase();
    const existing = await prisma.shipment.findUnique({ where: { orderId: normalizedOrderId } });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    // Fallback: 15 días a partir de hoy en día de semana
    let estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 15);
    estimatedDeliveryDate = nextWeekday(estimatedDeliveryDate);

    const itemsWithOrigin: string[] = [
      ...new Set(
        (body.items ?? [])
          .map((item: { productOriginAddress?: string }) => item.productOriginAddress)
          .filter(Boolean) as string[]
      ),
    ];

    if (itemsWithOrigin.length > 0 && body.address) {
      try {
        const destination = await geocodeAddress(body.address);

        const deliveryDates = await Promise.all(
          itemsWithOrigin.map(async (originAddress) => {
            const origin = await geocodeAddress(originAddress);
            return calculateShippingTime(origin, destination);
          })
        );

        // Tomar la fecha más lejana entre todos los orígenes
        estimatedDeliveryDate = deliveryDates.reduce((latest, current) =>
          current > latest ? current : latest
        );
      } catch (geoError) {
        console.warn("No se pudo calcular la ruta, usando estimación por defecto:", geoError);
      }
    }

    const shipment = await prisma.shipment.create({
      data: {
        orderId: normalizedOrderId,
        buyerId: body.buyerId,
        address: body.address,
        carrier,
        shippingCost: body.shippingCost,
        estimatedDeliveryDate,
        items: {
          create: body.items ?? [],
        },
        tracking: {
          create: {
            location: "Centro de distribución",
            status: "PENDING",
            description: "Envío registrado",
          },
        },
      },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error("Error al crear el envío:", error);
    return NextResponse.json({ error: "Error al crear el envío" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!verifyApiKey(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    const buyerId = req.nextUrl.searchParams.get("buyer_id");

    const shipments = await prisma.shipment.findMany({
      where: buyerId ? { buyerId } : undefined,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error("Error al obtener los envíos:", error);
    return NextResponse.json({ error: "Error al obtener los envíos" }, { status: 500 });
  }
}