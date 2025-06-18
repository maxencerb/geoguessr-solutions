import { readable } from "svelte/store";
import type { AppData } from "./types";
import { getAppData } from "./utils";

const DEFAULT_DATA: AppData = { location: null, opened: false, active: false };

export const dataStore = readable<AppData>(DEFAULT_DATA, (set) => {
  const onChanges = async () => {
    const appData = await getAppData();
    set(appData ?? DEFAULT_DATA);
  };
  onChanges();

  chrome.storage.local.onChanged.addListener(onChanges);
  return () => {
    chrome.storage.local.onChanged.removeListener(onChanges);
  };
});
