import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Route, Clock, Loader2, History } from 'lucide-react';
import './Dashboard.css';
import { GoogleAuthProvider, signOut, getAuth } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';



// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Dashboard = () => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const [showRecentLocations, setShowRecentLocations] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const apiKey = import.meta.env.VITE_OPENROUTESERVICE_API_KEY;
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      const auth = getAuth(); // ✅ call getAuth() here
      await signOut(auth);    // ✅ pass auth instance to signOut
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };




  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLocations');
    if (saved) {
      try {
        setRecentLocations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent locations:', error);
      }
    }
  }, []);

  // Save location to recent locations
  const saveToRecentLocations = (location) => {
    if (!location || !location.trim()) return;

    const newRecentLocations = [
      location,
      ...recentLocations.filter(loc => loc !== location)
    ].slice(0, 10);

    setRecentLocations(newRecentLocations);
    localStorage.setItem('recentLocations', JSON.stringify(newRecentLocations));
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      try {
        // Create map with proper configuration
        const map = L.map(mapContainerRef.current, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          zoomControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true
        });

        mapRef.current = map;

        // Add zoom control to bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 2
        }).addTo(map);

        // Custom marker icons
        const createCustomIcon = (color, isStart = false) => {
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color}; 
                width: 24px; 
                height: 24px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
              ">
                ${isStart ? 'A' : 'B'}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          });
        };

        // Store custom icons on map instance
        map.customIcons = {
          start: createCustomIcon('#10B981', true),
          end: createCustomIcon('#EF4444', false)
        };

        // Force map to resize after a short delay
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        console.log('Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, []);

  // Resize map when container size changes
  useEffect(() => {
    const resizeMap = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', resizeMap);
    return () => window.removeEventListener('resize', resizeMap);
  }, []);

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Search for locations
  const searchLocations = async (query) => {
    if (!query || !query.trim() || query.length < 2) return [];

    try {
      setSearchLoading(true);
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&size=8&boundary.country=IN,US,GB,CA,AU`
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();

      if (data && data.features && Array.isArray(data.features) && data.features.length > 0) {
        return data.features.map(feature => ({
          label: feature.properties?.label || 'Unknown location',
          coordinates: feature.geometry?.coordinates || [0, 0]
        }));
      }
      return [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setSearchLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchLocations, 300), [apiKey]);

  const handleFromChange = async (value) => {
    setFrom(value);
    setActiveInput('from');

    if (value && value.length >= 2) {
      const suggestions = await searchLocations(value); // Use your API function
      setFromSuggestions(suggestions);
      setShowFromSuggestions(suggestions.length > 0);
      setShowRecentLocations(false);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
      if (value.length === 0) {
        setShowRecentLocations(recentLocations.length > 0);
      }
    }
  };


 const handleToChange = async (value) => {
  setTo(value);
  setActiveInput('to');

  if (value && value.length >= 2) {
    try {
      setSearchLoading(true);
    const suggestions = await searchLocations(value.trim());
      const validSuggestions = Array.isArray(suggestions) ? suggestions : [];

      setToSuggestions(validSuggestions);
      setShowToSuggestions(validSuggestions.length > 0);
      setShowRecentLocations(false);
    } catch (error) {
      console.error('Error fetching suggestions for "To":', error);
      setToSuggestions([]);
      setShowToSuggestions(false);
    } finally {
      setSearchLoading(false);
    }
  } else {
    setToSuggestions([]);
    setShowToSuggestions(false);
    if (value.trim().length === 0) {
      setShowRecentLocations(recentLocations.length > 0);
    }
  }
};



  // Handle input focus
  const handleInputFocus = (inputType) => {
    setActiveInput(inputType);
    if (inputType === 'from') {
      if (from.length === 0 && recentLocations.length > 0) {
        setShowRecentLocations(true);
        setShowFromSuggestions(false);
      } else if (fromSuggestions.length > 0) {
        setShowFromSuggestions(true);
        setShowRecentLocations(false);
      }
    } else if (inputType === 'to') {
      if (to.length === 0 && recentLocations.length > 0) {
        setShowRecentLocations(true);
        setShowToSuggestions(false);
      } else if (toSuggestions.length > 0) {
        setShowToSuggestions(true);
        setShowRecentLocations(false);
      }
    }
  };

  // Select suggestion functions
  const selectFromSuggestion = (suggestion) => {
    if (suggestion && suggestion.label) {
      setFrom(suggestion.label);
      saveToRecentLocations(suggestion.label);
      setFromSuggestions([]);
      setShowFromSuggestions(false);
      setShowRecentLocations(false);
    }
  };

  const selectToSuggestion = (suggestion) => {
    if (suggestion && suggestion.label) {
      setTo(suggestion.label);
      saveToRecentLocations(suggestion.label);
      setToSuggestions([]);
      setShowToSuggestions(false);
      setShowRecentLocations(false);
    }
  };

  const selectRecentLocation = (location) => {
    if (activeInput === 'from') {
      setFrom(location);
    } else if (activeInput === 'to') {
      setTo(location);
    }
    setShowRecentLocations(false);
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
  };

  // Geocode function
  const geocode = async (place) => {
    if (!place || !place.trim()) {
      throw new Error('Invalid location: empty place name');
    }

    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(place)}`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    if (data && data.features && Array.isArray(data.features) && data.features.length > 0) {
      return data.features[0].geometry.coordinates;
    }
    throw new Error(`Invalid location: ${place}`);
  };

  // Reverse geocode function
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();
      return data?.features?.[0]?.properties?.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Get current location
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const label = await reverseGeocode(latitude, longitude);
          setFrom(label);
          saveToRecentLocations(label);
          setFromSuggestions([]);
          setShowFromSuggestions(false);
          setShowRecentLocations(false);

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
          }
        } catch (err) {
          alert('Failed to get location details.');
          console.error(err);
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        alert('Location permission denied or unavailable.');
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle route calculation
  const handleRoute = async () => {
    if (!from || !from.trim() || !to || !to.trim()) {
      alert('Please enter both from and to locations.');
      return;
    }

    if (!mapRef.current) {
      alert('Map is not ready. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setDistance('');
    setDuration('');

    try {
      const originCoords = await geocode(from);
      const destinationCoords = await geocode(to);

      saveToRecentLocations(from);
      saveToRecentLocations(to);

      const routeResponse = await fetch(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
          method: 'POST',
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [originCoords, destinationCoords],
          }),
        }
      );

      if (!routeResponse.ok) throw new Error('Route request failed');
      const routeData = await routeResponse.json();

      const map = mapRef.current;

      // Clear existing layers except base tile layer
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer instanceof L.GeoJSON || layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Draw route with custom styling
      L.geoJSON(routeData, {
        style: {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        },
      }).addTo(map);

      const [originLng, originLat] = originCoords;
      const [destLng, destLat] = destinationCoords;

      // Add custom markers
      L.marker([originLat, originLng], { icon: map.customIcons.start })
        .addTo(map)
        .bindPopup(`<div class="popup-content start"><strong>Start:</strong><br>${from}</div>`)
        .openPopup();

      L.marker([destLat, destLng], { icon: map.customIcons.end })
        .addTo(map)
        .bindPopup(`<div class="popup-content end"><strong>End:</strong><br>${to}</div>`);

      // Fit bounds with padding
      map.fitBounds([
        [originLat, originLng],
        [destLat, destLng],
      ], { padding: [50, 50] });

      const summary = routeData.features[0].properties.summary;
      setDistance((summary.distance / 1000).toFixed(2));

      const totalMinutes = Math.round(summary.duration / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      let durationStr = '';
      if (hours > 0) durationStr += `${hours}h `;
      if (minutes > 0 || hours === 0) durationStr += `${minutes}m`;
      setDuration(durationStr.trim());

    } catch (err) {
      console.error(err);
      alert('Could not fetch route. Please check the location names and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.suggestion-container')) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
        setShowRecentLocations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-title">
            <div className="header-icon">
              <Navigation size={24} />
            </div>
            <h1>Route Finder</h1>
          </div>
          <button onClick={handleSignOut} className="signout-btn">Sign Out</button>

        </div>
      </div>

      <div className="main-content">
        {/* Route Form */}
        <div className="form-section">
          <div className="form-container">
            <h2 className="form-title">
              <Route size={20} />
              Plan Your Route
            </h2>

            {/* From Input */}
            <div className="input-group suggestion-container">
              <label className="input-label">From</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={from}
                  onChange={(e) => handleFromChange(e.target.value)}
                  placeholder="From location"
                  className="location-input" // optional if you're styling inputs
                />

                {showFromSuggestions && (
                  <div className="suggestions-dropdown">
                    {fromSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => {
                          setFrom(suggestion.label);
                          setShowFromSuggestions(false);
                          // You can also set coordinates if needed:
                          // setFromCoordinates(suggestion.coordinates);
                        }}
                      >
                        {/* Optional icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          width="20"
                          height="20"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 12.414m0 0l-4.243-4.243a4 4 0 115.656 5.656z"
                          />
                        </svg>
                        <span>{suggestion.label}</span>
                      </div>
                    ))}
                  </div>
                )}


</div>




                {/* Recent Locations */}
                {showRecentLocations && activeInput === 'from' && recentLocations.length > 0 && (
                  <div className="suggestions-dropdown">
                    <div className="recent-header">
                      <History size={16} />
                      <span>Recent Locations</span>
                    </div>
                    {recentLocations.map((location, index) => (
                      <div
                        key={index}
                        className="suggestion-item recent-item"
                        onClick={() => selectRecentLocation(location)}
                      >
                        <History size={16} />
                        <span>{location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Use My Location Button */}
              <button
                onClick={useMyLocation}
                disabled={locationLoading}
                className="location-btn"
              >
                {locationLoading ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <Navigation size={16} />
                )}
                {locationLoading ? 'Getting Location...' : 'Use My Location'}
              </button>

              {/* To Input */}
<div className="input-group suggestion-container">
  <label className="input-label">To</label>
  <div className="input-wrapper">
    <input
      type="text"
      placeholder="Enter destination..."
      value={to}
      onChange={(e) => handleToChange(e.target.value)}
      onFocus={() => handleInputFocus('to')}
      className="location-input destination"
    />
    <MapPin className="input-icon destination-icon" size={16} />
  </div>

  {/* To Suggestions */}
  {showToSuggestions && (
    <div className="suggestions-dropdown">
      {searchLoading ? (
        <div className="suggestion-item loading">
          <Loader2 size={16} className="spinner" />
          <span>Searching...</span>
        </div>
      ) : toSuggestions.length === 0 ? (
        <div className="suggestion-item loading">No destinations found</div>
      ) : (
        toSuggestions.map((suggestion, index) => (
          <div
            key={index}
            className="suggestion-item"
            onClick={() => selectToSuggestion(suggestion)}
          >
            <MapPin size={16} />
            <span>{suggestion.label}</span>
          </div>
        ))
      )}
    </div>
  )}


                {/* Recent Locations */}
                {showRecentLocations && activeInput === 'to' && recentLocations.length > 0 && (
                  <div className="suggestions-dropdown">
                    <div className="recent-header">
                      <History size={16} />
                      <span>Recent Locations</span>
                    </div>
                    {recentLocations.map((location, index) => (
                      <div
                        key={index}
                        className="suggestion-item recent-item"
                        onClick={() => selectRecentLocation(location)}
                      >
                        <History size={16} />
                        <span>{location}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Get Route Button */}
              <button
                onClick={handleRoute}
                disabled={loading || !from.trim() || !to.trim()}
                className="route-btn"
              >
                {loading ? (
                  <Loader2 size={20} className="spinner" />
                ) : (
                  <Route size={20} />
                )}
                {loading ? 'Calculating Route...' : 'Get Route'}
              </button>

              {/* Route Info */}
              {distance && duration && (
                <div className="route-info">
                  <h3>Route Details</h3>
                  <div className="route-stats">
                    <div className="stat-item">
                      <div className="stat-icon distance">
                        <Route size={16} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Distance</div>
                        <div className="stat-value distance-value">{distance} km</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon duration">
                        <Clock size={16} />
                      </div>
                      <div className="stat-content">
                        <div className="stat-label">Duration</div>
                        <div className="stat-value duration-value">{duration}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="map-section">
            <div className="map-container">
              <div
                ref={mapContainerRef}
                className="map"
                style={{ height: '100%', minHeight: '600px' }}
              />
            </div>
          </div>
        </div>
      </div>
      );
};

      export default Dashboard;