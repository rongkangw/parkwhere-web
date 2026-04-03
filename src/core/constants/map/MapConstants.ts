export const DEFAULT_LATITUDE = 1.3521;
export const DEFAULT_LONGITUDE = 103.8198;
export const DEFAULT_QUERY_DISTANCE = 1.5; // in kilometers
export const DEFAULT_QUERY_DISTANCE_METERS = DEFAULT_QUERY_DISTANCE * 1000; // in meters

export const TILE_SIZE = 0.013;
export const MIN_LNG = 103.6;
export const MAX_LNG = 104.04;
export const MIN_LAT = 1.2;
export const MAX_LAT = 1.48;
export const SINGAPORE_BOUNDS_HINT = `Only coordinates within Singapore are allowed (Lat ${MIN_LAT} - ${MAX_LAT}, Lng ${MIN_LNG} - ${MAX_LNG}).`;

export const INITIAL_ZOOM = 13;
export const FOCUS_DURATION = 700;

export const QUERY_COORDINATE_PRECISION = 3;
export const STORAGE_COORDINATE_PRECISION = 6;

export const MAP_SOURCE_ID = "bike-parking-source";
export const MAP_LAYER_ID = "bike-parking-layer";

export const POPUP_ANCHOR = "left" as const;
export const POPUP_OFFSET = 12;
export const POPUP_MIN_WIDTH = 200;
export const POPUP_TEXT_COLOR = "#5686E1";
