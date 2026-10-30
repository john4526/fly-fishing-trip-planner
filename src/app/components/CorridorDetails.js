"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import AccountPanel from "./AccountPanel";
import AccessMap from "./AccessMap";
import { useAuth } from "@/context/AuthContext";
import styles from "./Dashboard.module.css";
import { Waves, Star, MapPin, Compass, RefreshCw, Info, ChevronLeft, Fish } from "lucide-react";
import WeatherPanel from "./WeatherPanel";
import useResource from "@/hooks/useResource";
import RiverPanel from "./RiverPanel";
import { GAUGE_NAMES } from "@/config/gauges";

export default function CorridorDetails({ corridor, stateId, stateName }) {
  const { user, authEnabled, favorites, favoritesReady, favoritePending, toggleFavorite } = useAuth();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeAccessPoint, setActiveAccessPoint] = useState(corridor.accessPoints[0]);
  const [activeGaugeId, setActiveGaugeId] = useState(corridor.gaugeId);
  const [mapMode, setMapMode] = useState("satellite"); // 'satellite' or 'terrain'
  const [showStocking, setShowStocking] = useState(false);
  const river = useResource(!corridor.gaugeId || corridor.gaugeHistorical ? null : `/api/river?siteId=${corridor.gaugeId}`, 300000);
  const extra = useResource(corridor.additionalGauges?.length ? corridor.additionalGauges.map(g => `/api/river?siteId=${g.id}`) : null, 300000);
  const weather = useResource(`/api/weather?lat=${corridor.latitude}&lon=${corridor.longitude}`, 900000);
  const reviews = useResource(`/api/reviews?riverId=${corridor.id}`);
  const stocking = useResource(`/api/stocking?riverId=${corridor.id}`);
  const riverData = river.data;
  const reviewsData = reviews.data;
  const reviewsLoading = reviews.loading;
  const reviewsError = reviews.error;
  const stockingRecords = stocking.data || [];
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const allGauges = useMemo(() => [
    ...(riverData ? [{ ...riverData, name: GAUGE_NAMES[corridor.gaugeId] || corridor.gaugeName || corridor.name, isPrimary: true, flowRange: corridor.flowRange }] : []),
    ...(extra.data || []).filter(Boolean).map(g => {
      const config = corridor.additionalGauges.find(item => item.id === g.siteId);
      return { ...g, name: GAUGE_NAMES[g.siteId] || config.name, flowRange: config.flowRange };
    }),
  ], [riverData, extra.data, corridor]);
  const isFavorite = favorites.includes(corridor.id);

  const handleFavoriteClick = async () => {
    setFavoriteError('');
    if (!user) {
      setShowAuthWarning(true);
      return;
    }
    try { await toggleFavorite(corridor.id); } catch { setFavoriteError('Could not save your favorite. Please try again.'); }
  };

  return (
    <div className={styles.detailContainer}>
      {/* Top Navigation */}
      <nav className={styles.topNav}>
        <div className={styles.navLinks}>
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
          {stateId === 'pennsylvania' && <Link href="/plan" style={{ color: '#14566a', textDecoration: 'underline' }}>Two-outing planner</Link>}
        </div>

        {/* User Account Section */}
        <div className={styles.accountArea}>
          <AccountPanel />
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
              disabled={!authEnabled || favoritePending || (user && !favoritesReady)}
              aria-label={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
              onClick={handleFavoriteClick} 
              className={`${styles.saveBtn} ${isFavorite ? styles.saveBtnActive : ""}`}
              title={isFavorite ? "Remove from Favorites" : "Save to Favorites"}
            >
              <Star size={20} fill={isFavorite ? "#fbbf24" : "none"} />
            </button>
            {favoriteError && <span role="alert" className={styles.authError}>{favoriteError}</span>}
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
            
            <RiverPanel corridor={corridor} river={river} extra={extra} gauges={allGauges}
              activeGaugeId={activeGaugeId} onGaugeChange={setActiveGaugeId} />

            <WeatherPanel {...weather} />

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
                  <ul style={{ listStyleType: "none", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
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
                  {stocking.loading ? <span>Loading stocking records…</span> : stocking.error ? <span role="alert">Stocking records are unavailable. <button onClick={stocking.retry}>Retry</button></span> : stockingRecords.length > 0 ? (
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
                      No stocking records are available in this dataset for this river.
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
                Google Place Reviews
              </h2>

              {reviewsLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                </div>
              ) : reviewsError ? (
                <div className={styles.loadingContainer} style={{ flexDirection: "column", gap: "0.5rem" }}>
                  <Info size={24} style={{ color: "var(--color-unsafe)" }} />
                  <span style={{ fontSize: "0.9rem" }}>Error loading reports: {reviewsError}</span>
                  <button onClick={reviews.retry} className={styles.btnText} style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
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
                        <span className={styles.ratingCount}>Based on {reviewsData.userRatingCount} Google reviews</span>
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
                          <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {reviewsData.message || "No Google reviews found for this location."}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid var(--border-card)", paddingBottom: "0.75rem", marginBottom: "1rem", width: "100%" }}>
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
                      <button type="button" aria-pressed={isSelected}
                        key={spot.id}
                        onClick={() => setActiveAccessPoint(spot)}
                        className={`${styles.riverItem} ${isSelected ? styles.riverItemActive : ""}`}
                        style={{ color: "inherit", textAlign: "left", width: "100%", border: "1px solid var(--border-card)", background: isSelected ? "var(--bg-page)" : "rgba(255,255,255,0.01)" }}
                      >
                        <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem", maxWidth: "85%" }}>
                          <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{spot.name}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Parking: {spot.parkingCapacity}
                          </span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center" }}>
                          {spot.type === "parking" ? "🚗" : "🎣"}
                        </span>
                      </button>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid var(--border-card)", paddingBottom: "0.75rem" }}>
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
                  <AccessMap point={activeAccessPoint} mode={mapMode} gauges={allGauges}
                    gaugeId={activeGaugeId} records={stockingRecords} showStocking={showStocking} />
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
