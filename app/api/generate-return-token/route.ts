import { NextResponse } from "next/server"
import { generateReturnToken } from "@/lib/shipmentToken"

export async function POST() {
  const token = await generateReturnToken()
  return NextResponse.json({ token })
}
