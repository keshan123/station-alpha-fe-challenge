import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { WeatherData } from '../App';
import { getMapTileUrl, getWeatherbitMapTileUrl, pixelToLatLon, deg2num, latLonToPixel } from '../services/weatherApi';

interface WeatherMapProps {
  weatherData: WeatherData;
  onLocationSelect: (lat: number, lon: number) => void;
}

const WeatherMap = memo(({ weatherData, onLocationSelect }: WeatherMapProps) => {
  const [zoom, setZoom] = useState<number>(10);
  const [mapType, setMapType] = useState<'base' | 'precipitation' | 'temp' | 'wind'>('base');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState<Array<{ x: number; y: number; url: string }>>([]);
  const [overlayTiles, setOverlayTiles] = useState<Array<{ x: number; y: number; url: string }>>([]);
  const [overlayError, setOverlayError] = useState<string | null>(null);
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
    
    // Generate weather overlay tiles from Weatherbit.io if a weather overlay is selected
    if (mapType !== 'base') {
      const newOverlayTiles: Array<{ x: number; y: number; url: string }> = [];
      for (let y = 0; y < tilesY; y++) {
        for (let x = 0; x < tilesX; x++) {
          const tileX = startX + x;
          const tileY = startY + y;
          const overlayUrl = getWeatherbitMapTileUrl(
            tileX,
            tileY,
            zoom,
            mapType as 'precipitation' | 'temp' | 'wind'
          );
          newOverlayTiles.push({
            x: tileX,
            y: tileY,
            url: overlayUrl
          });
        }
      }
      setOverlayTiles(newOverlayTiles);
      setOverlayError(null); // Clear any previous errors when switching map types
      console.log(`Loading ${mapType} overlay tiles:`, newOverlayTiles.length, 'tiles');
    } else {
      setOverlayTiles([]);
      setOverlayError(null);
    }
  }, [mapCenter, zoom, mapType]);
  
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
                <div className="legend-color" style={{ background: 'linear-gradient(to right, #a7f3d0, #10b981, #047857, #064e3b)' }}></div>
                <span>Precipitation Intensity (Categorical: Rain, Freezing Rain/Sleet, Snow)</span>
              </div>
              <div className="legend-scale">
                <span>Light</span>
                <span>Moderate</span>
                <span>Heavy</span>
                <span>Very Heavy</span>
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
                <span>Satellite (Infrared) - Cloud patterns indicate wind flow</span>
              </div>
              <div className="legend-scale">
                <span>Clear</span>
                <span>Cloudy</span>
                <span>Dense Clouds</span>
              </div>
            </div>
          )}
          {overlayError && (
            <p className="legend-error" style={{ color: '#d32f2f', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {overlayError}
            </p>
          )}
          {!overlayError && (
            <p className="legend-note">
              Real-time weather map data provided by Weatherbit.io.
            </p>
          )}
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
          
          {/* Weather overlay tiles from Weatherbit.io */}
          {overlayTiles.map((tile) => {
            const position = getTilePosition(tile.x, tile.y);
            // Adjust opacity based on map type for better visibility
            const opacity = mapType === 'temp' ? 0.8 : mapType === 'precipitation' ? 0.75 : 0.7;
            return (
              <img
                key={`overlay-${tile.x}-${tile.y}-${zoom}-${mapType}`}
                src={tile.url}
                alt={`${mapType} weather overlay`}
                className="map-tile map-tile-overlay"
                style={{
                  position: 'absolute',
                  left: position.left,
                  top: position.top,
                  transform: 'translate(-50%, -50%)',
                  width: '256px',
                  height: '256px',
                  opacity: opacity,
                  pointerEvents: 'none',
                  zIndex: 3,
                  imageRendering: 'auto'
                }}
                loading="lazy"
                crossOrigin="anonymous"
                onError={(e) => {
                  // Track overlay tile errors
                  const img = e.target as HTMLImageElement;
                  console.error(`Failed to load ${mapType} tile:`, tile.url);
                  img.style.display = 'none';
                  
                  // Set error message if not already set
                  if (!overlayError) {
                    setOverlayError(`Weather overlay tiles unavailable for ${mapType}. The API key may need activation or a paid subscription may be required.`);
                  }
                }}
                onLoad={() => {
                  // Clear error if tiles load successfully
                  console.log(`Successfully loaded ${mapType} tile:`, tile.url);
                  if (overlayError) {
                    setOverlayError(null);
                  }
                }}
              />
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