import { NextRequest } from "next/server";

/**
 * Valida que la request venga de una app externa autorizada,
 * usando una API key compartida enviada en el header `x-api-key`.
 */
export function verifyApiKey(req: NextRequest | Request): boolean {
  // Intentamos leerlo de forma nativa o usando el diccionario de headers de Next.js
  const key = req.headers instanceof Headers 
    ? req.headers.get("x-api-key") 
    : (req.headers as any)["x-api-key"];

  return !!key && key === process.env.INTERNAL_API_KEY;
}