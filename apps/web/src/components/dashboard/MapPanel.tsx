import { BogotaMap } from "@/components/map/BogotaMap";

import type { Coordinates } from "@/types/location";
import type { Report } from "@/types/report";

interface MapPanelProps {
  reports: Report[];
  selectedLocation: Coordinates | null;
  onLocationSelected: (position: Coordinates) => void;
  onUserLocationChange: (position: Coordinates) => void;
}

export function MapPanel({
  reports,
  selectedLocation,
  onLocationSelected,
  onUserLocationChange,
}: MapPanelProps) {
  return (
    <section
      className="control-map-panel"
    >
      <BogotaMap
        reports={reports}
        selectedLocation={selectedLocation}
        onLocationSelected={onLocationSelected}
        onUserLocationChange={onUserLocationChange}
      />
    </section>
  );
}
