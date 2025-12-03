import { useState, useEffect, FormEvent } from 'react';
import { SearchHistoryItem } from '../App';
import { searchLocations } from '../services/weatherApi';

interface SearchBarProps {
  onSearch: (location: string) => void;
  searchHistory: SearchHistoryItem[];
  addToSearchHistory: (query: string) => void;
}

const SearchBar = ({ onSearch, searchHistory, addToSearchHistory }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      addToSearchHistory(query);
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    addToSearchHistory(suggestion);
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    onSearch(historyItem);
    setShowSuggestions(false);
    setShowHistory(false);
  };

  // Determine if we should show the dropdown
  const hasSuggestions = query.length >= 2 && suggestions.length > 0;
  const shouldShowHistoryOnly = query.length < 2 && searchHistory.length > 0;
  const shouldShowHistoryBelow = hasSuggestions && showHistory && searchHistory.length > 0;
  const showDropdown = (showSuggestions || showHistory) && (hasSuggestions || shouldShowHistoryOnly);

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setShowSuggestions(true);
              setShowHistory(true);
            }}
            onBlur={() => {
              // Delay hiding to allow clicks on dropdown items
              setTimeout(() => {
                setShowSuggestions(false);
                setShowHistory(false);
              }, 200);
            }}
            placeholder="Search for a city or zip code..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </div>

        {/* Combined dropdown with suggestions and recent searches */}
        {showDropdown && (
          <div className="search-dropdown">
            {/* Suggestions section - shown when query has 2+ characters */}
            {hasSuggestions && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id || suggestion.name}
                    onClick={() => handleSuggestionClick(suggestion.name)}
                    className="suggestion-item"
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}

            {/* Recent searches section - shown when query is short OR below suggestions */}
            {(shouldShowHistoryOnly || shouldShowHistoryBelow) && (
              <div className="search-history-section">
                <h4 className="search-history-header">Recent Searches</h4>
                <ul className="history-list">
                  {searchHistory.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleHistoryClick(item.query)}
                      className="history-item"
                    >
                      {item.query}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar; 