import type { CircleLayerSpecification } from "maplibre-gl";

export const bikeParkingLayerPaint: CircleLayerSpecification["paint"] = {
  "circle-color": ["match", ["get", "shelter"], "Y", "#0ea5e9", "#4b5563"],
  "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 13, 9, 16, 13],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff",
  "circle-opacity": 0.95,
};
