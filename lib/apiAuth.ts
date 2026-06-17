/**
 * Valida que la request venga de una app externa autorizada,
 * usando una API key compartida enviada en el header `x-api-key`.
 */
export function verifyApiKey(req: Request): boolean {
  const key = req.headers.get("x-api-key");
  return !!key && key === process.env.INTERNAL_API_KEY;
}