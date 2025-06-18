export function setSolution() {
  chrome.runtime.sendMessage({ action: "setSolution" });
}
