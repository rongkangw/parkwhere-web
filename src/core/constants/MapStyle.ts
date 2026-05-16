import { StyleSpecification } from "react-map-gl/maplibre";

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
        "line-opacity": 0.9,
      },
    },
  ],
  metadata: {
    attribution: "© Singapore Land Authority, OneMap",
  },
};
