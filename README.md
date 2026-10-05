# নিরাপদ পথ | Smart Escape

**Interactive Evacuation Route Simulator**

Smart Escape is a frontend-only browser application built for the **AI DevFest Mock Contest**. It visualizes a building as an interactive weighted graph and calculates the lowest-cost evacuation route from a selected room or junction to the best available exit.

The application automatically recalculates the route when hazards change, including blocked rooms, blocked junctions, blocked corridors, and closed exits.

> **Important:** Smart Escape is an educational simulation and is not a certified real-world evacuation planning tool.

---

## Participant Information

- **Name:** Pronway Mitra
- **Registration Number:** `YOUR-REGISTRATION-NUMBER`
- **Repository:** `YOUR-GITHUB-REPOSITORY-URL`
- **Live Website:** `YOUR-LIVE-WEBSITE-URL`

---

## Features

### Interactive Building Map

The building is rendered dynamically from an imported `building.json` file.

The application displays:

- Rooms
- Junctions
- Exits
- Corridors
- Corridor costs
- Active evacuation route
- Blocked locations
- Blocked corridors
- Closed exits

The map uses the node coordinates supplied by the dataset instead of a hard-coded layout.

---

### Lowest-Cost Evacuation Routing

Smart Escape calculates the lowest-cost route from the selected starting location to an accessible exit.

Route cost is calculated using the provided corridor weights.

The routing system supports:

- Weighted undirected graphs
- Multiple exits
- Disconnected graphs
- Blocked nodes
- Blocked corridors
- Closed exits
- Automatic rerouting
- No-route detection
- Blocked-start detection

Tie-breaking follows the competition specification:

1. Choose the route with the lowest total cost.
2. If multiple exits have the same cost, choose the lexicographically smallest exit ID.
3. If multiple paths to the same exit have equal cost, choose the lexicographically smallest sequence of node IDs.

---

## Interactive Hazard Mode

Click **Manage Hazards** to enter hazard-edit mode.

While hazard mode is active:

- Click a **room or junction** to block or unblock it.
- Click a **corridor** to block or unblock it.
- Click an **exit** to close or reopen it.

The evacuation route recalculates immediately after every change.

Blocked elements are visually distinguished from available elements.

---

## Direct Map Interaction

The map itself is interactive.

Outside hazard mode, clicking an available room or junction selects it as the starting location.

The selected route is visually highlighted and animated across the building graph.

---

## Bangla and English

The application supports both:

- **English**
- **বাংলা**

The language switch changes the primary interface labels, controls, instructions, route statuses, and messages.

Dataset-provided node labels remain unchanged.

The application name also alternates visually between:

**নিরাপদ পথ**

and

**SMART ESCAPE**

---

## Light and Dark Mode

The interface includes both:

- Light theme
- Dark theme

Users can switch themes using the theme toggle in the header.

---

## JSON Import and Validation

Users can import a local `building.json` file directly from the browser.

The application validates the dataset before loading it.

Validation includes:

- Building name
- Node IDs
- Node labels
- Node types
- Node coordinates
- Duplicate node IDs
- Edge IDs
- Duplicate edge IDs
- Valid edge endpoints
- Positive integer corridor costs
- Self-loops
- Repeated node pairs
- Initial blocked nodes
- Initial blocked corridors
- Initial closed exits
- Correct hazard categories
- Required graph size limits

Malformed or inconsistent datasets are rejected with visible error messages.

---

## Sample Dataset

The provided practice dataset contains:

- 8 nodes
- 9 corridors
- 2 rooms
- 4 junctions
- 2 exits

Example baseline route:

```text
R1 → C1 → C2 → E1
Total Cost: 7
```

After blocking `C2`:

```text
R1 → C1 → C3 → C4 → E2
Total Cost: 11
```

---

## Required Test Scenarios

The project supports the official practice scenarios.

### Baseline

Starting location:

```text
R1
```

Expected result:

```text
R1 → C1 → C2 → E1
Cost: 7
```

### Blocked Junction

Starting location:

```text
R1
```

Then block:

```text
C2
```

Expected result:

```text
R1 → C1 → C3 → C4 → E2
Cost: 11
```

### Closed Exits

Close:

```text
E1
E2
```

Expected result:

```text
No route available
```

### Different Start

Starting location:

```text
R2
```

Expected result:

```text
R2 → C3 → C4 → E2
Cost: 7
```

### Blocked Starting Location

Select:

```text
R1
```

Then block:

```text
R1
```

Expected result:

```text
Starting location blocked
```

---

## Technology Stack

- React
- JavaScript
- Vite
- CSS
- SVG
- HTML5 FileReader API
- Git
- GitHub

The application is fully frontend-only.

No backend, serverless function, persistent remote database, or external routing API is required.

---

## Project Structure

```text
src/
├── components/
│   └── BuildingMap.jsx
│
├── utils/
│   ├── findBestRoute.js
│   └── validateBuilding.js
│
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

Additional files include:

```text
building.json
README.md
LICENSE
package.json
vite.config.js
```

---

## Running Locally

### Requirements

Install:

- Node.js
- npm

### Clone the repository

```bash
git clone YOUR-GITHUB-REPOSITORY-URL
```

Enter the project folder:

```bash
cd devfest-YOUR-REGISTRATION-NUMBER
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173/
```

---

## Production Build

Create a production build with:

```bash
npm run build
```

The generated production files will be placed inside:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

## Screenshots

### Baseline Route

Add the baseline screenshot here:

```markdown
![Baseline Route](screenshots/baseline-route.png)
```

### Rerouting After Blocking C2

Add the rerouting screenshot here:

```markdown
![Rerouting After C2 Is Blocked](screenshots/c2-blocked-route.png)
```

The `screenshots/` directory should contain both required screenshots before final submission.

---

## AI Tools Used

AI-assisted development was used during the project.

Primary AI tool:

- **ChatGPT**

AI assistance was used for:

- Project architecture
- React component design
- JSON validation logic
- Weighted graph routing logic
- Tie-breaking implementation
- Interactive SVG map development
- Hazard interaction design
- Bangla/English interface support
- Light/dark theme implementation
- Debugging
- README preparation

All generated code was reviewed, tested, and integrated into the final application.

---

## Most Useful AI Prompt

```text
Build a frontend-only React application for an interactive evacuation route simulator.

The application must import and validate a building.json file containing rooms, junctions, exits, weighted undirected corridors and initial hazard states.

Calculate the lowest-cost route from a selected room or junction to an accessible exit. Exclude blocked nodes and their incident edges, blocked corridors and closed exits.

On equal route cost, choose the lexicographically smallest exit ID. If paths to that exit also tie, choose the lexicographically smallest sequence of node IDs.

Allow users to interact directly with the building map to block or unblock rooms, junctions and corridors and close or reopen exits. Recalculate the route immediately after every change.

Include Bangla and English language modes, light and dark themes, responsive design and subtle route/hazard animations.

The solution must be completely frontend-only and must work with unseen datasets using the same JSON schema.
```

---

## Known Issues

- The application is intended for educational simulation only.
- Very dense graphs may result in overlapping labels because node positions are determined by dataset-provided coordinates.
- Dataset labels are displayed exactly as supplied and are not automatically translated.

---

## License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

---

## Copyright

© 2026 Pronway Mitra. All rights reserved.

Built for the **AI DevFest Mock Contest**.
