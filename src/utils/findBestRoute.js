function comparePaths(pathA, pathB) {
  const length = Math.min(pathA.length, pathB.length);

  for (let i = 0; i < length; i += 1) {
    const comparison = pathA[i].localeCompare(pathB[i]);

    if (comparison !== 0) {
      return comparison;
    }
  }

  return pathA.length - pathB.length;
}

export function findBestRoute(building, startId, hazardState) {
  if (!building || !startId) {
    return {
      status: "waiting",
      path: [],
      cost: null,
      exitId: null,
    };
  }

  const blockedNodes = new Set(hazardState.blocked_nodes);
  const blockedEdges = new Set(hazardState.blocked_edges);
  const closedExits = new Set(hazardState.closed_exits);

  if (blockedNodes.has(startId)) {
    return {
      status: "blocked-start",
      path: [],
      cost: null,
      exitId: null,
    };
  }

  const nodeMap = new Map(
    building.nodes.map((node) => [node.id, node]),
  );

  const adjacency = new Map();

  building.nodes.forEach((node) => {
    adjacency.set(node.id, []);
  });

  building.edges.forEach((edge) => {
    if (blockedEdges.has(edge.id)) {
      return;
    }

    if (
      blockedNodes.has(edge.from) ||
      blockedNodes.has(edge.to)
    ) {
      return;
    }

    adjacency.get(edge.from)?.push({
      node: edge.to,
      cost: edge.cost,
      edgeId: edge.id,
    });

    adjacency.get(edge.to)?.push({
      node: edge.from,
      cost: edge.cost,
      edgeId: edge.id,
    });
  });

  const best = new Map();

  const queue = [
    {
      node: startId,
      cost: 0,
      path: [startId],
    },
  ];

  best.set(startId, {
    cost: 0,
    path: [startId],
  });

  while (queue.length > 0) {
    queue.sort((a, b) => {
      if (a.cost !== b.cost) {
        return a.cost - b.cost;
      }

      return comparePaths(a.path, b.path);
    });

    const current = queue.shift();

    const knownBest = best.get(current.node);

    if (!knownBest) continue;

    if (
      current.cost !== knownBest.cost ||
      comparePaths(current.path, knownBest.path) !== 0
    ) {
      continue;
    }

    const neighbors = adjacency.get(current.node) ?? [];

    neighbors.forEach((neighbor) => {
      const nextNode = nodeMap.get(neighbor.node);

      if (!nextNode) return;

      if (
        nextNode.type === "exit" &&
        closedExits.has(nextNode.id)
      ) {
        return;
      }

      const nextCost = current.cost + neighbor.cost;

      const nextPath = [
        ...current.path,
        neighbor.node,
      ];

      const previous = best.get(neighbor.node);

      const isBetterCost =
        !previous || nextCost < previous.cost;

      const isBetterTie =
        previous &&
        nextCost === previous.cost &&
        comparePaths(nextPath, previous.path) < 0;

      if (isBetterCost || isBetterTie) {
        best.set(neighbor.node, {
          cost: nextCost,
          path: nextPath,
        });

        queue.push({
          node: neighbor.node,
          cost: nextCost,
          path: nextPath,
        });
      }
    });
  }

  const candidates = building.nodes
    .filter(
      (node) =>
        node.type === "exit" &&
        !closedExits.has(node.id) &&
        !blockedNodes.has(node.id) &&
        best.has(node.id),
    )
    .map((exitNode) => ({
      exitId: exitNode.id,
      cost: best.get(exitNode.id).cost,
      path: best.get(exitNode.id).path,
    }));

  if (candidates.length === 0) {
    return {
      status: "no-route",
      path: [],
      cost: null,
      exitId: null,
    };
  }

  candidates.sort((a, b) => {
    if (a.cost !== b.cost) {
      return a.cost - b.cost;
    }

    const exitComparison =
      a.exitId.localeCompare(b.exitId);

    if (exitComparison !== 0) {
      return exitComparison;
    }

    return comparePaths(a.path, b.path);
  });

  return {
    status: "success",
    ...candidates[0],
  };
}