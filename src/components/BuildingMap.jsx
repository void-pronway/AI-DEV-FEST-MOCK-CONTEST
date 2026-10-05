function BuildingMap({
  building,
  hazardState,
  routeResult,
  selectedStart,
  hazardMode,
  onSelectStart,
  onToggleNode,
  onToggleEdge,
  onToggleExit,
}) {
  if (!building) return null;

  const nodeMap = new Map(
    building.nodes.map((node) => [node.id, node]),
  );

  const xs = building.nodes.map((node) => node.x);
  const ys = building.nodes.map((node) => node.y);

  const padding = 70;

  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  const routePairs = new Set();

  if (routeResult?.status === "success") {
    for (let i = 0; i < routeResult.path.length - 1; i += 1) {
      const pair = [
        routeResult.path[i],
        routeResult.path[i + 1],
      ]
        .sort()
        .join("::");

      routePairs.add(pair);
    }
  }

  function handleNodeClick(node) {
    if (hazardMode) {
      if (node.type === "exit") {
        onToggleExit(node.id);
      } else {
        onToggleNode(node.id);
      }

      return;
    }

    if (
      node.type !== "exit" &&
      !hazardState.blocked_nodes.includes(node.id)
    ) {
      onSelectStart(node.id);
    }
  }

  return (
    <div className="building-map-wrapper">
      {hazardMode && (
        <div className="hazard-mode-banner">
          Hazard Edit Mode — Click nodes, corridors or exits
        </div>
      )}

      <svg
        className={`building-map ${
          hazardMode ? "hazard-editing" : ""
        }`}
        viewBox={`${minX} ${minY} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* EDGES */}

        <g className="map-edges">
          {building.edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);

            if (!from || !to) return null;

            const blocked =
              hazardState.blocked_edges.includes(edge.id);

            const pair = [edge.from, edge.to]
              .sort()
              .join("::");

            const activeRoute =
              routeResult?.status === "success" &&
              routePairs.has(pair);

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <g
                key={edge.id}
                className={`edge-group ${
                  hazardMode ? "edge-clickable" : ""
                }`}
                onClick={() => {
                  if (hazardMode) {
                    onToggleEdge(edge.id);
                  }
                }}
              >
                {/* Large invisible click target */}
                <line
                  className="edge-hitbox"
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                />

                <line
                  className={`map-edge ${
                    blocked ? "blocked-edge" : ""
                  } ${
                    activeRoute && !blocked
                      ? "active-route-edge"
                      : ""
                  }`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                />

                <g
                  className={`edge-cost ${
                    blocked ? "blocked-cost" : ""
                  }`}
                  transform={`translate(${midX}, ${midY})`}
                >
                  <circle r="13" />

                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {blocked ? "×" : edge.cost}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* NODES */}

        <g className="map-nodes">
          {building.nodes.map((node) => {
            const blocked =
              hazardState.blocked_nodes.includes(node.id);

            const closed =
              node.type === "exit" &&
              hazardState.closed_exits.includes(node.id);

            const selected = selectedStart === node.id;

            const inRoute =
              routeResult?.status === "success" &&
              routeResult.path.includes(node.id);

            return (
              <g
                key={node.id}
                className={`map-node node-${node.type}
                  ${blocked ? "blocked-node" : ""}
                  ${closed ? "closed-exit" : ""}
                  ${selected ? "selected-node" : ""}
                  ${inRoute ? "active-route-node" : ""}
                  ${hazardMode ? "hazard-clickable" : ""}
                `}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
              >
                <circle
                  className="node-circle"
                  r="22"
                />

                <text
                  className="node-id"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {blocked || closed ? "×" : node.id}
                </text>

                <text
                  className="node-label"
                  textAnchor="middle"
                  y="39"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="map-legend">
        <span>
          <i className="legend-dot room-dot" />
          Room
        </span>

        <span>
          <i className="legend-dot junction-dot" />
          Junction
        </span>

        <span>
          <i className="legend-dot exit-dot" />
          Exit
        </span>

        <span>
          <i className="legend-dot hazard-dot" />
          Hazard
        </span>
      </div>
    </div>
  );
}

export default BuildingMap;