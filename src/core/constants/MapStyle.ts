import { StyleSpecification } from "react-map-gl/maplibre";
import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";

// Map Style Configuration
export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    onemap: {
      type: "raster",
      tiles: ["https://www.onemap.gov.sg/maps/tiles/GreyLite/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      minzoom: 11,
    },

    "cycling-paths": {
      type: "vector",
      url: `https://api.thunderforest.com/thunderforest.outdoors-v2.json?apikey=${process.env.NEXT_PUBLIC_THUNDERFOREST_API_KEY}`,
    },
  },
  layers: [
    {
      id: "onemap-base",
      type: "raster",
      source: "onemap",
    },
    {
      id: "tf-cycling-routes",
      type: "line",
      source: "cycling-paths",
      "source-layer": "cycling",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "#ff7f00",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          1.5,
          14,
          2.5,
          17,
          5,
        ],
      },
    },
  ],
};

// Map-marker Layer Style Configuration
export const bikeParkingLayerPaint: CircleLayerSpecification["paint"] = {
  "circle-color": ["match", ["get", "shelter"], "Y", "#0ea5e9", "#4b5563"],
  "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 13, 9, 16, 13],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff",
  "circle-opacity": 0.95,
};

export const bikeParkingClusterLayerPaint: CircleLayerSpecification["paint"] = {
  "circle-color": [
    "step",
    ["get", "point_count"],
    "#1d4ed8",
    20,
    "#2563eb",
    50,
    "#3b82f6",
  ],
  "circle-radius": ["step", ["get", "point_count"], 16, 20, 22, 50, 28],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff",
  "circle-opacity": 0.9,
};

export const bikeParkingClusterCountLayout: SymbolLayerSpecification["layout"] =
  {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12,
    "text-font": ["Open Sans Bold"],
  };

export const bikeParkingClusterCountPaint: SymbolLayerSpecification["paint"] = {
  "text-color": "#ffffff",
};
