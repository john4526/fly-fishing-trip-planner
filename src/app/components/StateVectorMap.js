"use client";

import { useEffect, useRef } from "react";
import { trustedMessage } from "../../../public/maps/map-utils";
import { useRouter } from "next/navigation";

export default function StateVectorMap({ stateId, corridorIds }) {
  const router = useRouter();
  const frame = useRef(null);

  useEffect(() => {
    const handleMessage = (e) => {
      if (trustedMessage(e, frame.current?.contentWindow, window.location.origin, ["select_river_corridor"]) &&
          corridorIds.includes(e.data.corridorId)) {
        router.push(`/states/${stateId}/corridors/${e.data.corridorId}`);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [stateId, router, corridorIds]);

  return (
    <div style={styles.iframeWrapper}>
      <iframe ref={frame}
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
