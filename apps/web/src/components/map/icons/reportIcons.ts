import L from "leaflet";

import type { Severity } from "@/types/report";

function markerColor(severity: Severity) {
  switch (severity) {
    case "LOW":
      return "#22c55e";

    case "MEDIUM":
      return "#eab308";

    case "HIGH":
      return "#f97316";

    case "CRITICAL":
      return "#ef4444";

    default:
      return "#2563eb";
  }
}

export function getMarkerIcon(
  severity: Severity,
) {
  return L.divIcon({
    className: "",

    html: `
      <div
        style="
          width:22px;
          height:22px;
          border-radius:999px;
          background:${markerColor(severity)};
          border:4px solid white;
          box-shadow:0 8px 18px rgba(0,0,0,.25);
        "
      ></div>
    `,

    iconSize: [22, 22],

    iconAnchor: [11, 11],
  });
}