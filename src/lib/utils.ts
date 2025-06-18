import type { AppData, MapLocation } from "./types";

export async function getAppData(): Promise<AppData | null> {
  return new Promise<AppData | null>((resolve) => {
    chrome.storage.local.get<AppData | null>(null, (result) => {
      resolve(result);
    });
  });
}

export function setOpen(open: boolean) {
  return chrome.storage.local.set({ opened: open });
}

export function setActive(active: boolean) {
  return chrome.storage.local.set({ active });
}


function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export function shouldOpen(
  previousLocation: MapLocation | null,
  newLocation: MapLocation
): boolean {
  if (previousLocation === null) return true;
  const distance = getDistance(
    previousLocation.lat,
    previousLocation.lng,
    newLocation.lat,
    newLocation.lng
  );
  return distance > 1;
}

export function isGeoguessr(url?: string) {
  if (!url) return false;
  const urlObject = new URL(url);
  return urlObject.hostname.includes("geoguessr.com");
}