"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapLayerMouseEvent, MapRef } from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import parseGeoInput from "@/utils/geocoding/parseGeoInput";
import getTileId from "@/utils/tile/getTileId";
import buildParkingSpotGeoJson from "@/utils/parking/buildParkingSpotGeoJson";
import buildTileOverlay from "@/utils/tile/buildTileOverlay";
import calculateHaversineDistance from "@/utils/parking/calculateHaversineDistance";
import ParkingSpot from "@/core/types/parking/ParkingSpot";
import useParkingSpots from "@/hooks/useParkingSpots";
import useGeocodingSearch from "@/hooks/useGeocodingSearch";
import useGoogleMapsRedirect from "@/hooks/useGoogleMapsRedirect";
import { OneMapGeocodeResult } from "@/services/geocoding/fetchGeocodeResults";
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  FOCUS_DURATION,
  MAP_CLUSTER_LAYER_ID,
  MAP_LAYER_ID,
  MAP_SOURCE_ID,
  SINGAPORE_BOUNDS_HINT,
  USER_LOCATION_ERROR_MESSAGE,
  MAP_ERROR_DURATION_MS,
} from "@/core/constants/ui/MapConstants";
import UserLocationState from "@/core/types/map/UserLocationState";
import MapError from "@/core/types/map/MapError";
import { SIDEBAR_MAX_DISPLAYED_SPOTS } from "@/core/constants/ui/UiConstants";

type UseMapViewModelArgs = {
  initialQueryLocation?: {
    latitude: number;
    longitude: number;
  };
};

