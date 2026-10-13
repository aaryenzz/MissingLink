# MissingLink

MissingLink is a local, fictional transport-resilience simulator. It models how connection closures and slower travel times can change sample journeys, with every displayed impact calculated from the network and journey inputs at runtime.

> **Simulation only:** All locations, stops, connections, journey labels, categories, times, and capacities in this project are fictional. The app is not an emergency-routing service and does not use real passenger counts or live transport data.

## Requirements

- Node.js 20 or newer (includes npm)
- A modern browser

## Install and run

Open a terminal in the project folder and run:

```powershell
npm install
npm run dev
```

Vite prints a local address, normally `http://localhost:5173`. Open that address in a browser.

## Verify the project

```powershell
npm test
npm run build
```

`npm test` runs the Vitest routing, scenario, and impact tests. `npm run build` checks TypeScript and creates a production build in `dist/`.

## What the numbers mean

- A journey is **delayed** when a valid scenario route exists and is slower than its fastest baseline route.
- A journey is **stranded** when the scenario has no route, even if it still had a baseline route.
- **Affected journeys** are delayed plus stranded. A delayed journey is never counted as stranded.
- A deadline miss is calculated separately when a route exists and both departure and expected-arrival deadline data are available. A stranded journey has no modeled arrival time, so it is not assigned a deadline-miss result.
- A **significant delay** defaults to 15 or more additional minutes. Adjust the threshold in the network view; it changes critical-destination highlighting and is an explanatory rule, not a prediction of harm.
- Category and time-sensitive labels describe synthetic journey inputs; they do not create passenger totals, priority scores, or verified predictions about people.
- Dijkstra finds the fastest route over enabled connections with non-negative travel times. Disruption scenarios are derived copies; the source network remains unchanged.

## Demo data and scenarios

The local dataset contains 20 fictional stops, 27 fictional connections, and 24 fictional journey records. Five presets are included: no disruption, single bridge closure, bus cancellation, multiple road closures, and increased travel times on selected roads. The map also lets you select a connection and close or reopen it manually. Reset returns to the original baseline.

## Demo for judges

1. Start at Network overview and point out the fictional-data label and network legend.
2. Select **Single bridge closure** in the scenario control. Explain that affected, delayed, stranded, deadline, destination, and chart values are recomputed from the journey records.
3. Select the bridge connection on the map and reopen it. Show the map and metrics update immediately, then choose Reset to restore the source network.
4. Open Journey analysis, select a delayed or stranded row, and read its baseline/scenario route explanation.
5. Open Scenario laboratory to compare scenario outcomes against the no-disruption baseline.
6. Open Impact report and use **Print report** to preview the explainable, disclaimer-labeled output.

## Main files

- `src/data/network.ts`, `src/data/journeys.ts`, `src/data/scenarios.ts`: fictional source inputs.
- `src/engine/routing.ts`: standalone Dijkstra shortest-path algorithm.
- `src/engine/scenarios.ts`: non-mutating scenario derivation.
- `src/engine/impact.ts`: journey classification, deadlines, detours, and critical-destination summary.
- `src/engine/*.test.ts`: routing and impact test coverage.
- `src/components/NetworkCanvas.tsx`: interactive React Flow schematic.
- `src/App.tsx`: dashboard, controls, comparison, journey inspection, and report.
- `src/index.css`: responsive visual system and print layout.