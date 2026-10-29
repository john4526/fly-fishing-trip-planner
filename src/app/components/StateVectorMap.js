"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StateVectorMap({ stateId }) {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === "select_river_corridor") {
        router.push(`/states/${stateId}/corridors/${e.data.corridorId}`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [stateId, router]);

  return (
    <div style={styles.iframeWrapper}>
      <iframe
        src={`/state_map.html?stateId=${stateId}`}
        title={`${stateId} Geographic Map`}
        style={styles.iframe}
        loading="lazy"
      />
    </div>
  );
}

const styles = {
  iframeWrapper: {
    width: "100%",
    height: "100%",
    minHeight: "450px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid var(--border-card)",
    background: "#0f172a"
  },
  iframe: {
    width: "100%",
    height: "100%",
    minHeight: "450px",
    border: "none",
    display: "block"
  },
};
