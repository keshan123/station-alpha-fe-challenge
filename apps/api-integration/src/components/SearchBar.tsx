import { useState, useEffect, FormEvent, useRef, KeyboardEvent } from 'react';
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isNavigatingWithKeyboard, setIsNavigatingWithKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        // Automatically show suggestions when they're fetched and there are results
        if (results.length > 0) {
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Calculate total items for keyboard navigation
  const getTotalItems = () => {
    let total = 0;
    if (hasSuggestions) total += suggestions.length;
    if (shouldShowHistoryOnly || shouldShowHistoryBelow) total += searchHistory.length;
    return total;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      addToSearchHistory(query);
      setShowSuggestions(false);
      setShowHistory(false);
      setFocusedIndex(-1);
    }
  };

  const selectItem = (item: string) => {
    setQuery(item);
    onSearch(item);
    addToSearchHistory(item);
    setShowSuggestions(false);
    setShowHistory(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    selectItem(suggestion);
  };

  const handleHistoryClick = (historyItem: string) => {
    selectItem(historyItem);
  };

  // Get the item at a specific index (considering both suggestions and history)
  const getItemAtIndex = (index: number): string | null => {
    if (hasSuggestions && index < suggestions.length) {
      return suggestions[index].name;
    }
    const historyIndex = hasSuggestions ? index - suggestions.length : index;
    if (shouldShowHistoryOnly || shouldShowHistoryBelow) {
      if (historyIndex >= 0 && historyIndex < searchHistory.length) {
        return searchHistory[historyIndex].query;
      }
    }
    return null;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const totalItems = getTotalItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsNavigatingWithKeyboard(true);
        setFocusedIndex((prev) => {
          const next = prev < totalItems - 1 ? prev + 1 : 0;
          return next;
        });
        setShowSuggestions(true);
        setShowHistory(true);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setIsNavigatingWithKeyboard(true);
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : totalItems - 1;
          return next;
        });
        break;
      
      case 'Enter':
        if (focusedIndex >= 0) {
          e.preventDefault();
          const item = getItemAtIndex(focusedIndex);
          if (item) {
            selectItem(item);
          }
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setShowHistory(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
      
      case 'Tab':
        setShowSuggestions(false);
        setShowHistory(false);
        setFocusedIndex(-1);
        break;
      
      default:
        setIsNavigatingWithKeyboard(false);
        setFocusedIndex(-1);
    }
  };

  // Determine if we should show the dropdown
  const hasSuggestions = query.length >= 2 && suggestions.length > 0;
  const shouldShowHistoryOnly = query.length < 2 && searchHistory.length > 0;
  const shouldShowHistoryBelow = hasSuggestions && showHistory && searchHistory.length > 0;
  const showDropdown = (showSuggestions || showHistory) && (hasSuggestions || shouldShowHistoryOnly);

  // Reset focused index when dropdown changes
  useEffect(() => {
    if (!showDropdown) {
      setFocusedIndex(-1);
    }
  }, [showDropdown]);

  // Get the active descendant ID for ARIA
  const getActiveDescendantId = () => {
    if (focusedIndex < 0) return undefined;
    if (hasSuggestions && focusedIndex < suggestions.length) {
      return `suggestion-${focusedIndex}`;
    }
    const historyIndex = hasSuggestions ? focusedIndex - suggestions.length : focusedIndex;
    return `history-${historyIndex}`;
  };

  // Search icon SVG
  const SearchIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  );

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form" role="search" aria-label="Weather location search">
        <div className="search-input-wrapper">
          <label htmlFor="weather-search-input" className="visually-hidden">
            Search for weather by city name or zip code
          </label>
          <input
            id="weather-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setShowSuggestions(true);
              setShowHistory(true);
            }}
            onBlur={(e) => {
              // Check if focus is moving to an element within the dropdown
              const relatedTarget = e.relatedTarget as HTMLElement;
              const isMovingToDropdown = dropdownRef.current?.contains(relatedTarget);
              
              // Delay hiding to allow clicks on dropdown items, but not if navigating with keyboard or moving to dropdown
              if (!isNavigatingWithKeyboard && !isMovingToDropdown) {
                setTimeout(() => {
                  setShowSuggestions(false);
                  setShowHistory(false);
                  setFocusedIndex(-1);
                  setIsNavigatingWithKeyboard(false);
                }, 200);
              }
            }}
            placeholder="Search for a city or zip code..."
            className="search-input"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls={showDropdown ? "search-dropdown" : undefined}
            aria-activedescendant={showDropdown ? getActiveDescendantId() : undefined}
            aria-label="Search for weather by city name or zip code"
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="search-button"
            aria-label="Search for weather"
          >
            <span className="search-button-text">Search</span>
            <span className="search-button-icon" aria-hidden="true">
              <SearchIcon />
            </span>
          </button>
        </div>

        {/* Combined dropdown with suggestions and recent searches */}
        {showDropdown && (
          <div 
            id="search-dropdown"
            ref={dropdownRef}
            className="search-dropdown"
            role="listbox"
            aria-label="Search suggestions and recent searches"
            onMouseDown={(e) => {
              // Prevent input blur when clicking on dropdown
              e.preventDefault();
            }}
          >
            {/* Suggestions section - shown when query has 2+ characters */}
            {hasSuggestions && (
              <ul 
                className="suggestions-list"
                role="group"
                aria-label={`${suggestions.length} location suggestions`}
              >
                {suggestions.map((suggestion, index) => {
                  const itemIndex = index;
                  const isFocused = focusedIndex === itemIndex;
                  return (
                    <li
                      key={suggestion.id || suggestion.name}
                      id={`suggestion-${itemIndex}`}
                      role="option"
                      aria-selected={isFocused}
                      tabIndex={-1}
                      onClick={() => handleSuggestionClick(suggestion.name)}
                      onMouseEnter={() => {
                        setIsNavigatingWithKeyboard(false);
                        setFocusedIndex(itemIndex);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSuggestionClick(suggestion.name);
                        }
                      }}
                      className={`suggestion-item ${isFocused ? 'focused' : ''}`}
                    >
                      {suggestion.name}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Recent searches section - shown when query is short OR below suggestions */}
            {(shouldShowHistoryOnly || shouldShowHistoryBelow) && (
              <div className="search-history-section">
                <h4 className="search-history-header" id="recent-searches-heading">
                  Recent Searches
                </h4>
                <ul 
                  className="history-list"
                  role="group"
                  aria-labelledby="recent-searches-heading"
                  aria-label={`${searchHistory.length} recent searches`}
                >
                  {searchHistory.map((item, index) => {
                    const itemIndex = hasSuggestions ? suggestions.length + index : index;
                    const isFocused = focusedIndex === itemIndex;
                    return (
                      <li
                        key={index}
                        id={`history-${index}`}
                        role="option"
                        aria-selected={isFocused}
                        tabIndex={-1}
                        onClick={() => handleHistoryClick(item.query)}
                        onMouseEnter={() => {
                          setIsNavigatingWithKeyboard(false);
                          setFocusedIndex(itemIndex);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleHistoryClick(item.query);
                          }
                        }}
                        className={`history-item ${isFocused ? 'focused' : ''}`}
                      >
                        {item.query}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Screen reader announcements */}
        {showDropdown && (
          <div 
            className="visually-hidden" 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
          >
            {hasSuggestions && `${suggestions.length} location suggestions available. Use arrow keys to navigate.`}
            {(shouldShowHistoryOnly || shouldShowHistoryBelow) && `${searchHistory.length} recent searches available.`}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar; 