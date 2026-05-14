"use client";

import { useCallback } from "react";

type GoogleMapsLocation = {
  latitude: number;
  longitude: number;
};

function buildGoogleMapsPinUrl(target: GoogleMapsLocation) {
  const params = new URLSearchParams({
    api: "1",
    query: `${target.latitude},${target.longitude}`,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}

function buildGoogleMapsDirectionsUrl(
  target: GoogleMapsLocation,
  origin: GoogleMapsLocation,
) {
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${target.latitude},${target.longitude}`,
    travelmode: "cycling",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function openGoogleMapsUrl(url: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) {
    return false;
  }

  popup.opener = null;
  return true;
}

export default function useGoogleMapsRedirect() {
  const openGoogleMapsPin = useCallback((target: GoogleMapsLocation) => {
    return openGoogleMapsUrl(buildGoogleMapsPinUrl(target));
  }, []);

  const openGoogleMapsDirections = useCallback(
    (target: GoogleMapsLocation, origin: GoogleMapsLocation) => {
      return openGoogleMapsUrl(buildGoogleMapsDirectionsUrl(target, origin));
    },
    [],
  );

  return {
    openGoogleMapsPin,
    openGoogleMapsDirections,
  };
}
