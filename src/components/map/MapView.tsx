"use client";
import { useCallback, useMemo, useRef } from "react";
import type { FeatureCollection, Point } from "geojson";
import Map, {
  Layer,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import { useOnlineRacks } from "@/hooks/useOnlineRacks";
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
  QUERY_COORDINATE_PRECISION,
} from "@/constants/MapConstants";
import { useMapStore } from "@/hooks/useMapStore";
import { mapStyle } from "@/constants/mapstyle/OnemapStyle";

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
  } = useOnlineRacks(queryLatitude, queryLongitude);

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
      const clickedFeature = event.features?.find(
        (feature) => feature.layer.id === MAP_LAYER_ID,
      );

      if (!clickedFeature) {
        return;
      }

      const rackLat = event.lngLat.lat;
      const rackLng = event.lngLat.lng;
      const rackIndex = clickedFeature.id as number;

      const rack = racks?.[rackIndex] ?? null;

      if (!rack) {
        console.warn("Clicked rack not found in data");
        return;
      } else {
        console.log("Clicked rack:", rack);
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
        mapStyle={mapStyle}
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
