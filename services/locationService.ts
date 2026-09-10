/**
 * Location Service for Live Geolocation Tracking & Reverse Geocoding
 */
import { Platform } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName: string;
  isLiveGps: boolean;
  error?: string;
}

const DEFAULT_NER_LOCATION: UserLocation = {
  latitude: 25.5788,
  longitude: 91.8933,
  locationName: 'East Khasi Hills • Shillong Sector',
  isLiveGps: false,
};

/**
 * Reverse geocode latitude and longitude to a human-readable city/district name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RakshakNER-Landslide-EarlyWarning/1.5',
      },
    });

    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    const addr = data.address || {};

    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.suburb ||
      addr.county ||
      addr.district ||
      '';

    const state =
      addr.state ||
      addr.state_district ||
      addr.region ||
      addr.country ||
      '';

    if (city && state) {
      return `${city} • ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }

    return `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
  } catch (e) {
    console.warn('Reverse geocoding fallback to coords:', e);
    return `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
  }
}

/**
 * Request user's current GPS position and reverse geocode location name
 */
export async function requestUserLocation(): Promise<UserLocation> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return DEFAULT_NER_LOCATION;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 10);

        const locationName = await reverseGeocode(lat, lon);

        resolve({
          latitude: lat,
          longitude: lon,
          accuracy,
          locationName,
          isLiveGps: true,
        });
      },
      (err) => {
        resolve({
          ...DEFAULT_NER_LOCATION,
          error: err.message,
          isLiveGps: false,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  });
}
