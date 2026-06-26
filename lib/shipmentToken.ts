/*
 * Token firmado para permitir que un usuario autenticado en la app buyer
 * vea su envío en esta app sin tener que loguearse de nuevo con Clerk.
 *
 * Usa el mismo BUYER_SECRET que ya comparten ambas apps.
 * Compatible con Edge Runtime (usa Web Crypto, no el módulo "crypto" de Node),
 * así que funciona tanto en proxy.ts (middleware) como en page.tsx.
 *
 * IMPORTANTE: este mismo archivo, tal cual, tiene que vivir también del lado
 * de la app buyer para que la firma generada ahí calce con la verificación
 * de acá. No reescribir la lógica de encoding del otro lado "a mano" — copiar
 * este archivo completo.
 */

const SECRET = process.env.BUYER_SECRET!;

async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64urlEncode(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): ArrayBuffer {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

type ShipmentTokenPayload = {
  clerkId: string;
  orderId: string;
  exp: number;
};

/**
 * Genera el token. Esto se usa del lado de la app BUYER, siempre en
 * server-side (Server Action o Route Handler) — nunca en un componente
 * cliente, porque el secreto no puede llegar al navegador.
 */
export async function generateShipmentToken(
  data: { clerkId: string; orderId: string },
  ttlSeconds = 180
): Promise<string> {
  const payload: ShipmentTokenPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadB64 = base64urlEncode(payloadBytes.buffer as ArrayBuffer);

  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const sigB64 = base64urlEncode(sig);

  return `${payloadB64}.${sigB64}`;
}

/**
 * Verifica el token. Esto se usa del lado de ESTA app (shipping).
 * Devuelve el userId si es válido, o null si no.
 */
export async function verifyShipmentToken(
  token: string,
  expectedOrderId: string
): Promise<{ clerkId: string } | null> {
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlDecode(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload: ShipmentTokenPayload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadB64))
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.orderId !== expectedOrderId) return null;

    return { clerkId: payload.clerkId };
  } catch {
    return null;
  }
}

export async function generateReturnToken(ttlSeconds = 180): Promise<string> {
  const payload = { exp: Math.floor(Date.now() / 1000) + ttlSeconds }
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))
  const payloadB64 = base64urlEncode(payloadBytes.buffer as ArrayBuffer)
  const key = await getKey()
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64))
  const sigB64 = base64urlEncode(sig)
  return `${payloadB64}.${sigB64}`
}

export async function verifyReturnToken(token: string): Promise<boolean> {
  const [payloadB64, sigB64] = token.split(".")
  if (!payloadB64 || !sigB64) return false
  try {
    const key = await getKey()
    const valid = await crypto.subtle.verify("HMAC", key, base64urlDecode(sigB64), new TextEncoder().encode(payloadB64))
    if (!valid) return false
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)))
    return payload.exp >= Math.floor(Date.now() / 1000)
  } catch { return false }
}