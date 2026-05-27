import axios from 'axios';

const ORS_API_KEY = process.env.ORS_API_KEY!;

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const response = await axios.get(
    'https://api.openrouteservice.org/geocode/search',
    {
      params: {
        api_key: ORS_API_KEY,
        text: address,
        size: 1,
      }
    }
  );

  const features = response.data.features;

  if (!features || features.length === 0) {
    throw new Error(`No se encontraron coordenadas para: "${address}"`);
  }

  const [lng, lat] = features[0].geometry.coordinates;
  return { lat, lng };
}