import { useEffect } from 'react';
import { WeatherData } from '../App';

interface WeatherAlertModalProps {
  alerts: WeatherData['alerts'];
  onClose: () => void;
}

const WeatherAlertModal = ({ alerts, onClose }: WeatherAlertModalProps) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!alerts || !alerts.alert || alerts.alert.length === 0) {
    return null;
  }

  // Filter for severe/extreme/moderate alerts
  // Including 'moderate' for better demonstration and user awareness
  const severeAlerts = alerts.alert.filter(alert => {
    const severity = alert.severity?.toLowerCase();
    return severity === 'severe' || severity === 'extreme' || severity === 'moderate';
  });

  if (severeAlerts.length === 0) {
    return null;
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'extreme':
        return '#d32f2f'; // red
      case 'severe':
        return '#f44336'; // lighter red
      default:
        return '#ff9800'; // orange
    }
  };

  const formatAlertDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div 
      className="weather-alert-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div 
        className="weather-alert-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="weather-alert-modal-header">
          <h2 id="alert-modal-title">⚠️ Weather Alert</h2>
          <button 
            className="weather-alert-modal-close"
            onClick={onClose}
            aria-label="Close alert"
          >
            ×
          </button>
        </div>

        <div className="weather-alert-modal-content">
          {severeAlerts.map((alert, index) => {
            const severityColor = getSeverityColor(alert.severity);
            return (
              <div 
                key={index}
                className="weather-alert-modal-item"
                style={{ borderLeft: `4px solid ${severityColor}` }}
              >
                <div className="weather-alert-modal-item-header">
                  <h3 className="weather-alert-modal-headline">{alert.headline}</h3>
                  <span 
                    className="weather-alert-modal-severity"
                    style={{ backgroundColor: severityColor }}
                  >
                    {alert.severity}
                  </span>
                </div>

                <div className="weather-alert-modal-item-details">
                  <p className="weather-alert-modal-description">{alert.desc}</p>
                  {alert.areas && (
                    <p className="weather-alert-modal-areas">
                      <strong>Affected Areas:</strong> {alert.areas}
                    </p>
                  )}
                  <div className="weather-alert-modal-timing">
                    {alert.effective && (
                      <span>
                        <strong>Effective:</strong> {formatAlertDate(alert.effective)}
                      </span>
                    )}
                    {alert.expires && (
                      <span>
                        <strong>Expires:</strong> {formatAlertDate(alert.expires)}
                      </span>
                    )}
                  </div>
                  {alert.urgency && (
                    <p className="weather-alert-modal-urgency">
                      <strong>Urgency:</strong> {alert.urgency}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="weather-alert-modal-footer">
          <button 
            className="weather-alert-modal-button"
            onClick={onClose}
            autoFocus
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherAlertModal;

