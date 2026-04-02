"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import toGeoJson from "@/app/utils/toGeoJson";
import generateCityTileOverlay from "@/app/utils/getTilesForBounds";
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
  fetchedTileIds: Set<string>;
  initialCameraLatitude?: number;
  initialCameraLongitude?: number;
  onCameraMove: (latitude: number, longitude: number) => void;
};

export default function useMapViewModel({
  racks,
  fetchedTileIds,
  initialCameraLatitude = DEFAULT_LATITUDE,
  initialCameraLongitude = DEFAULT_LONGITUDE,
  onCameraMove,
}: UseMapViewModelArgs) {
  const mapRef = useRef<MapRef | null>(null);
  const [cameraLatitude, setCameraLatitude] = useState(initialCameraLatitude);
  const [cameraLongitude, setCameraLongitude] = useState(
    initialCameraLongitude,
  );
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);

  const parkingGeoJson = useMemo(() => toGeoJson(racks), [racks]);
  const tileGeoJson = useMemo(
    () => generateCityTileOverlay(fetchedTileIds),
    [fetchedTileIds],
  );
  const selectedRack = useMemo(
    () => racks.find((rack) => rack.id === selectedRackId) ?? null,
    [racks, selectedRackId],
  );

  const setCameraPosition = useCallback(
    (latitude: number, longitude: number) => {
      setCameraLatitude(latitude);
      setCameraLongitude(longitude);
    },
    [],
  );

  const focusOnCoordinates = useCallback(
    (latitude: number, longitude: number) => {
      setCameraPosition(latitude, longitude);
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: FOCUS_ZOOM,
        duration: FOCUS_DURATION,
        essential: true,
      });
    },
    [setCameraPosition],
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

      setSelectedRackId(rack.id);
      focusOnCoordinates(rack.lat, rack.lng);
    },
    [focusOnCoordinates, racks],
  );

  const handlePopupClose = useCallback(() => {
    setSelectedRackId(null);
  }, []);

  const handleMoveEnd = useCallback(
    (event: { viewState: { latitude: number; longitude: number } }) => {
      const { latitude, longitude } = event.viewState;
      setCameraPosition(latitude, longitude);
      onCameraMove(latitude, longitude);
    },
    [onCameraMove, setCameraPosition],
  );

  const handleMapLoad = useCallback(() => {
    focusOnCoordinates(initialCameraLatitude, initialCameraLongitude);
  }, [focusOnCoordinates, initialCameraLatitude, initialCameraLongitude]);

  return {
    mapRef,
    cameraLatitude,
    cameraLongitude,
    selectedRack,
    tileGeoJson,
    parkingGeoJson,
    setCameraPosition,
    focusOnCoordinates,
    handleMapLoad,
    handleMoveEnd,
    handleMarkerClick,
    handlePopupClose,
  };
}
