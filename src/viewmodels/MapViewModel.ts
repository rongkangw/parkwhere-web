"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import toGeoJson from "@/app/utils/toGeoJson";
import ParkingSpot from "@/core/constants/ParkingSpot";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  FOCUS_DURATION,
  FOCUS_ZOOM,
  MAP_LAYER_ID,
} from "@/core/constants/map/MapConstants";

type UseMapViewModelArgs = {
  racks: ParkingSpot[];
  onCameraMove: (latitude: number, longitude: number) => void;
};

export default function useMapViewModel({
  racks,
  onCameraMove,
}: UseMapViewModelArgs) {
  const mapRef = useRef<MapRef | null>(null);
  const [cameraLatitude, setCameraLatitude] = useState(DEFAULT_LATITUDE);
  const [cameraLongitude, setCameraLongitude] = useState(DEFAULT_LONGITUDE);
  const [selectedRack, setSelectedRack] = useState<ParkingSpot | null>(null);

  const parkingGeoJson = useMemo(() => toGeoJson(racks), [racks]);

  const setCameraPosition = useCallback(
    (latitude: number, longitude: number) => {
      setCameraLatitude(latitude);
      setCameraLongitude(longitude);
    },
    [],
  );

  const handleMarkerClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const clickedFeature = event.features?.find(
        (feature) => feature.layer.id === MAP_LAYER_ID,
      );

      if (!clickedFeature) return;

      const rack = racks.find(
        (item) => item.id === String(clickedFeature.properties?.id),
      );
      if (!rack) return;

      setSelectedRack(rack);
      setCameraPosition(rack.lat, rack.lng);

      mapRef.current?.flyTo({
        center: [rack.lng, rack.lat],
        zoom: FOCUS_ZOOM,
        duration: FOCUS_DURATION,
        essential: true,
      });
    },
    [racks, setCameraPosition],
  );

  const handlePopupClose = useCallback(() => {
    setSelectedRack(null);
  }, []);

  const handleMoveEnd = useCallback(
    (event: { viewState: { latitude: number; longitude: number } }) => {
      const { latitude, longitude } = event.viewState;
      setCameraPosition(latitude, longitude);
      onCameraMove(latitude, longitude);
    },
    [onCameraMove, setCameraPosition],
  );

  return {
    mapRef,
    cameraLatitude,
    cameraLongitude,
    selectedRack,
    parkingGeoJson,
    setCameraPosition,
    handleMoveEnd,
    handleMarkerClick,
    handlePopupClose,
  };
}
