export function validateBuilding(data) {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {
      valid: false,
      errors: ["The JSON root must be an object."],
    };
  }

  // Building name
  if (typeof data.building !== "string" || !data.building.trim()) {
    errors.push("building must be a non-empty string.");
  }

  // Nodes
  if (!Array.isArray(data.nodes)) {
    errors.push("nodes must be an array.");
  } else {
    if (data.nodes.length < 2 || data.nodes.length > 60) {
      errors.push("nodes must contain between 2 and 60 items.");
    }

    const nodeIds = new Set();

    data.nodes.forEach((node, index) => {
      if (!node || typeof node !== "object") {
        errors.push(`Node ${index + 1} must be an object.`);
        return;
      }

      if (typeof node.id !== "string" || !node.id) {
        errors.push(`Node ${index + 1} must have a valid id.`);
      } else if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node id: ${node.id}`);
      } else {
        nodeIds.add(node.id);
      }

      if (typeof node.label !== "string" || !node.label.trim()) {
        errors.push(`Node ${node.id || index + 1} must have a non-empty label.`);
      }

      if (!["room", "junction", "exit"].includes(node.type)) {
        errors.push(
          `Node ${node.id || index + 1} has invalid type "${node.type}".`,
        );
      }

      if (
        typeof node.x !== "number" ||
        !Number.isFinite(node.x) ||
        typeof node.y !== "number" ||
        !Number.isFinite(node.y)
      ) {
        errors.push(
          `Node ${node.id || index + 1} must have numeric x and y coordinates.`,
        );
      }
    });

    const hasExit = data.nodes.some((node) => node?.type === "exit");
    const hasStartNode = data.nodes.some(
      (node) => node?.type === "room" || node?.type === "junction",
    );

    if (!hasExit) {
      errors.push("The building must contain at least one exit.");
    }

    if (!hasStartNode) {
      errors.push(
        "The building must contain at least one room or junction.",
      );
    }
  }

  // Edges
  if (!Array.isArray(data.edges)) {
    errors.push("edges must be an array.");
  } else {
    if (data.edges.length < 1 || data.edges.length > 150) {
      errors.push("edges must contain between 1 and 150 items.");
    }

    const nodeIds = new Set(
      Array.isArray(data.nodes)
        ? data.nodes
            .filter((node) => node && typeof node.id === "string")
            .map((node) => node.id)
        : [],
    );

    const edgeIds = new Set();
    const nodePairs = new Set();

    data.edges.forEach((edge, index) => {
      if (!edge || typeof edge !== "object") {
        errors.push(`Edge ${index + 1} must be an object.`);
        return;
      }

      if (typeof edge.id !== "string" || !edge.id) {
        errors.push(`Edge ${index + 1} must have a valid id.`);
      } else if (edgeIds.has(edge.id)) {
        errors.push(`Duplicate edge id: ${edge.id}`);
      } else {
        edgeIds.add(edge.id);
      }

      if (!nodeIds.has(edge.from)) {
        errors.push(
          `Edge ${edge.id || index + 1} references unknown node "${edge.from}".`,
        );
      }

      if (!nodeIds.has(edge.to)) {
        errors.push(
          `Edge ${edge.id || index + 1} references unknown node "${edge.to}".`,
        );
      }

      if (edge.from === edge.to) {
        errors.push(`Edge ${edge.id || index + 1} contains a self-loop.`);
      }

      if (!Number.isInteger(edge.cost) || edge.cost <= 0) {
        errors.push(
          `Edge ${edge.id || index + 1} must have a positive integer cost.`,
        );
      }

      if (
        typeof edge.from === "string" &&
        typeof edge.to === "string" &&
        edge.from !== edge.to
      ) {
        const pair = [edge.from, edge.to].sort().join("::");

        if (nodePairs.has(pair)) {
          errors.push(
            `Repeated corridor between ${edge.from} and ${edge.to}.`,
          );
        } else {
          nodePairs.add(pair);
        }
      }
    });
  }

  // Initial state
  const initialState = data.initial_state;

  if (
    !initialState ||
    typeof initialState !== "object" ||
    Array.isArray(initialState)
  ) {
    errors.push("initial_state must be an object.");
  } else {
    const requiredArrays = [
      "blocked_nodes",
      "blocked_edges",
      "closed_exits",
    ];

    requiredArrays.forEach((field) => {
      if (!Array.isArray(initialState[field])) {
        errors.push(`initial_state.${field} must be an array.`);
      }
    });

    if (Array.isArray(data.nodes)) {
      const nodeMap = new Map(data.nodes.map((node) => [node.id, node]));

      if (Array.isArray(initialState.blocked_nodes)) {
        initialState.blocked_nodes.forEach((id) => {
          const node = nodeMap.get(id);

          if (!node) {
            errors.push(`Unknown blocked node: ${id}`);
          } else if (node.type === "exit") {
            errors.push(
              `Exit ${id} cannot appear in blocked_nodes. Use closed_exits.`,
            );
          }
        });
      }

      if (Array.isArray(initialState.closed_exits)) {
        initialState.closed_exits.forEach((id) => {
          const node = nodeMap.get(id);

          if (!node) {
            errors.push(`Unknown closed exit: ${id}`);
          } else if (node.type !== "exit") {
            errors.push(`${id} is not an exit and cannot be in closed_exits.`);
          }
        });
      }
    }

    if (Array.isArray(data.edges) && Array.isArray(initialState.blocked_edges)) {
      const edgeIds = new Set(data.edges.map((edge) => edge.id));

      initialState.blocked_edges.forEach((id) => {
        if (!edgeIds.has(id)) {
          errors.push(`Unknown blocked edge: ${id}`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}