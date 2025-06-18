import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { chromeExtension } from "@crxjs/vite-plugin";
import zipPack from "vite-plugin-zip-pack";

const geoguessrURL = "*://*.geoguessr.com/*";

const version = process.env.npm_package_version;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    chromeExtension({
      manifest: {
        manifest_version: 3,
        name: "Geoguessr Solutions",
        version: "1.0.0",
        description: "Geoguessr Solutions",
        background: {
          service_worker: "src/background/index.ts",
          type: "module",
        },
        icons: {
          "16": "icons/active/icon-16.png",
          "32": "icons/active/icon-32.png",
          "48": "icons/active/icon-48.png",
          "128": "icons/active/icon-128.png",
        },
        action: {
          // default_popup: "index.html",
          default_title: "Geoguessr Solutions",
          default_icon: {
            "16": "icons/active/icon-16.png",
            "32": "icons/active/icon-32.png",
            "48": "icons/active/icon-48.png",
            "128": "icons/active/icon-128.png",
          },
        },
        permissions: ["webRequest", "storage", "scripting"],
        host_permissions: ["<all_urls>"],
        content_scripts: [
          {
            matches: [geoguessrURL],
            js: ["src/content/index.ts"],
          },
        ],
        web_accessible_resources: [
          {
            resources: ["**/*"],
            matches: [geoguessrURL],
          },
        ],
      },
    }),
    zipPack({
      inDir: "dist",
      outDir: "dist-zip",
      outFileName: `geoguessr-solutions-chrome-extension-${version}.zip`,
    }),
  ],
});
