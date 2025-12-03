import { WeatherData } from '../App';

// WeatherAPI.com API key
const API_KEY = '3a1a08277b2d41e3902203846250212';

// Weatherbit.io API key for weather maps
const WEATHERBIT_API_KEY = '0aa541c2f67d4fbeb59fb5f06e5ff51f';

// Base URL for Weather API (WeatherAPI.com used as an example)
const BASE_URL = 'https://api.weatherapi.com/v1';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Custom error class for API errors
 */
export class WeatherAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'WeatherAPIError';
  }
}

/**
 * Fetch with timeout
 */
const fetchWithTimeout = async (url: string, timeout: number = REQUEST_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherAPIError('Request timeout. Please check your internet connection and try again.', 408, 'TIMEOUT');
    }
    throw error;
  }
};

/**
 * Handle API response errors
 */
const handleAPIError = async (response: Response, defaultMessage: string): Promise<never> => {
  let errorMessage = defaultMessage;
  let errorCode: string | undefined;

  try {
    const errorData = await response.json();
    
    // WeatherAPI.com error format
    if (errorData.error) {
      errorMessage = errorData.error.message || defaultMessage;
      errorCode = errorData.error.code;
    }
  } catch {
    // If JSON parsing fails, use status-based messages
    switch (response.status) {
      case 400:
        errorMessage = 'Invalid request. Please check your search query.';
        errorCode = 'BAD_REQUEST';
        break;
      case 401:
        errorMessage = 'API authentication failed. Please check your API key.';
        errorCode = 'UNAUTHORIZED';
        break;
      case 403:
        errorMessage = 'API access forbidden. You may have exceeded your rate limit.';
        errorCode = 'FORBIDDEN';
        break;
      case 404:
        errorMessage = 'Location not found. Please try a different search.';
        errorCode = 'NOT_FOUND';
        break;
      case 429:
        errorMessage = 'Too many requests. Please wait a moment and try again.';
        errorCode = 'RATE_LIMIT';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = 'Weather service is temporarily unavailable. Please try again later.';
        errorCode = 'SERVER_ERROR';
        break;
      default:
        errorMessage = `Request failed with status ${response.status}. Please try again.`;
    }
  }

  throw new WeatherAPIError(errorMessage, response.status, errorCode);
};

/**
 * Get current weather data for a location
 * @param location - City name, zip code, or coordinates
 * @returns Promise with weather data
 */
export const getCurrentWeather = async (location: string): Promise<WeatherData> => {
  try {
    // Check cache first
    const cacheKey = `current_${location}`;
    const cachedData = getCachedWeatherData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call to WeatherAPI.com with timeout
    const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}&aqi=yes`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      await handleAPIError(response, `Weather data not found for ${location}`);
    }
    
    const data = await response.json();
    
    // Validate response data
    if (!data || !data.location || !data.current) {
      throw new WeatherAPIError('Invalid response from weather service. Please try again.', 500, 'INVALID_RESPONSE');
    }
    
    const transformedData = transformWeatherData(data);
    
    // Cache the result for 10 minutes
    cacheWeatherData(cacheKey, transformedData, 10);
    
    return transformedData;
  } catch (error) {
    // Re-throw WeatherAPIError as-is
    if (error instanceof WeatherAPIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new WeatherAPIError('Network error. Please check your internet connection and try again.', 0, 'NETWORK_ERROR');
    }
    
    // Handle other errors
    console.error('Error fetching current weather:', error);
    throw new WeatherAPIError(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      0,
      'UNKNOWN_ERROR'
    );
  }
};

/**
 * Get forecast weather data for a location
 * @param location - City name, zip code, or coordinates
 * @param days - Number of days for forecast (1-14)
 * @returns Promise with weather forecast data
 */
export const getWeatherForecast = async (location: string, days: number = 5): Promise<WeatherData> => {
  try {
    // Clamp days between 1 and 14 (WeatherAPI.com limit)
    const forecastDays = Math.max(1, Math.min(14, days));
    
    // Check cache first
    const cacheKey = `forecast_${location}_${forecastDays}`;
    const cachedData = getCachedWeatherData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call to WeatherAPI.com with alerts enabled and timeout
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=${forecastDays}&alerts=yes&aqi=yes`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      await handleAPIError(response, `Weather forecast not found for ${location}`);
    }
    
    const data = await response.json();
    
    // Validate response data
    if (!data || !data.location || !data.current) {
      throw new WeatherAPIError('Invalid response from weather service. Please try again.', 500, 'INVALID_RESPONSE');
    }
    
    const transformedData = transformWeatherData(data);
    
    // Cache the result for 30 minutes (forecast updates less frequently)
    cacheWeatherData(cacheKey, transformedData, 30);
    
    return transformedData;
  } catch (error) {
    // Re-throw WeatherAPIError as-is
    if (error instanceof WeatherAPIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new WeatherAPIError('Network error. Please check your internet connection and try again.', 0, 'NETWORK_ERROR');
    }
    
    // Handle other errors
    console.error('Error fetching weather forecast:', error);
    throw new WeatherAPIError(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      0,
      'UNKNOWN_ERROR'
    );
  }
};

