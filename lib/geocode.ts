import axios from 'axios';

// Nominatim (OpenStreetMap) — no requiere API key y resuelve mejor
// direcciones en Argentina que el geocoder de OpenRouteService.
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: address,
      format: 'json',
      limit: 1,
      countrycodes: 'ar',
    },
    headers: {
      // Nominatim exige un User-Agent identificatorio
      'User-Agent': 'ZapasYA-Shipping/1.0',
    },
  });

  const results = response.data;

  if (!results || results.length === 0) {
    throw new Error(`No se encontraron coordenadas para: "${address}"`);
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}