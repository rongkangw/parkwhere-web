import { StyleSpecification } from "react-map-gl/maplibre";

export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    onemap: {
      type: "raster",
      tiles: [
        "https://www.onemap.gov.sg/maps/tiles/Default_HD/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "onemap-base",
      type: "raster",
      source: "onemap",
    },
  ],
  metadata: {
    attribution: "© Singapore Land Authority, OneMap",
  },
};
