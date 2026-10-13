<<<<<<< HEAD
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
=======
# 🔗 MissingLink — Bringing People Back Together
**A community-powered platform to help people find what's lost and reconnect with what matters.**

## 🌍 Overview
MissingLink is a web-based platform designed to bridge the gap between people searching for something or someone missing and the communities that can help them.

When a person goes missing or an important belonging is lost, finding reliable information quickly can be difficult. MissingLink aims to make this process easier by providing a centralized place where users can share missing reports, discover relevant information, and work together to spread awareness.

Our goal is simple: **turn individual searches into collective action.**

## 🎯 Problem Statement
Finding missing people or lost belongings often relies on scattered social media posts, word of mouth, and disconnected communication channels. This can make information difficult to discover, share, and track.

MissingLink addresses this challenge by bringing relevant reports and community participation together in one accessible platform.

## 💡 Our Solution
MissingLink provides a common digital space where people can:

- **Report:** Share information about a missing person or lost item.
- **Discover:** Browse reports and find information relevant to their search.
- **Spread Awareness:** Help circulate information within the community.
- **Reconnect:** Support communication between people searching and those who may have useful information.
The platform focuses on accessibility, community participation, and making important information easier to find.

## ✨ Key Features

- **Centralized Reports:** Keep missing-person and lost-item information organized in one place.
- **Community-Powered Search:** Enable people to contribute information and assist others.
- **Simple User Experience:** Make it easy for users to navigate and access relevant reports.
- **Responsive Web Interface:** Provide a convenient way to access the platform through a web browser.
- **Faster Information Sharing:** Help relevant information reach a wider audience.
*Note: Features listed here should match the functionality implemented in the current version of the project.*

## 🔄 How It Works

1. **Submit a report** — A user shares details about a missing person or lost belonging.
2. **Make information discoverable** — The report becomes available for others to view, according to the platform's implemented functionality.
3. **Community participation** — People who recognize relevant details can help by sharing information or responding through supported channels.
4. **Work toward reconnection** — Useful leads can help the people involved take the next steps.

## 👥 Who Is It For?

- Families and friends searching for missing people.
- People who have lost valuable or important belongings.
- Individuals who have found something and want to help return it.
- Community members who want to support local searches.

## 🛠️ Technology Stack
The project uses modern web technologies to provide an accessible browser-based experience.

**Tech Stack — MissingLink**

- Frontend: React + TypeScript
- UI Components: TSX
- Build Tool: Vite
- Styling: CSS / Tailwind CSS (if actively used)
- Package Management: npm

Backend and database: To be confirmed based on the project implementation.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm, if required by the project.
- Git, if you want to clone the repository.
- A modern web browser.

### Installation

1. Clone the repository:

```
git clone <YOUR_REPOSITORY_URL>
```
2. Navigate to the project directory:

```
cd <PROJECT_FOLDER>
```
3. Install dependencies:

```
npm install
```
4. Start the development server using the script configured in `package.json`:

```
npm run dev
```
5. Open the local URL displayed in your terminal.
**Note:** These instructions assume a Node.js project with an npm development script. Update them to match your actual project configuration.

## 🔐 Privacy and Safety
Missing-person reports can involve sensitive personal information. MissingLink should prioritize responsible information sharing.

- Share only information that is necessary and appropriate.
- Avoid publishing private addresses, phone numbers, or other sensitive details without authorization.
- Verify information before acting on a report.
- Direct urgent missing-person cases to the appropriate local authorities.
- Do not use the platform to harass, impersonate, or spread unverified accusations.
Privacy controls, moderation, and secure handling of reports should be implemented wherever applicable.

## 🔮 Future Scope
Potential improvements include:

- Location-based discovery and map integration.
- Image-assisted matching of reports.
- Notifications for relevant new reports.
- Secure messaging between authorized users.
- Report verification and moderation tools.
- Multilingual support for local communities.
- A verified resolution workflow for successfully reunited people or recovered belongings.
These are proposed enhancements unless already implemented.

## 🏆 Why MissingLink Matters
MissingLink is more than a reporting website. It explores how technology can bring communities together around real-world problems.

By making information easier to share and discover, the platform aims to reduce the distance between someone searching for answers and someone who can help.

**One report. One helpful lead. One step closer to reconnecting.**

## 👨‍💻 Built For
**Hackathon Project — MissingLink**

Created with the goal of using technology to solve a meaningful community problem.

---

*MissingLink supports community information sharing. It does not replace official missing-person reporting procedures

send missing ones
>>>>>>> cff5ee4f98e0ffda9ed1e80ba6f2bd56ff8ed520
