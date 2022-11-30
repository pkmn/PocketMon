# Design

TODO

## Data

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil
> Karlton

PocketMon relies on a large number of assets and needs to take care to balance latency,
bandwidth/disk usage, freshness, and offline support.

PocketMon uses the following assets from https://data.pkmn.cc:

- `stats` / `formats`: Usage statistics and format name lookup.
- `sets` / `analyses`: Smogon sets and analyses for Pokémon.
- `randbats`: Random Battle moveset options and statistics.

All of the above are fetched on demand (e.g. when looking up usage stats information, when viewing
an analysis, etc) and then cached indefinitely. Users may explicitly opt-in to additonal assets
being cached for offline use - these will be immediately fetched and cached. PocketMon will
periodically poll for the https://data.pkmn.cc/index.json which it will compare to previous versions
to determine if updates have occured and refetch any data that has changed. Users can delete data to
save space on their device.

_**TODO**: determine what is cached?_

- `imgs`: Pokémon sprites and icons sourced from [pkmn/sprites](https://github.com/pkmn/sprites).
  These images are **not** the same as those used by Pokémon Showdown - these are deduplicated and
  lack padding and require a thick client which can use the `index.json` to figure out how to locate
  the correct resources.

_**TODO**: make `@pkmn/img` support both, ideally with same API but different entrypoint_

Image resources are always fetched on-demand and then will only be refetched after 30 days or if the
user forces them to be refetched. Users can force any release's images to be fetched and stored,
though only static images will be supported (i.e. a single still frame in generations where sprites
are animated or models are used). Battle sprites are used through the UI unlike Pokémon Showdown
which has separate Pokédex sprites for its teambuilder.

## Initial Load

- index.tsx / index.css / sw.ts
- restore state from local storage
- in background:
  - check if time since last data/index.json has been > 1 hour or if no data/index.json, if so,
    fetch new data/index.json, check if need to refetch (may also need to fetch the index.json for
    sprites)
  - download all data from current gen if nothing cached
- preload JS
  - @pkmn/{data,smogon,img}
  - when navigating to stats (or pane in battle) import uplot & fetch usage stats
  - when navigating to dex (or pane in battle) fetch analyses/sets
  - when navigating to calc (or pane in battle) import @pkmn/dmg & fetch sets / usage stats
  - when navigating to teambuilder require @pkmn/sim for team validator
  - everything requires @pkmn/sim for data...
  - battle requires @pkmn/{sim,protocol,epoke,predictor,gmd,view,spread,engine}

### Storage

### [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

- preferences
- application state

### [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

- asset status (/ cache?)
- teams
- battle history

### [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
