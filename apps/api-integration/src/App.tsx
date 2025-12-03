import { useState, useEffect } from 'react'
import './App.css'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import Forecast from './components/Forecast'
import { getCurrentWeather, getWeatherForecast, WeatherAPIError } from './services/weatherApi'

// Types for weather data
export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_dir: string;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
      };
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      severity: string;
      urgency: string;
      areas: string;
      desc: string;
      effective: string;
      expires: string;
    }>;
  };
}

// Type for search history
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

function App() {
  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Search history
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(parsed);
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  // Handle search for weather data
  const handleSearch = async (location: string) => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch both current weather and 5-day forecast
      const forecastData = await getWeatherForecast(location, 5);
      setWeatherData(forecastData);
    } catch (err) {
      // Handle specific error types
      if (err instanceof WeatherAPIError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch weather data. Please try again.');
      }
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add search to history
  const addToSearchHistory = (query: string) => {
    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now()
    };

    setSearchHistory((prev) => {
      // Remove duplicates and keep only last 10 searches
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      return [newItem, ...filtered].slice(0, 10);
    });
  };

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lon: number) => {
    const location = `${lat},${lon}`;
    await handleSearch(location);
  };
  
  return (
    <div className="weather-app">
      <header className="app-header">
        <h1>Weather Dashboard</h1>
        <p className="app-description">
          Get real-time weather information for any location
        </p>
      </header>

      <main className="app-content">
        {/* Search Component */}
        <SearchBar 
          onSearch={handleSearch}
          searchHistory={searchHistory}
          addToSearchHistory={addToSearchHistory}
        />

        {/* Weather Display */}
        <div className="weather-display">
          {isLoading && <div className="loading">Loading weather data...</div>}
          
          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
              <p>Please try searching for a different location.</p>
            </div>
          )}
          
          {!isLoading && !error && !weatherData && (
            <div className="no-data">
              <p>Search for a location to see weather information</p>
              <p className="hint">Try searching for a city name, zip code, or coordinates</p>
            </div>
          )}
          
          {weatherData && !isLoading && (
            <div className="weather-content">
              {/* Current Weather */}
              <CurrentWeather weatherData={weatherData} />
              
              {/* Extended Forecast */}
              <Forecast weatherData={weatherData} />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Weather Dashboard | Powered by WeatherAPI.com
        </p>
      </footer>
    </div>
  );
}

export default App;
