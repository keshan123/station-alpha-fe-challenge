import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { WeatherData } from '../App';
import { getMapTileUrl, pixelToLatLon, deg2num, latLonToPixel } from '../services/weatherApi';

interface WeatherMapProps {
  weatherData: WeatherData;
  onLocationSelect: (lat: number, lon: number) => void;
}

const WeatherMap = memo(({ weatherData, onLocationSelect }: WeatherMapProps) => {
  const [zoom, setZoom] = useState<number>(10);
  const [mapType, setMapType] = useState<'base' | 'precipitation' | 'temp' | 'wind'>('base');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Array<{ x: number; y: number; url: string }>>([]);
  const [mapCenter, setMapCenter] = useState({ lat: weatherData.location.lat, lon: weatherData.location.lon });
  
  // Get coordinates from weatherData
  const lat = weatherData.location.lat;
  const lon = weatherData.location.lon;
  
  // Update map center when weather data changes
  useEffect(() => {
    setMapCenter({ lat, lon });
  }, [lat, lon]);
  
  // Calculate and load map tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const container = mapContainerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Calculate how many tiles we need
    const tileSize = 256;
    const tilesX = Math.ceil(containerWidth / tileSize) + 2;
    const tilesY = Math.ceil(containerHeight / tileSize) + 2;
    
    // Get center tile
    const centerTile = deg2num(mapCenter.lat, mapCenter.lon, zoom);
    
    // Generate tile coordinates
    const newTiles: Array<{ x: number; y: number; url: string }> = [];
    const startX = centerTile.x - Math.floor(tilesX / 2);
    const startY = centerTile.y - Math.floor(tilesY / 2);
    
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const tileX = startX + x;
        const tileY = startY + y;
        newTiles.push({
          x: tileX,
          y: tileY,
          url: getMapTileUrl(tileX, tileY, zoom)
        });
      }
    }
    
    setTiles(newTiles);
  }, [mapCenter, zoom]);
  
  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    
    const rect = mapContainerRef.current.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    
    const { lat: clickedLat, lon: clickedLon } = pixelToLatLon(
      pixelX,
      pixelY,
      rect.width,
      rect.height,
      mapCenter.lat,
      mapCenter.lon,
      zoom
    );
    
    onLocationSelect(clickedLat, clickedLon);
  }, [mapCenter, zoom, onLocationSelect]);
  
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 1, 18));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 1, 3));
  }, []);
  
  // Calculate tile positions for rendering - improved accuracy with zoom
  const getTilePosition = useCallback((tileX: number, tileY: number) => {
    const tileSize = 256;
    
    // Get the exact world pixel coordinates of the center point at current zoom
    const centerPixel = latLonToPixel(mapCenter.lat, mapCenter.lon, zoom);
    
    // Calculate the world pixel coordinates of this tile's CENTER (not top-left)
    // Since tiles are 256x256, the center is at tileX * tileSize + tileSize/2
    const tileCenterWorldX = tileX * tileSize + tileSize / 2;
    const tileCenterWorldY = tileY * tileSize + tileSize / 2;
    
    // Calculate offset from center in world pixel coordinates
    // The center point should be at the center of the container (50%, 50%)
    // So we offset tiles so the center point appears at container center
    const offsetX = tileCenterWorldX - centerPixel.x;
    const offsetY = tileCenterWorldY - centerPixel.y;
    
    // Position tile so its CENTER is offset from container center
    // Using calc(50% + offset) with translate(-50%, -50%) ensures center point is at 50%/50%
    return {
      left: `calc(50% + ${offsetX}px)`,
      top: `calc(50% + ${offsetY}px)`
    };
  }, [mapCenter, zoom]);

  // Helper functions to get color based on weather data
  const getPrecipitationColor = useCallback((chanceOfRain: number): string => {
    if (chanceOfRain < 30) return 'rgba(224, 242, 254, 0.6)'; // Light blue
    if (chanceOfRain < 60) return 'rgba(2, 132, 199, 0.7)'; // Medium blue
    return 'rgba(12, 74, 110, 0.8)'; // Dark blue
  }, []);

  const getTemperatureColor = useCallback((temp: number): string => {
    if (temp < 0) return 'rgba(14, 165, 233, 0.7)'; // Cold blue
    if (temp < 15) return 'rgba(59, 130, 246, 0.7)'; // Cool blue
    if (temp < 25) return 'rgba(251, 191, 36, 0.7)'; // Warm yellow
    return 'rgba(239, 68, 68, 0.7)'; // Hot red
  }, []);

  const getWindColor = useCallback((windSpeed: number): string => {
    if (windSpeed < 10) return 'rgba(243, 244, 246, 0.6)'; // Calm gray
    if (windSpeed < 25) return 'rgba(96, 165, 250, 0.7)'; // Moderate blue
    return 'rgba(30, 64, 175, 0.8)'; // Strong dark blue
  }, []);

  // Generate weather markers based on forecast data
  const getWeatherMarkers = useCallback(() => {
    if (mapType === 'base' || !weatherData.forecast) return [];

    const markers: Array<{ lat: number; lon: number; color: string; size: number; value: number; label: string }> = [];
    const forecastDays = weatherData.forecast.forecastday.slice(0, 5);

    // Create markers in a circular pattern around the center
    forecastDays.forEach((day, index) => {
      const angle = (index / forecastDays.length) * 2 * Math.PI;
      const radius = 0.05; // ~5km radius
      
      // Calculate offset lat/lon
      const latOffset = radius * Math.cos(angle);
      const lonOffset = radius * Math.sin(angle) / Math.cos(mapCenter.lat * Math.PI / 180);
      
      const markerLat = mapCenter.lat + latOffset;
      const markerLon = mapCenter.lon + lonOffset;

      let color = '';
      let value = 0;
      let label = '';

      if (mapType === 'precipitation') {
        value = day.day.daily_chance_of_rain;
        color = getPrecipitationColor(value);
        label = `${value}%`;
      } else if (mapType === 'temp') {
        value = (day.day.maxtemp_c + day.day.mintemp_c) / 2;
        color = getTemperatureColor(value);
        label = `${Math.round(value)}°C`;
      } else if (mapType === 'wind') {
        // Use current wind speed for all markers (forecast doesn't include daily wind)
        value = weatherData.current.wind_kph;
        color = getWindColor(value);
        label = `${Math.round(value)} km/h`;
      }

      markers.push({
        lat: markerLat,
        lon: markerLon,
        color,
        size: 40 + (value / 100) * 40, // Size based on intensity
        value,
        label
      });
    });

    return markers;
  }, [mapType, weatherData.forecast, mapCenter, getPrecipitationColor, getTemperatureColor, getWindColor]);

  const weatherMarkers = getWeatherMarkers();
  
  return (
    <div className="weather-map-container">
      <h3>Weather Map</h3>
      
      <div className="map-controls">
        <div className="map-type-selector">
          <button 
            className={mapType === 'base' ? 'active' : ''} 
            onClick={() => setMapType('base')}
            aria-label="Base map"
          >
            Base Map
          </button>
          <button 
            className={mapType === 'precipitation' ? 'active' : ''} 
            onClick={() => setMapType('precipitation')}
            aria-label="Precipitation overlay"
          >
            Precipitation
          </button>
          <button 
            className={mapType === 'temp' ? 'active' : ''} 
            onClick={() => setMapType('temp')}
            aria-label="Temperature overlay"
          >
            Temperature
          </button>
          <button 
            className={mapType === 'wind' ? 'active' : ''} 
            onClick={() => setMapType('wind')}
            aria-label="Wind overlay"
          >
            Wind
          </button>
        </div>
        
        <div className="zoom-controls">
          <button 
            onClick={handleZoomOut}
            aria-label="Zoom out"
            disabled={zoom <= 3}
          >
            −
          </button>
          <span className="zoom-level">Zoom: {zoom}</span>
          <button 
            onClick={handleZoomIn}
            aria-label="Zoom in"
            disabled={zoom >= 18}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Weather Map Legend */}
      {mapType !== 'base' && (
        <div className="map-legend">
          <h4>Legend</h4>
          {mapType === 'precipitation' && (
            <div className="legend-content">
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'linear-gradient(to right, #e0f2fe, #0284c7, #0c4a6e)' }}></div>
                <span>Precipitation Intensity (mm/h)</span>
              </div>
              <div className="legend-scale">
                <span>Light</span>
                <span>Moderate</span>
                <span>Heavy</span>
              </div>
            </div>
          )}
          {mapType === 'temp' && (
            <div className="legend-content">
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'linear-gradient(to right, #0ea5e9, #fbbf24, #ef4444)' }}></div>
                <span>Temperature (°C)</span>
              </div>
              <div className="legend-scale">
                <span>Cold</span>
                <span>Moderate</span>
                <span>Hot</span>
              </div>
            </div>
          )}
          {mapType === 'wind' && (
            <div className="legend-content">
              <div className="legend-item">
                <div className="legend-color" style={{ background: 'linear-gradient(to right, #f3f4f6, #60a5fa, #1e40af)' }}></div>
                <span>Wind Speed (km/h)</span>
              </div>
              <div className="legend-scale">
                <span>Calm</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
            </div>
          )}
          <p className="legend-note">
            Weather patterns shown based on 5-day forecast data from WeatherAPI.com.
          </p>
        </div>
      )}
      
      <div 
        ref={mapContainerRef}
        className="map-container" 
        onClick={handleMapClick}
        role="button"
        tabIndex={0}
        aria-label="Interactive weather map. Click to select a location."
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            // Center click on Enter/Space
            onLocationSelect(mapCenter.lat, mapCenter.lon);
          }
        }}
      >
        <div className="map-tiles-container">
          {/* Base map tiles */}
          {tiles.map((tile) => {
            const position = getTilePosition(tile.x, tile.y);
            return (
              <img
                key={`base-${tile.x}-${tile.y}-${zoom}`}
                src={tile.url}
                alt=""
                className="map-tile map-tile-base"
                style={{
                  position: 'absolute',
                  left: position.left,
                  top: position.top,
                  transform: 'translate(-50%, -50%)',
                  width: '256px',
                  height: '256px'
                }}
                loading="lazy"
              />
            );
          })}
          
          {/* Weather markers based on forecast data */}
          {weatherMarkers.map((marker, index) => {
            const markerPixel = latLonToPixel(marker.lat, marker.lon, zoom);
            const centerPixel = latLonToPixel(mapCenter.lat, mapCenter.lon, zoom);
            
            // Calculate position relative to container center
            const offsetX = markerPixel.x - centerPixel.x;
            const offsetY = markerPixel.y - centerPixel.y;
            
            return (
              <div
                key={`marker-${mapType}-${index}`}
                className="weather-marker"
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${offsetX}px)`,
                  top: `calc(50% + ${offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: `${marker.size}px`,
                  height: `${marker.size}px`,
                  borderRadius: '50%',
                  backgroundColor: marker.color,
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                  pointerEvents: 'none',
                  zIndex: 10
                }}
                title={marker.label}
              >
                {marker.size > 50 && marker.label}
              </div>
            );
          })}
        </div>
        
        {/* Center marker - positioned at the exact geographic center */}
        <div 
          className="map-center-marker"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15
          }}
        />
        
        {/* Click indicator */}
        <div className="map-overlay">
          <p className="map-instructions">Click on the map to get weather for a specific location</p>
        </div>
      </div>
      
      <div className="map-footer">
        <p>Map centered on {weatherData.location.name}, {weatherData.location.country}</p>
        <p className="map-coordinates">Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lon.toFixed(4)}</p>
      </div>
    </div>
  );
});

WeatherMap.displayName = 'WeatherMap';

export default WeatherMap; 