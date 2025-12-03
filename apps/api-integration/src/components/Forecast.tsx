import { memo, useMemo } from 'react';
import { WeatherData } from '../App';

interface ForecastProps {
  weatherData: WeatherData;
}

const Forecast = memo(({ weatherData }: ForecastProps) => {
  // Check if forecast data exists
  if (!weatherData.forecast || !weatherData.forecast.forecastday) {
    return (
      <div className="forecast-container">
        <h3>Forecast</h3>
        <p className="no-forecast">No forecast data available</p>
      </div>
    );
  }

  // Format date to show day of week - memoized
  const formatDate = useMemo(() => (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }, []);

  // Ensure icon URL has protocol (WeatherAPI.com may return protocol-relative URLs) - memoized
  const getIconUrl = useMemo(() => (icon: string) => {
    return icon?.startsWith('//') ? `https:${icon}` : icon;
  }, []);

  return (
    <div className="forecast-container">
      <h3>5-Day Forecast</h3>
      
      <div className="forecast-cards">
        {weatherData.forecast.forecastday.map((day, index) => (
          <div key={index} className="forecast-day">
            <h4>{formatDate(day.date)}</h4>
            <img 
              src={getIconUrl(day.day.condition.icon)} 
              alt={day.day.condition.text} 
              className="forecast-icon" 
            />
            <div className="forecast-temps">
              <span className="max-temp">{Math.round(day.day.maxtemp_c)}°</span>
              <span className="min-temp">{Math.round(day.day.mintemp_c)}°</span>
            </div>
            <p className="forecast-condition">{day.day.condition.text}</p>
            <p className="rain-chance">
              <span className="rain-icon">💧</span> 
              {day.day.daily_chance_of_rain}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});

Forecast.displayName = 'Forecast';

export default Forecast; 