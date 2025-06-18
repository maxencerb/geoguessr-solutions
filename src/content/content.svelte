<script lang="ts">
  import { dataStore } from "../lib/data";
  import { setOpen } from "../lib/utils";
  import {
    MapLibre,
    NavigationControl,
    ScaleControl,
    Marker,
  } from "svelte-maplibre-gl";
  import { fly } from "svelte/transition";
  import { setSolution } from "../lib/set-solution";
</script>

{#if $dataStore.opened && $dataStore.active}
  <div
    transition:fly={{ y: 100 }}
    class:dark={window.matchMedia("(prefers-color-scheme: dark)").matches}
    class="container"
  >
    <div class="close-btn-container">
      <button
        aria-label="Close"
        class="close-btn"
        on:click={() => setOpen(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
    </div>
    <MapLibre
      class="map"
      style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      zoom={3.5}
      center={{
        lng: $dataStore.location?.lng ?? 0,
        lat: $dataStore.location?.lat ?? 0,
      }}
    >
      <NavigationControl />
      <ScaleControl />
      <Marker
        lnglat={{
          lng: $dataStore.location?.lng ?? 0,
          lat: $dataStore.location?.lat ?? 0,
        }}
      />
    </MapLibre>
    <p>{$dataStore.location?.descritpion ?? "No solution"}</p>
    <button
      class="solution-btn"
      on:click={() => {
        setSolution();
        setOpen(false);
      }}
      disabled={!$dataStore.location}
    >
      Set Solution
    </button>
  </div>
{/if}

<style>
  .solution-btn {
    width: 100%;
    padding: 8px;
    background-color: #8b5cf6;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
  }

  .solution-btn:hover:not(:disabled) {
    background-color: #7c3aed;
  }

  .solution-btn:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  .container {
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    color: black;
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  div.dark {
    background-color: #1a1a1a;
    color: white;
  }

  .close-btn-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .close-btn {
    background-color: #8b5cf6;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background-color: #7c3aed;
  }

  .close-btn svg {
    fill: white;
    width: 20px;
    height: 20px;
  }
</style>
