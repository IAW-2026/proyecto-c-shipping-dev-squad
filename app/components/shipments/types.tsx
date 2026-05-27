export type OrderItem = {
  id?: number
  name: string
  price: number
  quantity: number
  size: number
  imageUrl: string | null
  color?: string | null
  productOriginAddress?: string | null
}

export type Shipment = {
  id: number
  orderId: number
  buyerId: string
  status: string
  address: string
  carrier: string
  shipmentDate?: string | null
  estimatedDeliveryDate: string | null
  deliveryDate?: string | null
  shippingCost?: number | null
  items: OrderItem[]
}

export type TrackingItem = {
  id: number
  location: string
  status: string
  description: string | null
  timestamp: string
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
}

export const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "#faeeda", color: "#854F0B" },
  PREPARING: { bg: "#dbeafe", color: "#1d4ed8" },
  IN_TRANSIT: { bg: "#E1F5EE", color: "#0F6E56" },
  DELIVERED: { bg: "#dcfce7", color: "#15803d" },
}

export const STATUS_OPTIONS = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
export const STEPS = ["PENDING", "PREPARING", "IN_TRANSIT", "DELIVERED"]
export const DEFAULT_DESCRIPTIONS = ["Envío registrado", "Preparando el paquete", "El paquete está en camino", "Entregado al destinatario"]