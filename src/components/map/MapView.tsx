"use client";

import Map, { Layer, Source } from "react-map-gl/maplibre";
import { bikeParkingLayerPaint } from "@/app/utils/mapMarkerLayerStyle";
import BikeParkingPopup from "@/components/map/ParkingDetailPopup";

import {
  INITIAL_ZOOM,
  MAP_LAYER_ID,
  MAP_SOURCE_ID,
} from "@/core/constants/map/MapConstants";
import { mapStyle } from "@/core/constants/map/mapstyle/OnemapStyle";
import useMapViewModel from "@/viewmodels/MapViewModel";

type MapViewProps = {
  vm: ReturnType<typeof useMapViewModel>;
};

export default function MapView({ vm }: MapViewProps) {
  const {
    mapRef,
    cameraLatitude,
    cameraLongitude,
    tileGeoJson,
    parkingGeoJson,
    selectedRack,
    handleMoveEnd,
    handleMarkerClick,
    handlePopupClose,
  } = vm;

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
        {tileGeoJson && (
          <Source id="tiles" type="geojson" data={tileGeoJson}>
            <Layer
              id="tiles-fill"
              type="fill"
              paint={{
                "fill-color": [
                  "case",
                  ["get", "hasData"],
                  "#4caf50",
                  "#999999",
                ],
                "fill-opacity": 0.3,
              }}
            />
            <Layer
              id="tiles-line"
              type="line"
              paint={{
                "line-color": "#333333",
                "line-width": 1,
              }}
            />
          </Source>
        )}

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
    </div>
  );
}
