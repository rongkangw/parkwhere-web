"use client";

import Map, {
  AttributionControl,
  Layer,
  Marker,
  Source,
} from "react-map-gl/maplibre";

import BikeParkingPopup from "@/components/map/ParkingDetailPopup";

import useMapViewModel from "@/viewmodels/MapViewModel";
import {
  mapStyle,
  bikeParkingClusterLayerPaint,
  bikeParkingClusterCountLayout,
  bikeParkingClusterCountPaint,
  bikeParkingLayerPaint,
} from "@/core/constants/MapStyle";
import {
  INITIAL_ZOOM,
  MIN_LNG,
  MIN_LAT,
  MAX_LNG,
  MAX_LAT,
  MAP_LAYER_ID,
  MAP_CLUSTER_LAYER_ID,
  MAP_SOURCE_ID,
  MAP_CLUSTER_MAX_ZOOM,
  MAP_CLUSTER_RADIUS,
  MAP_CLUSTER_COUNT_LAYER_ID,
  PARKING_SPOT_FLAGS,
  ParkingSpotFlag,
} from "@/core/constants/UiConstants";
import { useState } from "react";
import { CircleQuestionMark, TriangleAlert } from "lucide-react";

const MAP_ATTRIBUTION = "© Singapore Land Authority, OneMap | © Thunderforest";

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
    userLocationState,
    handleMoveEnd,
    handleMapClick,
    handlePopupClose,
    handleOpenGoogleMaps,
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
        attributionControl={false}
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
          <BikeParkingPopup
            rack={selectedRack}
            onClose={handlePopupClose}
            onNavigate={handleOpenGoogleMaps}
          />
        )}

        {userLocationState && (
          <Marker
            longitude={userLocationState.longitude}
            latitude={userLocationState.latitude}
            anchor="center"
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-white bg-sky-500 shadow-md" />
              <div className="absolute h-8 w-8 rounded-full border-2 border-sky-400/50" />
              {userLocationState.heading != null && (
                <div
                  className="absolute -top-3 left-1/2 h-3 w-1 -translate-x-1/2 rounded-full bg-sky-700"
                  style={{
                    transform: `translateX(-50%) rotate(${userLocationState.heading}deg)`,
                  }}
                />
              )}
            </div>
          </Marker>
        )}
        <AttributionControl
          position="top-right"
          customAttribution={MAP_ATTRIBUTION}
        />
      </Map>
    </div>
  );
}
