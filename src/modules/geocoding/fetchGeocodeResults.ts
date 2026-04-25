export type OneMapGeocodeResult = {
  SEARCHVAL: string;
  BLK_NO: string;
  ROAD_NAME: string;
  BUILDING: string;
  ADDRESS: string;
  LATITUDE: string;
  LONGITUDE: string;
};

type OneMapGeocodeResponse = {
  results?: OneMapGeocodeResult[];
};

export default async function fetchGeocodeResults(
  searchValue: string,
  signal?: AbortSignal,
): Promise<OneMapGeocodeResult[]> {
  const params = new URLSearchParams({
    searchVal: searchValue,
    returnGeom: "Y",
    getAddrDetails: "Y",
    pageNum: "1",
  });

  const requestUrl = `/api/fetch_latlng_from_location?${params.toString()}`;
  console.info(
    `Sending geocoding request for search value "${searchValue}". URL: ${requestUrl}`,
  );

  const res = await fetch(requestUrl, { signal });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      `Geocoding request failed for query "${searchValue}": ${data.error}`,
    );
  }

  const data = (await res.json()) as OneMapGeocodeResponse;

  return data.results ?? [];
}
