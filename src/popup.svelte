<script lang="ts">
  import { dataStore } from "./lib/data";
  import { setOpen } from "./lib/utils";
</script>

<main>
  <div>
    <p>Position: {$dataStore?.location?.lat}, {$dataStore?.location?.lng}</p>
    <p>Description: {$dataStore?.location?.descritpion}</p>
    <p>Short Description: {$dataStore?.location?.shortDescription}</p>
    <button onclick={() => setOpen(!$dataStore.opened)}>
      {$dataStore.opened ? "Close" : "Open"}
    </button>
  </div>
</main>
