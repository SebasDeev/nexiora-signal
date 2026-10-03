import { useState } from "react";

import type { Coordinates } from "@/types/location";

export function useLocation() {

  const [userLocation, setUserLocation] =
    useState<Coordinates | null>(null);

  const [selectedLocation, setSelectedLocation] =
    useState<Coordinates | null>(null);

  return {

    userLocation,

    selectedLocation,

    setUserLocation,

    setSelectedLocation,

  };

}
