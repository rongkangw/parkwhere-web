"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import parseGeoInput from "@/app/utils/parseGeoInput";
import getTileId from "@/app/utils/getTileId";
import toGeoJson from "@/app/utils/toGeoJson";
import generateTileOverlay from "@/app/utils/generateTileOverlay";
import ParkingSpot from "@/core/constants/ParkingSpot";
import useParkingSpots from "@/hooks/useParkingSpots";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  FOCUS_DURATION,
  MAP_CLUSTER_LAYER_ID,
  MAP_LAYER_ID,
  MAP_SOURCE_ID,
} from "@/core/constants/map/MapConstants";

type UseMapViewModelArgs = {
  initialQueryLocation?: {
    latitude: number;
    longitude: number;
  };
};

export default function useMapViewModel({
  initialQueryLocation,
}: UseMapViewModelArgs = {}) {
  const searchResults: string[] = [];
  const [queryLocation, setQueryLocation] = useState(
    initialQueryLocation ?? {
      latitude: DEFAULT_LATITUDE,
      longitude: DEFAULT_LONGITUDE,
    },
  );
  const queryTile = useRef<string>(
    getTileId(queryLocation.latitude, queryLocation.longitude),
  );
  const mapRef = useRef<MapRef | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [tileOverlayEnabled, setTileOverlayEnabled] = useState(false);

  const { data, error, isError, isLoading, fetchedTileIds } = useParkingSpots(
    queryLocation.latitude,
    queryLocation.longitude,
  );

  const racks: ParkingSpot[] = useMemo(() => data ?? [], [data]);

  const parkingGeoJson = useMemo(() => toGeoJson(racks), [racks]);
  const tileGeoJson = useMemo(
    () => generateTileOverlay(fetchedTileIds),
    [fetchedTileIds],
  );

  const selectedRack = useMemo(
    () => racks.find((rack) => rack.id === selectedRackId) ?? null,
    [racks, selectedRackId],
  );

  const handleCameraMove = useCallback(
    (latitude: number, longitude: number) => {
      const nextTile = getTileId(latitude, longitude);
      if (queryTile.current === nextTile) {
        return;
      }

      queryTile.current = nextTile;
      setQueryLocation({ latitude, longitude });
    },
    [setQueryLocation],
  );

  const runMapSearch = useCallback(
    (query: string) => {
      const parsedCoordinates = parseGeoInput(query);
      if (!parsedCoordinates) {
        return null;
      }

      queryTile.current = getTileId(
        parsedCoordinates.latitude,
        parsedCoordinates.longitude,
      );
      setQueryLocation(parsedCoordinates);
      return parsedCoordinates;
    },
    [setQueryLocation],
  );

  const handleMoveToCoordinates = useCallback(
    (latitude: number, longitude: number, zoom?: number) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom,
        duration: FOCUS_DURATION,
        essential: true,
      });
    },
    [],
  );

  const handleMapSearch = useCallback(
    (query: string) => {
      const parsedCoordinates = runMapSearch(query);
      if (!parsedCoordinates) {
        return false;
      }

      handleMoveToCoordinates(
        parsedCoordinates.latitude,
        parsedCoordinates.longitude,
      );
      return true;
    },
    [handleMoveToCoordinates, runMapSearch],
  );

  const handleClusterClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const clusterFeature = event.features?.find(
        (feature) => feature.layer.id === MAP_CLUSTER_LAYER_ID,
      );
      if (!clusterFeature) return false;

      const clusterId = Number(clusterFeature.properties?.cluster_id);
      const source = mapRef.current?.getSource(MAP_SOURCE_ID) as
        | GeoJSONSource
        | undefined;
      if (!source || Number.isNaN(clusterId)) return false;

      // move camera to cluster and zoom
      const [clusterLng, clusterLat] = event.lngLat.toArray();
      setSelectedRackId(null);

      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        if (zoom == null) return;
        handleMoveToCoordinates(clusterLat, clusterLng, zoom);
      });

      return true;
    },
    [handleMoveToCoordinates],
  );

  const handleMarkerClick = useCallback(
    (event: MapLayerMouseEvent) => {
      // check if individual marker was clicked
      const clickedFeature = event.features?.find(
        (feature) => feature.layer.id === MAP_LAYER_ID,
      );
      if (!clickedFeature) return false;

      // search for clicked rack
      const rack = racks.find(
        (item) => item.id === String(clickedFeature.properties?.id),
      );
      if (!rack) return false;

      // move camera to rack and open popup
      setSelectedRackId(rack.id);
      handleMoveToCoordinates(rack.lat, rack.lng);
      return true;
    },
    [handleMoveToCoordinates, racks],
  );

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (handleClusterClick(event)) return;
      handleMarkerClick(event);
    },
    [handleClusterClick, handleMarkerClick],
  );

  const handlePopupClose = useCallback(() => {
    setSelectedRackId(null);
  }, []);

  const handleTileOverlayToggle = useCallback((enabled: boolean) => {
    setTileOverlayEnabled(enabled);
  }, []);

  const handleMoveEnd = useCallback(
    (event: { viewState: { latitude: number; longitude: number } }) => {
      const { latitude, longitude } = event.viewState;
      handleCameraMove(latitude, longitude);
    },
    [handleCameraMove],
  );

  return {
    racks,
    fetchedTileIds,
    isLoading,
    isError,
    error,
    queryLocation,
    setQueryLocation,
    runMapSearch,
    handleMapSearch,
    searchResults,
    mapRef,
    selectedRack,
    tileOverlayEnabled,
    handleTileOverlayToggle,
    tileGeoJson,
    parkingGeoJson,
    handleMoveEnd,
    handleMarkerClick: handleMapClick,
    handlePopupClose,
  };
}