/**
 * Get weather alerts for a location
 * Note: WeatherAPI.com includes alerts in the forecast endpoint with alerts=yes
 * This function is a convenience wrapper that fetches forecast with alerts
 * @param location - City name, zip code, or coordinates
 * @returns Promise with weather alerts data
 */
export const getWeatherAlerts = async (location: string): Promise<WeatherData> => {
  try {
    // WeatherAPI.com includes alerts in forecast endpoint
    // We'll use the forecast endpoint with alerts enabled
    return await getWeatherForecast(location, 1);
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    throw error;
  }
};

/**
 * Search for locations (autocomplete)
 * @param query - Partial location name
 * @returns Promise with location suggestions
 */
export const searchLocations = async (query: string): Promise<any[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Check cache first
    const cacheKey = `search_${query}`;
    const cachedData = getCachedWeatherData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Make API call to WeatherAPI.com search endpoint with timeout
    const url = `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      // For search, we don't want to show errors to users, just return empty array
      // But log it for debugging
      try {
        await handleAPIError(response, 'Location search failed');
      } catch (apiError) {
        console.warn('Search API error (silently handled):', apiError);
      }
      return [];
    }
    
    const data = await response.json();
    
    // Validate and transform the response
    if (!Array.isArray(data)) {
      console.warn('Invalid search response format');
      return [];
    }
    
    const suggestions = data.map((item: any) => ({
      id: item.id,
      name: `${item.name}, ${item.region ? item.region + ', ' : ''}${item.country}`,
      region: item.region,
      country: item.country,
      lat: item.lat,
      lon: item.lon
    }));
    
    // Cache search results for 1 hour (location data doesn't change often)
    cacheWeatherData(cacheKey, suggestions, 60);
    
    return suggestions;
  } catch (error) {
    // For search, silently handle errors and return empty array
    // This prevents search errors from disrupting the user experience
    if (error instanceof WeatherAPIError && error.code === 'TIMEOUT') {
      console.warn('Search request timeout (silently handled)');
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Search network error (silently handled)');
    } else {
      console.error('Error searching locations:', error);
    }
    return [];
  }
};

/**
 * Transform raw API data to our application's data structure
 * Maps WeatherAPI.com response format to our WeatherData interface
 * @param data - Raw data from WeatherAPI.com
 * @returns Transformed WeatherData object
 */
const transformWeatherData = (data: any): WeatherData => {
  // WeatherAPI.com returns location, current, forecast, and alerts in a consistent format
  return {
    location: {
      name: data.location?.name || 'Unknown',
      country: data.location?.country || 'Unknown',
      lat: parseFloat(data.location?.lat) || 0,
      lon: parseFloat(data.location?.lon) || 0
    },
    current: {
      temp_c: parseFloat(data.current?.temp_c) || 0,
      temp_f: parseFloat(data.current?.temp_f) || 0,
      condition: {
        text: data.current?.condition?.text || 'Unknown',
        icon: data.current?.condition?.icon || '',
        code: parseInt(data.current?.condition?.code) || 0
      },
      wind_kph: parseFloat(data.current?.wind_kph) || 0,
      wind_dir: data.current?.wind_dir || 'N',
      humidity: parseInt(data.current?.humidity) || 0,
      feelslike_c: parseFloat(data.current?.feelslike_c) || 0,
      feelslike_f: parseFloat(data.current?.feelslike_f) || 0,
      uv: parseFloat(data.current?.uv) || 0
    },
    forecast: data.forecast?.forecastday ? {
      forecastday: data.forecast.forecastday.map((day: any) => ({
        date: day.date || '',
        day: {
          maxtemp_c: parseFloat(day.day?.maxtemp_c) || 0,
          mintemp_c: parseFloat(day.day?.mintemp_c) || 0,
          condition: {
            text: day.day?.condition?.text || 'Unknown',
            icon: day.day?.condition?.icon || ''
          },
          daily_chance_of_rain: parseInt(day.day?.daily_chance_of_rain) || 0
        }
      }))
    } : undefined,
    alerts: data.alerts?.alert && Array.isArray(data.alerts.alert) && data.alerts.alert.length > 0 ? {
      alert: data.alerts.alert.map((alert: any) => ({
        headline: alert.headline || 'Weather Alert',
        severity: alert.severity || 'Unknown',
        urgency: alert.urgency || 'Unknown',
        areas: alert.areas || 'Unknown',
        desc: alert.desc || alert.description || '',
        effective: alert.effective || '',
        expires: alert.expires || ''
      }))
    } : undefined
  };
};

/**
 * Convert lat/lon to tile coordinates
 */
export const deg2num = (lat: number, lon: number, zoom: number): { x: number; y: number } => {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
};

/**
 * Convert lat/lon to pixel coordinates at a given zoom level
 * Returns world pixel coordinates (absolute position in the entire map at this zoom level)
 */
export const latLonToPixel = (lat: number, lon: number, zoom: number): { x: number; y: number } => {
  const n = Math.pow(2, zoom);
  const tileSize = 256;
  
  // Convert lat/lon to world coordinates (0-1 range)
  const worldX = (lon + 180) / 360;
  const latRad = lat * Math.PI / 180;
  const worldY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
  
  // Convert to pixel coordinates (world pixel coordinates)
  const pixelX = worldX * n * tileSize;
  const pixelY = worldY * n * tileSize;
  
  return { x: pixelX, y: pixelY };
};

/**
 * Convert pixel coordinates to lat/lon - improved accuracy
 */
export const pixelToLatLon = (
  pixelX: number,
  pixelY: number,
  mapWidth: number,
  mapHeight: number,
  centerLat: number,
  centerLon: number,
  zoom: number
): { lat: number; lon: number } => {
  const tileSize = 256;
  const n = Math.pow(2, zoom);
  
  // Get the pixel coordinates of the center point
  const centerPixel = latLonToPixel(centerLat, centerLon, zoom);
  
  // Calculate the pixel coordinates of the center of the map container
  const containerCenterX = mapWidth / 2;
  const containerCenterY = mapHeight / 2;
  
  // Calculate the offset from the container center to the clicked point
  const offsetX = pixelX - containerCenterX;
  const offsetY = pixelY - containerCenterY;
  
  // Calculate the world pixel coordinates of the clicked point
  const clickedPixelX = centerPixel.x + offsetX;
  const clickedPixelY = centerPixel.y + offsetY;
  
  // Convert world pixel coordinates back to world coordinates (0-1 range)
  const worldX = clickedPixelX / (n * tileSize);
  const worldY = clickedPixelY / (n * tileSize);
  
  // Convert world coordinates to lat/lon
  const lon = worldX * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY)));
  const lat = latRad * 180 / Math.PI;
  
  return { lat, lon };
};

/**
 * Get OpenStreetMap tile URL (base map)
 */
export const getMapTileUrl = (x: number, y: number, zoom: number): string => {
  // Using OpenStreetMap tiles (free, no API key required)
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
};

/**
 * Get Weatherbit.io weather map tile URL
 * @param x - Tile X coordinate
 * @param y - Tile Y coordinate
 * @param zoom - Zoom level
 * @param mapType - Type of weather overlay ('precipitation', 'temp', 'wind', or 'clouds')
 * @returns URL string for the weather overlay tile
 */
export const getWeatherbitMapTileUrl = (
  x: number,
  y: number,
  zoom: number,
  mapType: 'precipitation' | 'temp' | 'wind' | 'clouds'
): string => {
  // Map our map types to Weatherbit.io field names
  const fieldMap: Record<string, string> = {
    precipitation: 'catprecipdbz', // Categorical Precipitation
    temp: 'temp2m', // 2 Meter Air Temperature
    wind: 'fullsat', // Satellite (Infrared) - closest option for wind visualization
    clouds: 'fullsat' // Satellite (Infrared)
  };
  
  const field = fieldMap[mapType] || 'catprecipdbz';
  
  // Weatherbit.io map tile URL format:
  // https://maps.weatherbit.io/v2.0/singleband/{field}/latest/{z}/{x}/{y}.png?key=YOUR_API_KEY
  return `https://maps.weatherbit.io/v2.0/singleband/${field}/latest/${zoom}/${x}/${y}.png?key=${WEATHERBIT_API_KEY}`;
};

/**
 * Get map URL for a location (returns center coordinates for map display)
 * @param lat - Latitude
 * @param lon - Longitude
 * @param zoom - Zoom level (1-18)
 * @returns Object with map configuration
 */
export const getWeatherMapUrl = (lat: number, lon: number, zoom: number = 10): { lat: number; lon: number; zoom: number } => {
  return { lat, lon, zoom };
};

/**
 * Cache weather data in localStorage
 * @param key - Cache key
 * @param data - Data to cache
 * @param expirationMinutes - Cache expiration in minutes
 */
export const cacheWeatherData = (key: string, data: any, expirationMinutes: number = 30): void => {
  const now = new Date();
  const item = {
    data,
    expiry: now.getTime() + expirationMinutes * 60 * 1000,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get cached weather data from localStorage
 * @param key - Cache key
 * @returns Cached data or null if expired/not found
 */
export const getCachedWeatherData = (key: string): any | null => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    // If there's an error parsing cached data, remove it and return null
    console.warn('Error reading cached data, clearing cache entry:', key, error);
    localStorage.removeItem(key);
    return null;
  }
}; 