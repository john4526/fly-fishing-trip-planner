"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./Dashboard.module.css";
import { 
  Waves, 
  CloudSun, 
  Star, 
  MapPin, 
  Wind, 
  Droplets, 
  LogOut, 
  User, 
  Lock, 
  Mail, 
  Compass, 
  RefreshCw, 
  Info,
  ChevronLeft,
  Fish,
  Gauge,
  Cloud,
  CloudRain
} from "lucide-react";

export default function CorridorDetails({ corridor, stateId, stateName }) {
  const { user, signup, login, logout, favorites, toggleFavorite } = useAuth();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeAccessPoint, setActiveAccessPoint] = useState(corridor.accessPoints[0]);
  const [activeGaugeId, setActiveGaugeId] = useState(corridor.gaugeId);
  const [mapMode, setMapMode] = useState("satellite"); // 'satellite' or 'terrain'
  const [showStocking, setShowStocking] = useState(false);
  const [stockingRecords, setStockingRecords] = useState([]);

  const mapIframeRef = useRef(null);


  
  // API States
  const [riverData, setRiverData] = useState(null);
  const [riverLoading, setRiverLoading] = useState(true);
  const [riverError, setRiverError] = useState(null);

  const [additionalRiverData, setAdditionalRiverData] = useState([]);
  const [additionalRiverLoading, setAdditionalRiverLoading] = useState(false);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  // Auth Card state
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Compute all available gauges
  const allGauges = [];
  if (riverData) {
    allGauges.push({ ...riverData, name: `${corridor.name} (Primary)`, isPrimary: true });
  }
  if (additionalRiverData.length > 0) {
    allGauges.push(...additionalRiverData);
  }

  // Current active gauge data
  const activeGaugeData = allGauges.find(g => g.siteId === activeGaugeId) || riverData;

  // Send update message to Leaflet iframe when active spot or map mode changes
  useEffect(() => {
    if (mapIframeRef.current && activeAccessPoint) {
      const timer = setTimeout(() => {
        mapIframeRef.current?.contentWindow?.postMessage({
          type: "update_map",
          lat: activeAccessPoint.latitude,
          lon: activeAccessPoint.longitude,
          mode: mapMode,
          name: activeAccessPoint.name,
          gauges: allGauges.filter(g => g.latitude && g.longitude).map(g => ({
            id: g.siteId,
            name: g.name,
            lat: g.latitude,
            lon: g.longitude,
            isActive: g.siteId === activeGaugeId
          }))
        }, "*");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeAccessPoint, mapMode, activeTab, activeGaugeId, allGauges.length]);

  // Sync fish stocking layer with map iframe
  useEffect(() => {
    if (mapIframeRef.current) {
      const timer = setTimeout(() => {
        mapIframeRef.current?.contentWindow?.postMessage({
          type: "update_stocking",
          records: stockingRecords,
          visible: showStocking
        }, "*");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stockingRecords, showStocking, activeTab]);

  // Helper: Wind degree to direction
  const getWindDirection = (deg) => {
    if (deg === undefined) return "N/A";
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round((deg % 360) / 45) % 8;
    return directions[index];
  };

  // Fetch details for active corridor
  const fetchRiverData = useCallback(async () => {
    setRiverLoading(true);
    setRiverError(null);
    try {
      const res = await fetch(`/api/river?siteId=${corridor.gaugeId}`);
      if (!res.ok) throw new Error("Failed to fetch streamflow data");
      const data = await res.json();
      setRiverData(data);
    } catch (err) {
      setRiverError(err.message);
    } finally {
      setRiverLoading(false);
    }
  }, [corridor.gaugeId]);

  const fetchAdditionalRiverData = useCallback(async () => {
    if (!corridor.additionalGauges || corridor.additionalGauges.length === 0) {
      setAdditionalRiverData([]);
      return;
    }
    setAdditionalRiverLoading(true);
    try {
      const promises = corridor.additionalGauges.map(gauge => 
        fetch(`/api/river?siteId=${gauge.id}`).then(res => {
          if (!res.ok) throw new Error("Failed");
          return res.json().then(data => ({ ...data, name: gauge.name }));
        }).catch(err => null)
      );
      const results = await Promise.all(promises);
      setAdditionalRiverData(results.filter(r => r !== null));
    } catch (err) {
      console.error("Error fetching additional gauges:", err);
    } finally {
      setAdditionalRiverLoading(false);
    }
  }, [corridor.additionalGauges]);

  const fetchWeatherData = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(`/api/weather?lat=${corridor.latitude}&lon=${corridor.longitude}`);
      if (!res.ok) throw new Error("Failed to fetch weather conditions");
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  }, [corridor.latitude, corridor.longitude]);

  const fetchReviewsData = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const res = await fetch(`/api/reviews?query=${encodeURIComponent(corridor.googlePlaceQuery)}&riverId=${corridor.id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviewsData(data);
    } catch (err) {
      setReviewsError(err.message);
    } finally {
      setReviewsLoading(false);
    }
  }, [corridor.googlePlaceQuery, corridor.id]);

  const fetchStockingData = useCallback(async () => {
    try {
      const res = await fetch(`/api/stocking?riverId=${corridor.id}`);
      if (res.ok) {
        const data = await res.json();
        setStockingRecords(data);
      }
    } catch (e) {
      console.error("Error fetching stocking data:", e);
    }
  }, [corridor.id]);

  useEffect(() => {
    fetchRiverData();
    fetchAdditionalRiverData();
    fetchWeatherData();
    fetchReviewsData();
    fetchStockingData();
    setShowAuthWarning(false);
    if (corridor.accessPoints && corridor.accessPoints.length > 0) {
      setActiveAccessPoint(corridor.accessPoints[0]);
    }
  }, [corridor, fetchRiverData, fetchWeatherData, fetchReviewsData, fetchStockingData]);

  // Auth handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isSignUp) {
        await signup(authEmail, authPassword);
      } else {
        await login(authEmail, authPassword);
      }
      setAuthEmail("");
      setAuthPassword("");
      setShowAuthWarning(false);
    } catch (err) {
      if (err.message.includes("email-already-in-use")) {
        setAuthError("Email is already registered.");
      } else if (err.message.includes("invalid-credential") || err.message.includes("wrong-password") || err.message.includes("user-not-found")) {
        setAuthError("Invalid email or password.");
      } else if (err.message.includes("weak-password")) {
        setAuthError("Password must be at least 6 characters.");
      } else {
        setAuthError("An error occurred during authentication.");
      }
    }
  };

  // Determine flow safety status
  const getFlowStatus = (flow, range) => {
    if (flow === null || flow === undefined) return { label: "Unknown", class: "", percent: 0 };
    
    const { min, max } = range;
    const padding = (max - min) * 0.5; // Padding for the visual bar limit
    const minLimit = Math.max(0, min - padding);
    const maxLimit = max + padding;
    
    let percent = ((flow - minLimit) / (maxLimit - minLimit)) * 100;
    percent = Math.max(0, Math.min(100, percent));

    if (flow >= min && flow <= max) {
      return { label: "Optimal Flow", class: styles.badgeOptimal, percent, color: "var(--color-optimal)" };
    } else if (flow > maxLimit) {
      return { label: "Unsafe / High", class: styles.badgeUnsafe, percent, color: "var(--color-unsafe)" };
    } else if (flow < minLimit) {
      return { label: "Too Low", class: styles.badgeUnsafe, percent, color: "var(--color-unsafe)" };
    } else if (flow > max) {
      return { label: "High / Marginal", class: styles.badgeMarginal, percent, color: "var(--color-marginal)" };
    } else {
      return { label: "Low / Marginal", class: styles.badgeMarginal, percent, color: "var(--color-marginal)" };
    }
  };

  const flowStatus = activeGaugeData ? getFlowStatus(activeGaugeData.flow, corridor.flowRange) : null;
  const isFavorite = favorites.includes(corridor.id);

  const handleFavoriteClick = () => {
    if (!user) {
      setShowAuthWarning(true);
      return;
    }
    toggleFavorite(corridor.id);
  };

  return (
    <div className={styles.detailContainer}>
      {/* Top Navigation */}
      <nav className={styles.topNav}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div className={styles.brand}>
            <Compass size={28} />
            <span>StreamPlanner</span>
          </div>

          <Link
            href={`/states/${stateId}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s",
              textDecoration: "none"
            }}
          >
            <ChevronLeft size={14} />
            Back to {stateName} Map
          </Link>
        </div>

        {/* User Account Section */}
        <div className={styles.authSection} style={{ border: "none", padding: 0, minWidth: "220px" }}>
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div className={styles.userInfo}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", maxWidth: "150px" }}>
                  <span className={styles.userEmail} title={user.email}>{user.email}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>Logged In</span>
                </div>
                <button onClick={logout} className={styles.btnText} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.authContainer}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-main)" }}>
                <User size={14} />
                {isSignUp ? "Create Account" : "Sign In to Save Spots"}
              </h3>
              <form onSubmit={handleAuthSubmit} className={styles.authForm} style={{ flexDirection: "row", flexWrap: "wrap", width: "300px" }}>
                <div style={{ position: "relative", flex: "1", minWidth: "140px" }}>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)} 
                    required 
                    style={{ width: "100%", paddingLeft: "1.75rem" }}
                  />
                  <Mail size={12} style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
                <div style={{ position: "relative", flex: "1", minWidth: "140px" }}>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    required 
                    style={{ width: "100%", paddingLeft: "1.75rem" }}
                  />
                  <Lock size={12} style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                </div>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                  <div className={styles.authToggleText}>
                    {isSignUp ? (
                      <span>Have an account? <span onClick={() => { setIsSignUp(false); setAuthError(""); }}>Log In</span></span>
                    ) : (
                      <span>New? <span onClick={() => { setIsSignUp(true); setAuthError(""); }}>Sign Up</span></span>
                    )}
                  </div>
                  <button type="submit" className={styles.authSubmitBtn} style={{ padding: "0.35rem 1rem" }}>
                    {isSignUp ? "Sign Up" : "Log In"}
                  </button>
                </div>
                {authError && <span className={styles.authError} style={{ width: "100%", marginTop: "0.25rem" }}>{authError}</span>}
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Main Dashboard Panel */}
      <main className={styles.main}>
        {/* Header Block */}
        <section className={styles.header}>
          <div className={styles.headerInfo}>
            <h1>{corridor.name}</h1>
            <div className={styles.speciesContainer}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontSize: "0.85rem", marginRight: "0.5rem" }}>
                <MapPin size={14} /> {corridor.location}, {stateName}
              </span>
              {corridor.species.map((s, idx) => (
                <span key={idx} className={styles.speciesBadge}>
                  <Fish size={12} style={{ marginRight: "0.25rem", display: "inline" }} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <button 
              onClick={handleFavoriteClick} 
              className={`${styles.saveBtn} ${isFavorite ? styles.saveBtnActive : ""}`}
              title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
            >
              <Star size={20} fill={isFavorite ? "#fbbf24" : "none"} />
            </button>
            {showAuthWarning && (
              <span className={styles.authError} style={{ fontSize: "0.75rem", width: "160px", textAlign: "right" }}>
                Please sign in to save your favorite spots.
              </span>
            )}
          </div>
        </section>

        {/* Tab Switcher */}
        <div className={styles.tabContainer}>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`${styles.tabBtn} ${activeTab === "dashboard" ? styles.tabBtnActive : ""}`}
          >
            <Waves size={16} /> Conditions & Reports
          </button>
          <button 
            onClick={() => setActiveTab("maps")} 
            className={`${styles.tabBtn} ${activeTab === "maps" ? styles.tabBtnActive : ""}`}
          >
            <MapPin size={16} /> Access & Maps
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className={styles.dashboardGrid}>
            
            {/* USGS River Flow Card */}
            <div className={`${styles.card} glass`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                  <Waves size={18} style={{ color: "var(--color-primary)" }} />
                  Live USGS River Gage
                </h2>
                {allGauges.length > 1 && (
                  <select 
                    value={activeGaugeId} 
                    onChange={(e) => setActiveGaugeId(e.target.value)}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    {allGauges.map(g => (
                      <option key={g.siteId} value={g.siteId} style={{ color: "#000" }}>
                        {g.name} ({g.siteId})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {riverLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                </div>
              ) : riverError ? (
                <div className={styles.loadingContainer} style={{ flexDirection: "column", gap: "0.5rem" }}>
                  <Info size={24} style={{ color: "var(--color-unsafe)" }} />
                  <span style={{ fontSize: "0.9rem" }}>Error loading gage: {riverError}</span>
                  <button onClick={() => { fetchRiverData(); fetchAdditionalRiverData(); }} className={styles.btnText} style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : activeGaugeData ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div className={styles.flowStats}>
                    <span className={styles.flowValue}>
                      {activeGaugeData.flow !== null ? activeGaugeData.flow : "N/A"}
                    </span>
                    <span className={styles.flowLabel}>
                      Streamflow ({activeGaugeData.flowUnit})
                    </span>
                    {flowStatus && (
                      <span className={`${styles.flowBadge} ${flowStatus.class}`}>
                        {flowStatus.label}
                      </span>
                    )}
                  </div>

                  {/* Progress bar visual range indicator */}
                  {flowStatus && activeGaugeData.flow !== null && (
                    <div className={styles.progressBarContainer}>
                      <div className={styles.progressBarTrack}>
                        <div 
                          className={styles.optimalZoneIndicator}
                          style={{
                            left: "25%",
                            right: "25%"
                          }}
                        ></div>
                        <div 
                          className={styles.progressBarFill}
                          style={{
                            width: `${flowStatus.percent}%`,
                            backgroundColor: flowStatus.color
                          }}
                        ></div>
                      </div>
                      <div className={styles.progressLabelContainer}>
                        <span>Low Flow</span>
                        <span style={{ fontWeight: "700", color: "var(--color-optimal)" }}>
                          Optimal ({corridor.flowRange.min} - {corridor.flowRange.max} cfs)
                        </span>
                        <span>High Flow</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.flowGageMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaVal}>
                        {activeGaugeData.height !== null ? `${activeGaugeData.height} ${activeGaugeData.heightUnit}` : "N/A"}
                      </span>
                      <span className={styles.metaLabel}>Gage Height</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaVal}>
                        {activeGaugeData.timestamp ? new Date(activeGaugeData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                      </span>
                      <span className={styles.metaLabel}>Last Measured</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Weather Card */}
            <div className={`${styles.card} glass`}>
              <h2 className={styles.cardTitle}>
                <CloudSun size={18} style={{ color: "var(--color-primary)" }} />
                Weather Forecast
              </h2>

              {weatherLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                </div>
              ) : weatherError ? (
                <div className={styles.loadingContainer} style={{ flexDirection: "column", gap: "0.5rem" }}>
                  <Info size={24} style={{ color: "var(--color-unsafe)" }} />
                  <span style={{ fontSize: "0.9rem" }}>Error loading weather: {weatherError}</span>
                  <button onClick={fetchWeatherData} className={styles.btnText} style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className={styles.weatherMain}>
                    <div className={styles.weatherLeft}>
                      <div style={{ fontSize: "2.5rem" }}>
                        {weatherData.current.main === "Rain" ? "🌧️" : weatherData.current.main === "Clouds" ? "⛅" : "☀️"}
                      </div>
                      <span className={styles.weatherTemp}>{Math.round(weatherData.current.temp)}°F</span>
                    </div>
                    <div className={styles.weatherInfo}>
                      <span className={styles.weatherDesc}>{weatherData.current.description}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Feels like {Math.round(weatherData.current.feelsLike)}°F</span>
                    </div>
                  </div>

                  <div className={styles.weatherDetailsGrid}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Wind size={16} style={{ color: "var(--color-primary)" }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                          {weatherData.current.windSpeed} mph {getWindDirection(weatherData.current.windDeg)}
                          {weatherData.current.windGust > 0 && ` (Gusts: ${Math.round(weatherData.current.windGust)} mph)`}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Wind & Gusts</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Droplets size={16} style={{ color: "var(--color-primary)" }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>{weatherData.current.humidity}%</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Humidity</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Gauge size={16} style={{ color: "var(--color-primary)" }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                          {weatherData.current.pressure ? `${Math.round(weatherData.current.pressure)} hPa` : "N/A"}
                          {weatherData.current.pressureTendency && ` (${weatherData.current.pressureTendency})`}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Barometer</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Cloud size={16} style={{ color: "var(--color-primary)" }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                          {weatherData.current.cloudCover !== undefined ? `${weatherData.current.cloudCover}%` : "N/A"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cloud Cover</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <CloudRain size={16} style={{ color: "var(--color-primary)" }} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                          {weatherData.current.precipitation !== undefined ? `${weatherData.current.precipitation} in` : "0 in"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Precipitation</span>
                      </div>
                    </div>
                  </div>

                  {/* Golden Hours Section */}
                  {weatherData.current.sunrise && weatherData.current.sunset && (
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "rgba(148, 163, 184, 0.03)", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border-card)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--color-optimal)" }}>🌅 Sunrise:</span>
                        <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                          {new Date(weatherData.current.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "var(--color-unsafe)" }}>🌇 Sunset:</span>
                        <span style={{ fontWeight: "600", color: "var(--text-main)" }}>
                          {new Date(weatherData.current.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={styles.forecastSection}>
                    <span className={styles.forecastTitle}>Upcoming Conditions</span>
                    <div className={styles.forecastScroll}>
                      {weatherData.forecast.slice(0, 8).map((item, idx) => {
                        const timeString = new Date(item.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true });
                        return (
                          <div key={idx} className={styles.forecastItem}>
                            <span className={styles.forecastTime}>{timeString}</span>
                            <span style={{ fontSize: "1.2rem" }}>
                              {item.main === "Rain" ? "🌧️" : item.main === "Clouds" ? "⛅" : "☀️"}
                            </span>
                            <span className={styles.forecastTemp}>{Math.round(item.temp)}°F</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Provider Info */}
                  {weatherData.provider && (
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "right", marginTop: "-0.5rem" }}>
                      Source: {weatherData.provider}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* River Details & Destination Information */}
            <div className={`${styles.card} glass`}>
              <h2 className={styles.cardTitle}>
                <Info size={18} style={{ color: "var(--color-primary)" }} />
                Stream Profile & Access Info
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", lineHeight: "1.5" }}>
                <p style={{ fontSize: "0.95rem" }}>
                  {corridor.description}
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--text-muted)" }}>TROUT SPECIES IN SEASON</span>
                  <ul style={{ listStyleType: "none", display: "flex", gap: "0.5rem" }}>
                    {corridor.species.map((s, i) => (
                      <li key={i} style={{ fontSize: "0.85rem", background: "var(--bg-page)", border: "1px solid var(--border-card)", borderRadius: "4px", padding: "0.2rem 0.5rem", fontWeight: "600" }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stocking Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "750", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    🐟 LATEST STATE STOCKING REPORTS
                  </span>
                  {stockingRecords && stockingRecords.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                      {stockingRecords.map((rec, i) => (
                        <div key={i} style={{ fontSize: "0.8rem", borderBottom: i < stockingRecords.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", paddingBottom: i < stockingRecords.length - 1 ? "0.5rem" : 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                            <span>{rec.locationName}</span>
                            <span style={{ color: "var(--color-primary)" }}>{rec.year}</span>
                          </div>
                          <div style={{ color: "var(--text-muted)", marginTop: "0.15rem" }}>
                            {rec.quantity.toLocaleString()} {rec.species} ({rec.lifeStage}) from {rec.hatchery}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No active stocking records found for this river. Managed for wild populations or warmwater species.
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <Info size={16} style={{ color: "var(--color-marginal)", flexShrink: 0, marginTop: "0.1rem" }} />
                  <div>
                    <strong style={{ color: "var(--text-main)" }}>Wading Safety Note:</strong> Keep checking gauge trends. Rising water levels can increase stream flow velocities, making wading extremely dangerous. Stay alert.
                  </div>
                </div>
              </div>
            </div>

            {/* Google Places Reviews Card */}
            <div className={`${styles.card} glass`}>
              <h2 className={styles.cardTitle}>
                <Star size={18} style={{ color: "var(--color-primary)" }} />
                Angler Reports & Reviews
              </h2>

              {reviewsLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                </div>
              ) : reviewsError ? (
                <div className={styles.loadingContainer} style={{ flexDirection: "column", gap: "0.5rem" }}>
                  <Info size={24} style={{ color: "var(--color-unsafe)" }} />
                  <span style={{ fontSize: "0.9rem" }}>Error loading reports: {reviewsError}</span>
                  <button onClick={fetchReviewsData} className={styles.btnText} style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {reviewsData.rating && (
                    <div className={styles.reviewsSummary}>
                      <span className={styles.ratingValue}>{reviewsData.rating}</span>
                      <div className={styles.ratingStars}>
                        <div className={styles.starsRow}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < Math.round(reviewsData.rating) ? "#fbbf24" : "none"} 
                              stroke="#fbbf24" 
                            />
                          ))}
                        </div>
                        <span className={styles.ratingCount}>Based on {reviewsData.userRatingCount} Local Guides</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.reviewsList}>
                    {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
                      reviewsData.reviews.map((review, idx) => (
                        <div key={idx} className={styles.reviewItem}>
                          <div className={styles.reviewHeader}>
                            <span className={styles.reviewAuthor}>{review.author}</span>
                            <span className={styles.reviewTime}>{review.time}</span>
                          </div>
                          <div style={{ display: "flex", gap: "0.1rem", color: "#fbbf24", marginBottom: "0.2rem" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                size={10} 
                                fill={i < review.rating ? "#fbbf24" : "none"} 
                                stroke="#fbbf24" 
                              />
                            ))}
                          </div>
                          <p className={styles.reviewText}>"{review.text}"</p>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        No recent reviews found for this access spot. Be the first to add one!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === "maps" && (
          <div className={styles.dashboardGrid}>
            {/* Access points selector card */}
            <div className={`${styles.card} glass`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-card)", paddingBottom: "0.75rem", marginBottom: "1rem", width: "100%" }}>
                <h2 className={styles.cardTitle} style={{ borderBottom: "none", paddingBottom: 0, margin: 0 }}>
                  <MapPin size={18} style={{ color: "var(--color-primary)" }} />
                  River Access Spots
                </h2>
                <button
                  onClick={() => setShowStocking(prev => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    padding: "0.35rem 0.65rem",
                    borderRadius: "6px",
                    border: "1px solid var(--border-card)",
                    background: showStocking ? "rgba(34, 197, 94, 0.15)" : "rgba(255,255,255,0.02)",
                    color: showStocking ? "#4ade80" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  title="Toggle Fish Stocking Markers on Map"
                >
                  🐟 {showStocking ? "Stocking: ON" : "Stocking: OFF"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                  Select an access point to view coordinates, parking limits, and live directions:
                </span>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {corridor.accessPoints && corridor.accessPoints.map((spot) => {
                    const isSelected = activeAccessPoint?.id === spot.id;
                    return (
                      <div 
                        key={spot.id}
                        onClick={() => setActiveAccessPoint(spot)}
                        className={`${styles.riverItem} ${isSelected ? styles.riverItemActive : ""}`}
                        style={{ border: "1px solid var(--border-card)", background: isSelected ? "var(--bg-page)" : "rgba(255,255,255,0.01)" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", maxWidth: "85%" }}>
                          <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{spot.name}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Parking: {spot.parkingCapacity}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {spot.type === "parking" ? "🚗" : "🎣"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeAccessPoint && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", borderTop: "1px solid var(--border-card)", paddingTop: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "750" }}>{activeAccessPoint.name} Details</h3>
                    <p style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>{activeAccessPoint.notes}</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "0.75rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>LOCAL REGULATIONS</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", color: activeAccessPoint.regulations.includes("Release") ? "var(--color-marginal)" : "inherit" }}>
                        {activeAccessPoint.regulations}
                      </span>
                    </div>

                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeAccessPoint.latitude},${activeAccessPoint.longitude}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.authSubmitBtn}
                      style={{ textAlign: "center", textDecoration: "none", display: "inline-block" }}
                    >
                      Get Driving Directions
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Google Maps embed card */}
            <div className={`${styles.card} glass`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-card)", paddingBottom: "0.75rem" }}>
                <h2 className={styles.cardTitle} style={{ borderBottom: "none", paddingBottom: 0, margin: 0 }}>
                  <Compass size={18} style={{ color: "var(--color-primary)" }} />
                  River Map View
                </h2>
                <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "0.15rem" }}>
                  <button
                    onClick={() => setMapMode("satellite")}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      background: mapMode === "satellite" ? "var(--color-primary)" : "transparent",
                      color: mapMode === "satellite" ? "#ffffff" : "var(--text-muted)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setMapMode("terrain")}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      background: mapMode === "terrain" ? "var(--color-primary)" : "transparent",
                      color: mapMode === "terrain" ? "#ffffff" : "var(--text-muted)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Topo / Terrain
                  </button>
                </div>
              </div>
              {activeAccessPoint ? (
                <div style={{ width: "100%", height: "100%", minHeight: "450px", position: "relative", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border-card)" }}>
                  <iframe
                    ref={mapIframeRef}
                    title={`${activeAccessPoint.name} Map`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "450px" }}
                    loading="lazy"
                    allowFullScreen
                    src={`/map.html?lat=${activeAccessPoint.latitude}&lon=${activeAccessPoint.longitude}&mode=${mapMode}&name=${encodeURIComponent(activeAccessPoint.name)}&v=20260719_1`}
                  ></iframe>
                </div>
              ) : (
                <div className={styles.loadingContainer}>
                  <span>Select an access point to display map.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
