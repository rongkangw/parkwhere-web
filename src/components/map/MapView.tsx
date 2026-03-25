"use client";
import { useCallback, useMemo, useRef } from "react";
import type { FeatureCollection, Point } from "geojson";
import Map, {
  Layer,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import { useBikeParking } from "@/hooks/useBikeParking";
import { useMapStore } from "@/state/MapState";
import toGeoJson from "@/app/utils/toGeoJson";
import { bikeParkingLayerPaint } from "@/app/utils/mapMarkerLayerStyle";
import MapErrorPopup from "@/components/map/MapErrorPopup";
import BikeParkingPopup from "@/components/map/ParkingDetailPopup";
import {
  FOCUS_DURATION,
  FOCUS_ZOOM,
  INITIAL_ZOOM,
  MAP_LAYER_ID,
  MAP_SOURCE_ID,
  MAP_STYLE_URL,
  QUERY_COORDINATE_PRECISION,
} from "@/constants/MapConstants";

function roundCoordinate(value: number): number {
  return Number(value.toFixed(QUERY_COORDINATE_PRECISION));
}

export default function MapView() {
  const mapRef = useRef<MapRef | null>(null);
  const cameraLatitude = useMapStore((state) => state.cameraLatitude);
  const cameraLongitude = useMapStore((state) => state.cameraLongitude);
  const selectedRack = useMapStore((state) => state.selectedRack);
  const setSelectedRack = useMapStore((state) => state.setSelectedRack);
  const setCameraLocation = useMapStore((state) => state.setCameraLocation);

  const queryLatitude = useMemo(
    () => roundCoordinate(cameraLatitude),
    [cameraLatitude],
  );
  const queryLongitude = useMemo(
    () => roundCoordinate(cameraLongitude),
    [cameraLongitude],
  );

  const {
    data: racks,
    error,
    isError,
    isLoading,
  } = useBikeParking(queryLatitude, queryLongitude);

  const parkingGeoJson = useMemo<FeatureCollection<Point>>(() => {
    return toGeoJson(racks);
  }, [racks]);

  const handleMoveEnd = useCallback(
    (event: { viewState: { latitude: number; longitude: number } }) => {
      const { latitude, longitude } = event.viewState;
      setCameraLocation(latitude, longitude);
    },
    [setCameraLocation],
  );

  const handleMarkerClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const rackLat = event.lngLat.lat;
      const rackLng = event.lngLat.lng;
      const rackIndex = (event.features?.[0].id as number) ?? -1;

      const rack = racks?.[rackIndex] ?? null;
      if (!rack) {
        console.warn("Clicked rack not found in data");
        return;
      }

      setSelectedRack(rack);
      setCameraLocation(rackLat, rackLng);
      mapRef.current?.flyTo({
        center: [rackLng, rackLat],
        zoom: FOCUS_ZOOM,
        duration: FOCUS_DURATION,
        essential: true,
      });
    },
    [racks, setCameraLocation, setSelectedRack],
  );

  const handlePopupClose = useCallback(() => {
    setSelectedRack(null);
  }, [setSelectedRack]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: cameraLatitude,
          longitude: cameraLongitude,
          zoom: INITIAL_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE_URL}
        interactiveLayerIds={[MAP_LAYER_ID]}
        onMoveEnd={handleMoveEnd}
        onClick={handleMarkerClick}
      >
        {parkingGeoJson.features.length > 0 && (
          <Source id={MAP_SOURCE_ID} type="geojson" data={parkingGeoJson}>
            <Layer
              id={MAP_LAYER_ID}
              type="circle"
              paint={bikeParkingLayerPaint}
            />
          </Source>
        )}

        {selectedRack && (
          <BikeParkingPopup rack={selectedRack} onClose={handlePopupClose} />
        )}
      </Map>

      {isLoading && (
        <MapErrorPopup
          message={"Loading bike parking data..."}
          variant="loading"
        />
      )}
      {isError && <MapErrorPopup message={error.message} variant="error" />}
    </div>
  );
}
