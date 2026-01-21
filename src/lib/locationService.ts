// Location service using OpenStreetMap Nominatim (free, no API key needed)

export interface LocationResult {
  lat: number;
  lng: number;
  name: string;
  city?: string;
  country?: string;
}

// Reverse geocoding: coordinates to address
export const getAddressFromCoords = async (lat: number, lng: number): Promise<LocationResult | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=nl`,
      {
        headers: {
          'User-Agent': 'Emberwords App'
        }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address || {};

    // Build a nice display name
    const city = address.city || address.town || address.village || address.municipality;
    const country = address.country;
    const name = city && country ? `${city}, ${country}` : data.display_name?.split(',').slice(0, 2).join(',');

    return {
      lat,
      lng,
      name: name || 'Onbekende locatie',
      city,
      country
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

export const GOOGLE_PLACES_API_KEY = 'AIzaSyAjtbkAOwXWA1qWTmvwHDTrWECxyWRg1p0';

// Placeholder - actual search is done via Google Places Autocomplete in the component
export const searchPlaces = async (_query: string): Promise<LocationResult[]> => {
  // This function is kept for compatibility but the actual search
  // is now handled by Google Places Autocomplete widget
  return [];
};

// Get current position using browser Geolocation API
export const getCurrentPosition = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
};
