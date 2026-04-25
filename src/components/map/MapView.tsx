"use client";

import Map, { Layer, Source } from "react-map-gl/maplibre";
import {
  bikeParkingClusterCountLayout,
  bikeParkingClusterCountPaint,
  bikeParkingClusterLayerPaint,
  bikeParkingLayerPaint,
} from "@/core/constants/MapMarkerLayerStyle";
import BikeParkingPopup from "@/components/map/ParkingDetailPopup";

import {
  INITIAL_ZOOM,
  MAP_CLUSTER_COUNT_LAYER_ID,
  MAP_CLUSTER_LAYER_ID,
  MAP_CLUSTER_MAX_ZOOM,
  MAP_CLUSTER_RADIUS,
  MAX_LAT,
  MAX_LNG,
  MAP_LAYER_ID,
  MAP_SOURCE_ID,
  MIN_LAT,
  MIN_LNG,
} from "@/core/constants/MapConstants";
import useMapViewModel from "@/viewmodels/MapViewModel";
import { mapStyle } from "@/core/constants/MapStyle";

type MapViewProps = {
  vm: ReturnType<typeof useMapViewModel>;
};

export default function MapView({ vm }: MapViewProps) {
  const {
    mapRef,
    queryLocation,
    tileGeoJson,
    parkingGeoJson,
    selectedRack,
    tileOverlayEnabled,
    handleMoveEnd,
    handleMapClick,
    handlePopupClose,
  } = vm;

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        onClick={handleMapClick}
        initialViewState={{
          latitude: queryLocation.latitude,
          longitude: queryLocation.longitude,
          zoom: INITIAL_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        maxBounds={[
          [MIN_LNG, MIN_LAT],
          [MAX_LNG, MAX_LAT],
        ]}
        attributionControl={false} // logo is not required
        interactiveLayerIds={[MAP_LAYER_ID, MAP_CLUSTER_LAYER_ID]}
        onMoveEnd={handleMoveEnd}
      >
        {tileGeoJson && tileOverlayEnabled && (
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
          <Source
            id={MAP_SOURCE_ID}
            type="geojson"
            data={parkingGeoJson}
            cluster
            clusterMaxZoom={MAP_CLUSTER_MAX_ZOOM}
            clusterRadius={MAP_CLUSTER_RADIUS}
          >
            <Layer
              id={MAP_CLUSTER_LAYER_ID}
              type="circle"
              filter={["has", "point_count"]}
              paint={bikeParkingClusterLayerPaint}
            />
            <Layer
              id={MAP_CLUSTER_COUNT_LAYER_ID}
              type="symbol"
              filter={["has", "point_count"]}
              layout={bikeParkingClusterCountLayout}
              paint={bikeParkingClusterCountPaint}
            />
            <Layer
              id={MAP_LAYER_ID}
              type="circle"
              filter={["!", ["has", "point_count"]]}
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
