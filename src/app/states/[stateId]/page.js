import layout from "./StatePage.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ArrowRight, Fish, MapPin } from "lucide-react";
import { STATES } from "@/config/rivers";
import StateVectorMap from "@/app/components/StateVectorMap";

export default async function StatePage({ params }) {
  const { stateId } = await params;
  const state = STATES[stateId];

  if (!state) {
    notFound();
  }

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>
          <ChevronLeft size={16} />
          Back to States
        </Link>
      </header>

      <section style={styles.heroSection}>
        <div style={styles.badge}>State Overview</div>
        <h1 style={styles.heroTitle}>{state.name} Fly Fishing</h1>
        <p style={styles.heroSubtitle}>{state.description}</p>
      </section>

      <div className={layout.columns}>
        {/* Map Section */}
        <div className={`glass ${layout.mapCard}`} style={styles.mapCard}>
          <h2 style={styles.cardTitle}>Interactive Corridor Map</h2>
          <p style={styles.cardSubtitle}>Select a highlighted river path for details, or choose a corridor from the list.</p>
          <div style={styles.mapContainer}>
            <StateVectorMap stateId={stateId} corridorIds={state.corridors.map(corridor => corridor.id)} />
          </div>
        </div>

        {/* Corridors List Section */}
        <div style={styles.listSection}>
          <h2 style={styles.listTitle}>River Corridors ({state.corridors.length})</h2>
          <div style={styles.grid}>
            {state.corridors.map((corridor) => (
              <Link
                key={corridor.id}
                href={`/states/${stateId}/corridors/${corridor.id}`}
                style={styles.cardWrapper}
              >
                <div className="glass glass-interactive" style={styles.corridorCard}>
                  <div className={layout.corridorHeader}>
                    <h3 style={styles.corridorName}>{corridor.name}</h3>
                    <div style={styles.locationContainer}>
                      <MapPin size={14} style={styles.locationIcon} />
                      <span style={styles.locationText}>{corridor.location}</span>
                    </div>
                  </div>

                  <p style={styles.corridorDescription}>
                    {corridor.description.length > 120
                      ? `${corridor.description.substring(0, 120)}...`
                      : corridor.description}
                  </p>

                  <div style={styles.speciesContainer}>
                    {corridor.species.map((sp, idx) => (
                      <span key={idx} style={styles.speciesBadge}>
                        <Fish size={12} style={styles.fishIcon} />
                        {sp}
                      </span>
                    ))}
                  </div>

                  <div style={styles.cardFooter}>
                    <span style={styles.viewDashboardText}>
                      View Dashboard
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
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
    gap: "2.5rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    transition: "color 0.2s ease",
    cursor: "pointer",
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75rem",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-primary-hover)",
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    padding: "0.25rem 0.75rem",
    borderRadius: "100px",
  },
  heroTitle: {
    fontSize: "2.25rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    color: "var(--text-main)",
  },
  heroSubtitle: {
    fontSize: "1.1rem",
    lineHeight: "1.5",
    color: "var(--text-muted)",
    maxWidth: "800px",
  },
  mapCard: {
    borderRadius: "16px",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-main)",
  },
  cardSubtitle: {
    fontSize: "0.875rem",
    color: "var(--text-muted)",
    marginBottom: "1.5rem",
  },
  mapContainer: {
    width: "100%",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "450px",
  },
  listSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  listTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "var(--text-main)",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  cardWrapper: {
    textDecoration: "none",
    color: "inherit",
  },
  corridorCard: {
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  corridorName: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "var(--text-main)",
  },
  locationContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    color: "var(--text-muted)",
  },
  locationIcon: {
    color: "#64748b",
  },
  locationText: {
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  corridorDescription: {
    fontSize: "0.9rem",
    lineHeight: "1.5",
    color: "var(--text-muted)",
  },
  speciesContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  speciesBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--color-primary-hover)",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
    border: "1px solid var(--border-card)",
  },
  fishIcon: {
    color: "var(--color-primary-hover)",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(148, 163, 184, 0.1)",
    paddingTop: "0.75rem",
    marginTop: "0.25rem",
  },
  viewDashboardText: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--color-primary-hover)",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
};
