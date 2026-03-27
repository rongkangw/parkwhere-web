import { useEffect } from "react";
import getTileId from "@/app/utils/getTileId";
import ParkingSpot from "@/core/constants/ParkingSpot";
import updateDbSpots from "@/modules/db/updateDbSpots";

type UsePersistParkingSpotsArgs = {
  lat: number;
  lng: number;
  spots?: ParkingSpot[];
  shouldPersist: boolean;
};

export default function usePersistParkingSpots({
  lat,
  lng,
  spots,
  shouldPersist,
}: UsePersistParkingSpotsArgs) {
  const tile = getTileId(lat, lng);

  useEffect(() => {
    if (!shouldPersist) return;
    if (!spots || spots.length === 0) return;

    const persist = async () => {
      try {
        await updateDbSpots(tile, lat, lng, spots);
      } catch (error) {
        console.warn(
          `Failed to persist online spots for tile ${tile}. Error: ${error}`,
        );
      }
    };

    persist();
  }, [lat, lng, shouldPersist, spots, tile]);
}
