// LTA API Constants
export const DATAMALL_URL =
  "https://datamall2.mytransport.sg/ltaodataservice/BicycleParkingv2";
export const MISSING_LATLNG_ERROR =
  "Missing required query params: lat and lng";
export const MISSING_LTA_KEY_ERROR =
  "Missing LTA account key in environment variables";

// One-map API Constants
export const ONEMAP_AUTH_URL =
  "https://www.onemap.gov.sg/api/auth/post/getToken";
export const ONEMAP_GEOCODE_URL =
  "https://www.onemap.gov.sg/api/common/elastic/search";
export const TOKEN_REFRESH_BUFFER_MS = 60_000;

// DB API Constants
export const VOTE_SESSION_COOKIE = "parkwhere_vote_session";
export const LOCAL_USER_VOTES_KEY = "parkwhere_vote_state";
export const VOTE_SESSION_MAX_AGE = 60 * 60 * 24 * 365;
