import { getAppData, isGeoguessr, shouldOpen } from "../lib/utils";
import type { AppData, MapLocation } from "../lib/types";

declare global {
  interface Window {
    allGoogleMaps: google.maps.Map[];
    initialized: boolean;
  }
}

const results = new Map<string, Promise<MapLocation | null>>();

function onAppDataChanged(fn: (appData: AppData | null) => void): () => void {
  const listener = () => {
    getAppData().then(fn);
  };
  chrome.storage.local.onChanged.addListener(listener);
  listener();
  return () => {
    chrome.storage.local.onChanged.removeListener(listener);
  };
}

async function getLocationForPanoid(
  tabId: number,
  panoid: string
): Promise<MapLocation | null> {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: "MAIN",
      func: async (panoIdForFunc) => {
        if (
          typeof google !== "object" ||
          typeof google.maps !== "object" ||
          typeof google.maps.StreetViewService !== "function"
        ) {
          return null;
        }
        const streetViewService = new google.maps.StreetViewService();
        const panorama = await streetViewService.getPanorama({
          pano: panoIdForFunc,
        });
        if (!panorama.data.location || !panorama.data.location.latLng) {
          return null;
        }
        return {
          lat: panorama.data.location.latLng.lat(),
          lng: panorama.data.location.latLng.lng(),
          descritpion: panorama.data.location.description ?? undefined,
          shortDescription:
            panorama.data.location.shortDescription ?? undefined,
        };
      },
      args: [panoid],
    });
    if (results && results[0] && results[0].result) {
      return results[0].result;
    }
    return null;
  } catch (e) {
    console.error(`Failed to get location for panoid ${panoid}:`, e);
    return null;
  }
}

async function getLocationPanoIdWrapper(tabId: number, panoId: string) {
  if (results.has(panoId)) {
    return results.get(panoId)!;
  }
  const locationPrmoise = getLocationForPanoid(tabId, panoId);
  results.set(panoId, locationPrmoise);
  locationPrmoise.then((l) => {
    if (l === null) results.delete(panoId);
  });
  return locationPrmoise;
}

async function getLocationForUrl(url: string, tabId: number) {
  const urlObject = new URL(url);
  const panoid = urlObject.searchParams.get("panoid");
  if (panoid) {
    const [location, appData] = await Promise.all([
      getLocationPanoIdWrapper(tabId, panoid),
      getAppData(),
    ]);
    if (location) {
      const should = shouldOpen(appData?.location ?? null, location);
      await chrome.storage.local.set<AppData>({
        location,
        opened: appData?.opened || should,
      });
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { tabId, url } = details;
    getLocationForUrl(url, tabId);
    return {};
  },
  { urls: ["<all_urls>"] }
);

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.get<AppData>(null, (result) => {
    const isActive = result.active ?? false;
    const isOpened = result.opened ?? false;
    chrome.storage.local.set<AppData>({
      active: !isActive,
      opened: isOpened || !isActive,
    });
  });
});

function setInactiveIcon(tabId: number) {
  // TODO: set inactive icon
  chrome.action.setIcon({
    path: "icons/inactive/icon-16.png",
    tabId,
  });
}

function setActiveIcon(tabId: number) {
  // TODO: set active icon
  chrome.action.setIcon({
    path: "icons/active/icon-16.png",
    tabId,
  });
}

const unsubs = new Map<number, () => void>();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isGeoguessr(tab.url)) {
    setInactiveIcon(tabId);
    return;
  }

  if (unsubs.has(tabId)) {
    unsubs.get(tabId)!();
    unsubs.delete(tabId);
  }

  unsubs.set(
    tabId,
    onAppDataChanged((appData) => {
      if (appData?.active) {
        setActiveIcon(tabId);
      } else {
        setInactiveIcon(tabId);
      }
    })
  );

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    world: "MAIN",
    func: () => {
      if (window.initialized) {
        return;
      }
      window.initialized = true;
      const waitForGoogle = () => {
        if (typeof google !== "undefined" && google.maps) {
          if (!window.allGoogleMaps) {
            window.allGoogleMaps = [];
          }

          // Store the original Map constructor
          const MapConstructor = google.maps.Map;

          class ExtendedMap extends MapConstructor {
            constructor(...args: ConstructorParameters<typeof MapConstructor>) {
              super(...args);
              window.allGoogleMaps.push(this);
            }
          }

          // Override the constructors
          google.maps.Map = ExtendedMap;
        } else {
          setTimeout(waitForGoogle, 100);
        }
      };
      waitForGoogle();
    },
  });
});

async function setSolution(location: MapLocation, tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId: tabId },
    world: "MAIN",
    args: [location],
    func: (location) => {
      window.allGoogleMaps.forEach((map) => {
        try {
          google.maps.event.trigger(map, "click", {
            latLng: {
              lat: () => location.lat,
              lng: () => location.lng,
            },
          });
        } catch {}
      });
    },
  });
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.action === "setSolution") {
    const appData = await getAppData();
    if (appData && appData.location && sender.tab && sender.tab.id) {
      await setSolution(appData.location, sender.tab.id);
    }
  }
});

// async function setBadge() {
//   const appData = await getAppData();
//   if (appData?.active) {
//     await chrome.action.setBadgeBackgroundColor({ color: "#00FF00" });
//     await chrome.action.setBadgeText({ text: "1" });

//   } else {
//     await chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
//     await chrome.action.setBadgeText({ text: "0" });
//   }
// }

// chrome.storage.local.onChanged.addListener(async () => {
//   setBadge();
// });
// setBadge();
