import { WeatherData } from '../App';

interface CurrentWeatherProps {
  weatherData: WeatherData;
}

const CurrentWeather = ({ weatherData }: CurrentWeatherProps) => {
  const { location, current } = weatherData;

  // Ensure icon URL has protocol (WeatherAPI.com may return protocol-relative URLs)
  const iconUrl = current.condition.icon?.startsWith('//') 
    ? `https:${current.condition.icon}` 
    : current.condition.icon;

  return (
    <div className="current-weather-container">
      <div className="location-info">
        <h2>{location.name}</h2>
        <p className="country">{location.country}</p>
      </div>

      <div className="weather-main">
        <img 
          src={iconUrl} 
          alt={current.condition.text} 
          className="weather-icon" 
        />
        <div className="temperature">
          <span className="temp-value">{Math.round(current.temp_c)}</span>
          <span className="temp-unit">°C</span>
        </div>
        <p className="condition">{current.condition.text}</p>
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-label">Feels Like</span>
          <span className="detail-value">{Math.round(current.feelslike_c)}°C</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind</span>
          <span className="detail-value">{current.wind_kph} km/h ({current.wind_dir})</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">{current.humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">UV Index</span>
          <span className="detail-value">{current.uv}</span>
        </div>
      </div>

      <div className="last-updated">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default CurrentWeather; 