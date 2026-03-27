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
