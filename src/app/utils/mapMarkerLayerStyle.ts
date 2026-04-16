import type {
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";

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
