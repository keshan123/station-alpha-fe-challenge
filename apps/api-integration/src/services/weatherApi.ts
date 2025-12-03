import { WeatherData } from '../App';

// TODO: Replace with your actual API key
const API_KEY = '3a1a08277b2d41e3902203846250212';

// Base URL for Weather API (WeatherAPI.com used as an example)
const BASE_URL = 'https://api.weatherapi.com/v1';

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

    // Make API call to WeatherAPI.com
    const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}&aqi=yes`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Weather data not found for ${location}`);
    }
    
    const data = await response.json();
    const transformedData = transformWeatherData(data);
    
    // Cache the result for 10 minutes
    cacheWeatherData(cacheKey, transformedData, 10);
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
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

    // Make API call to WeatherAPI.com with alerts enabled
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=${forecastDays}&alerts=yes&aqi=yes`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Weather forecast not found for ${location}`);
    }
    
    const data = await response.json();
    const transformedData = transformWeatherData(data);
    
    // Cache the result for 30 minutes (forecast updates less frequently)
    cacheWeatherData(cacheKey, transformedData, 30);
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
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

    // Make API call to WeatherAPI.com search endpoint
    const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Location search failed');
    }
    
    const data = await response.json();
    
    // Transform the response to match our expected format
    const suggestions = Array.isArray(data) ? data.map((item: any) => ({
      id: item.id,
      name: `${item.name}, ${item.region ? item.region + ', ' : ''}${item.country}`,
      region: item.region,
      country: item.country,
      lat: item.lat,
      lon: item.lon
    })) : [];
    
    // Cache search results for 1 hour (location data doesn't change often)
    cacheWeatherData(cacheKey, suggestions, 60);
    
    return suggestions;
  } catch (error) {
    console.error('Error searching locations:', error);
    // Return empty array on error instead of throwing
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
 * Get map URL for a location
 * @param lat - Latitude
 * @param lon - Longitude
 * @param zoom - Zoom level (1-18)
 * @param type - Map type (e.g., 'precipitation', 'temp', 'wind')
 * @returns Map URL string
 */
export const getWeatherMapUrl = (lat: number, lon: number, zoom: number = 10, type: string = 'precipitation'): string => {
  // TODO: Implement weather map URL generation
  // This will depend on the specific mapping service you choose
  
  // Example placeholder implementation using OpenWeatherMap (you'll need a separate API key):
  // return `https://tile.openweathermap.org/map/${type}/${zoom}/${lat}/${lon}.png?appid=${API_KEY}`;
  
  // For now, return a placeholder:
  return `https://placekitten.com/500/300?lat=${lat}&lon=${lon}&zoom=${zoom}&type=${type}`;
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