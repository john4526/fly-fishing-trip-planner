import Link from "next/link";
import { Compass, MapPin, ArrowRight } from "lucide-react";
import { STATES } from "@/config/rivers";

export default function Home() {
  const statesList = Object.values(STATES);

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <Compass style={styles.logoIcon} size={32} />
          <span style={styles.logoText}>Fly Fishing Trip Planner</span>
        </div>
      </header>

      <section style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Explore Premier Fly Fishing Corridors</h1>
        <p style={styles.heroSubtitle}>
          Select a state below to view real-time water levels, weather forecasts, access points, and stocking information.
        </p>
      </section>

      <div style={styles.grid}>
        {statesList.map((state) => (
          <Link key={state.id} href={`/states/${state.id}`} style={styles.cardWrapper}>
            <div className="glass glass-interactive" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.pinContainer}>
                  <MapPin size={20} style={styles.pinIcon} />
                  <span style={styles.stateAbbr}>{state.abbr}</span>
                </div>
                <span style={styles.corridorCount}>
                  {state.corridors.length} {state.corridors.length === 1 ? "Corridor" : "Corridors"}
                </span>
              </div>
              <h2 style={styles.stateName}>{state.name}</h2>
              <p style={styles.stateDescription}>{state.description}</p>
              <div style={styles.cardFooter}>
                <span style={styles.exploreLink}>
                  Explore State Map
                  <ArrowRight size={16} style={styles.arrowIcon} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem 1.5rem",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logoIcon: {
    color: "#64748b",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-main)",
    letterSpacing: "-0.025em",
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxWidth: "800px",
  },
  heroTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    lineHeight: "1.2",
    color: "var(--text-main)",
    letterSpacing: "-0.025em",
  },
  heroSubtitle: {
    fontSize: "1.125rem",
    lineHeight: "1.6",
    color: "var(--text-muted)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "2rem",
    width: "100%",
  },
  cardWrapper: {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    padding: "2rem",
    width: "100%",
    minHeight: "280px",
    cursor: "pointer",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  pinContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    padding: "0.25rem 0.5rem",
    borderRadius: "8px",
  },
  pinIcon: {
    color: "#64748b",
  },
  stateAbbr: {
    fontSize: "0.875rem",
    fontWeight: "700",
    color: "#64748b",
  },
  corridorCount: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-muted)",
  },
  stateName: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--text-main)",
    marginBottom: "0.75rem",
    letterSpacing: "-0.02em",
  },
  stateDescription: {
    fontSize: "0.95rem",
    lineHeight: "1.5",
    color: "var(--text-muted)",
    flexGrow: 1,
    marginBottom: "1.5rem",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  exploreLink: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--color-primary-hover)",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    transition: "gap 0.2s ease",
  },
  arrowIcon: {
    transition: "transform 0.2s ease",
  },
};