export default function useMapViewModel({
  initialQueryLocation,
}: UseMapViewModelArgs = {}) {
  const isProduction = process.env.NODE_ENV === "production";

  // Data states
  const mapRef = useRef<MapRef | null>(null);
  const locationWatchIdRef = useRef<number | null>(null);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [queryLocation, setQueryLocation] = useState(
    initialQueryLocation ?? {
      latitude: DEFAULT_LATITUDE,
      longitude: DEFAULT_LONGITUDE,
    },
  );
  const queryTile = useRef<string>(
    getTileId(queryLocation.latitude, queryLocation.longitude),
  );

  // UI states
  const [tileOverlayEnabled, setTileOverlayEnabled] = useState(false);
  const [cyclingPathsEnabled, setCyclingPathsEnabled] = useState(false);
  const [userLocationState, setUserLocationState] =
    useState<UserLocationState | null>(null);
  const [mapErrors, setMapErrors] = useState<MapError[]>([]);
  const [searchInput, setSearchInput] = useState("");

  // Data fetching and memoized values
  const { geocodeSearchResults, isGeocodeLoading, geocodeError } =
    useGeocodingSearch(searchInput);
  const { openGoogleMapsPin, openGoogleMapsDirections } =
    useGoogleMapsRedirect();

  const { data, error, isLoading, fetchedTileIds } = useParkingSpots(
    queryLocation.latitude,
    queryLocation.longitude,
  );

  const racks: ParkingSpot[] = useMemo(() => data ?? [], [data]);

  const parkingGeoJson = useMemo(() => buildParkingSpotGeoJson(racks), [racks]);

  const tileGeoJson = useMemo(
    () => (isProduction ? null : buildTileOverlay(fetchedTileIds)),
    [fetchedTileIds, isProduction],
  );

  const selectedRack = useMemo(
    () => racks.find((rack) => rack.id === selectedRackId) ?? null,
    [racks, selectedRackId],
  );

  const nearestSpots = useMemo(() => {
    const baseLat = userLocationState
      ? userLocationState.latitude
      : queryLocation.latitude;
    const baseLng = userLocationState
      ? userLocationState.longitude
      : queryLocation.longitude;

    return racks
      .map((r) => ({
        ...r,
        distance: calculateHaversineDistance(baseLat, baseLng, r.lat, r.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, SIDEBAR_MAX_DISPLAYED_SPOTS);
  }, [racks, userLocationState, queryLocation]);

  // Internal helpers used by other callbacks.
  // ---------------------------------------------------------------------------

  const addMapError = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random()}`;

    setMapErrors((currentErrors) => [{ id, message }, ...currentErrors]);

    window.setTimeout(() => {
      setMapErrors((currentErrors) =>
        currentErrors.filter((error) => error.id !== id),
      );
    }, MAP_ERROR_DURATION_MS);
  }, []);

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

  const handleMoveEnd = useCallback(
    (event: { viewState: { latitude: number; longitude: number } }) => {
      const { latitude, longitude } = event.viewState;
      handleCameraMove(latitude, longitude);
    },
    [handleCameraMove],
  );

  const updateUserLocation = useCallback(
    (position: GeolocationPosition, shouldMoveMap: boolean) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const heading = position.coords.heading;
      const normalizedHeading =
        heading == null || Number.isNaN(heading) ? null : Number(heading);

      setUserLocationState({ latitude, longitude, heading: normalizedHeading });

      if (shouldMoveMap) {
        handleMoveToCoordinates(latitude, longitude);
      }
    },
    [handleMoveToCoordinates],
  );

  // Exposed handlers used by the page/UI.
  // ---------------------------------------------------------------------------
  const handleMapSearch = useCallback(
    (query: string) => {
      const parsedCoordinates = runMapSearch(query);
      if (!parsedCoordinates) {
        addMapError(SINGAPORE_BOUNDS_HINT);
        return false;
      }

      handleMoveToCoordinates(
        parsedCoordinates.latitude,
        parsedCoordinates.longitude,
      );
      return true;
    },
    [addMapError, handleMoveToCoordinates, runMapSearch],
  );

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleOpenMapWithResult = useCallback(
    (result: OneMapGeocodeResult) => {
      const latitude = Number(result.LATITUDE);
      const longitude = Number(result.LONGITUDE);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return;
      }

      queryTile.current = getTileId(latitude, longitude);
      setQueryLocation({ latitude, longitude });
      handleMoveToCoordinates(latitude, longitude);
    },
    [handleMoveToCoordinates],
  );

  const handleOpenMapFromEnter = useCallback(() => {
    const parsedCoordinates = parseGeoInput(searchInput.trim());
    if (parsedCoordinates) {
      queryTile.current = getTileId(
        parsedCoordinates.latitude,
        parsedCoordinates.longitude,
      );
      setQueryLocation(parsedCoordinates);
      handleMoveToCoordinates(
        parsedCoordinates.latitude,
        parsedCoordinates.longitude,
      );
      return true;
    }

    if (geocodeSearchResults.length > 0) {
      handleOpenMapWithResult(geocodeSearchResults[0]);
      return true;
    }

    return false;
  }, [
    geocodeSearchResults,
    handleMoveToCoordinates,
    handleOpenMapWithResult,
    searchInput,
  ]);

  const selectGeocodeResult = useCallback(
    (result: OneMapGeocodeResult) => {
      handleOpenMapWithResult(result);
    },
    [handleOpenMapWithResult],
  );

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const clusterFeature = event.features?.find(
        (feature) => feature.layer.id === MAP_CLUSTER_LAYER_ID,
      );

      if (clusterFeature) {
        const clusterId = Number(clusterFeature.properties?.cluster_id);
        const source = mapRef.current?.getSource(MAP_SOURCE_ID) as
          | GeoJSONSource
          | undefined;

        if (!source || Number.isNaN(clusterId)) return;

        const [clusterLng, clusterLat] = event.lngLat.toArray();
        setSelectedRackId(null);

        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          if (zoom == null) return;
          handleMoveToCoordinates(clusterLat, clusterLng, zoom);
        });
        return;
      }

      const clickedFeature = event.features?.find(
        (feature) => feature.layer.id === MAP_LAYER_ID,
      );
      if (!clickedFeature) return;

      const rack = racks.find(
        (item) => item.id === String(clickedFeature.properties?.id),
      );
      if (!rack) return;

      setSelectedRackId(rack.id);
      handleMoveToCoordinates(rack.lat, rack.lng);
    },
    [handleMoveToCoordinates, racks],
  );

  const handlePopupClose = useCallback(() => {
    setSelectedRackId(null);
  }, []);

  const handleOpenGoogleMaps = useCallback(
    (rack: ParkingSpot) => {
      const target = {
        latitude: rack.lat,
        longitude: rack.lng,
      };

      const opened = userLocationState
        ? openGoogleMapsDirections(target, {
            latitude: userLocationState.latitude,
            longitude: userLocationState.longitude,
          })
        : openGoogleMapsPin(target);

      if (!opened) {
        addMapError("Unable to open Google Maps.");
      }
    },
    [
      addMapError,
      openGoogleMapsDirections,
      openGoogleMapsPin,
      userLocationState,
    ],
  );

  const handleTileOverlayToggle = useCallback(
    (enabled: boolean) => {
      if (isProduction) {
        return;
      }

      setTileOverlayEnabled(enabled);
    },
    [isProduction],
  );

  const handleCyclingPathsToggle = useCallback((enabled: boolean) => {
    setCyclingPathsEnabled(enabled);
    mapRef.current
      ?.getMap()
      .setLayoutProperty(
        "tf-cycling-routes",
        "visibility",
        enabled ? "visible" : "none",
      );
  }, []);

  const handleRequestUserLocation = useCallback(() => {
    if (userLocationState) {
      handleMoveToCoordinates(
        userLocationState.latitude,
        userLocationState.longitude,
      );
      return;
    }

    if (!navigator.geolocation) {
      addMapError(USER_LOCATION_ERROR_MESSAGE);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateUserLocation(position, true);
      },
      () => {
        addMapError(USER_LOCATION_ERROR_MESSAGE);

        if (locationWatchIdRef.current != null && navigator.geolocation) {
          navigator.geolocation.clearWatch(locationWatchIdRef.current);
          locationWatchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    // start watching user location for real-time updates
    if (locationWatchIdRef.current == null) {
      locationWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          updateUserLocation(position, false);
        },
        () => {
          addMapError(USER_LOCATION_ERROR_MESSAGE);

          if (locationWatchIdRef.current != null && navigator.geolocation) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
            locationWatchIdRef.current = null;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 1000,
        },
      );
    }
  }, [
    addMapError,
    handleMoveToCoordinates,
    userLocationState,
    updateUserLocation,
  ]);

  const parkingErrorMessage = error ? error : null;

  useEffect(() => {
    if (!parkingErrorMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      addMapError(parkingErrorMessage);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [addMapError, parkingErrorMessage]);

  // clear geolocation watch on change page
  useEffect(() => {
    return () => {
      if (locationWatchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
    };
  }, []);

  const handleZoomToSpot = useCallback(
    (spot: ParkingSpot & { distance?: number }) => {
      setSelectedRackId(spot.id);
      mapRef.current?.flyTo({
        center: [spot.lng, spot.lat],
        zoom: 16,
        duration: FOCUS_DURATION,
        essential: true,
      });
    },
    [],
  );

  return {
    racks,
    fetchedTileIds,
    isLoading,
    queryLocation,
    searchInput,
    geocodeSearchResults,
    geocodeError,
    isGeocodeLoading,
    handleMapSearch,
    handleSearchInputChange,
    handleOpenMapFromEnter,
    selectGeocodeResult,
    mapErrors,
    mapRef,
    selectedRack,
    tileOverlayEnabled,
    showTileOverlayToggle: !isProduction,
    handleTileOverlayToggle,
    cyclingPathsEnabled,
    handleCyclingPathsToggle,
    userLocationState,
    nearestSpots,
    hasUserLocation: !!userLocationState,
    handleZoomToSpot,
    handleRequestUserLocation,
    tileGeoJson,
    parkingGeoJson,
    handleMoveEnd,
    handleMapClick,
    handlePopupClose,
    handleOpenGoogleMaps,
  };
}
