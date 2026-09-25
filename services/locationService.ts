/**
 * Location Service for Live Geolocation Tracking & Reverse Geocoding
 */
import { Platform } from 'react-native';

export type LocationPrecisionMode = 'precise' | 'approximate' | 'default';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName: string;
  isLiveGps: boolean;
  precisionMode?: LocationPrecisionMode;
  error?: string;
}

const DEFAULT_NER_LOCATION: UserLocation = {
  latitude: 25.5788,
  longitude: 91.8933,
  locationName: 'East Khasi Hills • Shillong Sector (Default Safe Pass)',
  isLiveGps: false,
  precisionMode: 'default',
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
 * Fast IP-based Geolocation fallback service when GPS hardware fails, is disabled, or times out
 */
async function fetchIpGeolocation(): Promise<{ lat: number; lon: number; city: string } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: data.city ? `${data.city} • ${data.region || data.country_name || ''}` : '',
        };
      }
    }
  } catch (e) {
    try {
      const res2 = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.latitude && data2.longitude) {
          return {
            lat: data2.latitude,
            lon: data2.longitude,
            city: data2.locality || data2.city || data2.principalSubdivision || '',
          };
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Request user's current position with multi-tiered fail-safe resolution:
 * Tier 1: High Accuracy GPS (15s timeout)
 * Tier 2: Network / Cellular Geolocation (8s timeout)
 * Tier 3: IP Cell Location Fallback
 * Tier 4: Default Safe Pass Location
 */
export async function requestUserLocationWithChoice(mode: LocationPrecisionMode = 'precise'): Promise<UserLocation> {
  if (mode === 'default') {
    return DEFAULT_NER_LOCATION;
  }

  // Tier 1: High Accuracy Browser GPS
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    const primaryResult = await new Promise<UserLocation | null>((resolve) => {
      const enableHighAccuracy = mode === 'precise';

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          let lat = pos.coords.latitude;
          let lon = pos.coords.longitude;
          let accuracy = Math.round(pos.coords.accuracy || 10);

          if (mode === 'approximate') {
            lat = Math.round(lat * 100) / 100;
            lon = Math.round(lon * 100) / 100;
            accuracy = 2500;
          }

          const rawName = await reverseGeocode(lat, lon);
          const locationName = mode === 'approximate' ? `District Level: ${rawName}` : rawName;

          resolve({
            latitude: lat,
            longitude: lon,
            accuracy,
            locationName,
            isLiveGps: true,
            precisionMode: mode,
          });
        },
        () => resolve(null),
        {
          enableHighAccuracy,
          timeout: mode === 'precise' ? 15000 : 8000,
          maximumAge: 30000,
        }
      );
    });

    if (primaryResult) return primaryResult;

    // Tier 2: Network / Wifi Geolocation fallback
    if (mode === 'precise') {
      const networkResult = await new Promise<UserLocation | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            let lat = pos.coords.latitude;
            let lon = pos.coords.longitude;
            let accuracy = Math.round(pos.coords.accuracy || 50);

            const rawName = await reverseGeocode(lat, lon);

            resolve({
              latitude: lat,
              longitude: lon,
              accuracy,
              locationName: rawName,
              isLiveGps: true,
              precisionMode: mode,
            });
          },
          () => resolve(null),
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 60000,
          }
        );
      });

      if (networkResult) return networkResult;
    }
  }

  // Tier 3: IP-based live cell fallback
  const ipLoc = await fetchIpGeolocation();
  if (ipLoc) {
    const rawName = ipLoc.city || (await reverseGeocode(ipLoc.lat, ipLoc.lon));
    return {
      latitude: ipLoc.lat,
      longitude: ipLoc.lon,
      accuracy: 1500,
      locationName: mode === 'approximate' ? `District Level: ${rawName}` : `${rawName} (Live Cell)`,
      isLiveGps: true,
      precisionMode: mode,
    };
  }

  // Tier 4: Fallback to default location
  return {
    ...DEFAULT_NER_LOCATION,
    error: 'Location permission or GPS signal unavailable',
    isLiveGps: false,
    precisionMode: mode,
  };
}

/**
 * Backward compatible wrapper for legacy calls
 */
export async function requestUserLocation(): Promise<UserLocation> {
  return requestUserLocationWithChoice('precise');
}
