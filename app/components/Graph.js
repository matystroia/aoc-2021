import { flatMap, flatten } from "lodash";
import { useLayoutEffect, useRef, useState } from "react";
import { ObjectInspector } from "./ObjectInspector";

function bfs(neighbors, node) {
    const ret = [[node]];

    while (true) {
        const currentLayer = ret.at(-1);
        const nextLayer = flatMap(currentLayer, (node) =>
            neighbors.get(node).filter((n) => !flatten(ret).includes(n))
        );
        if (nextLayer.length === 0) break;
        ret.push(nextLayer);
    }

    return ret;
}

function isIntersection(edge1, edge2) {
    const [[from1, to1], [from2, to2]] = [edge1, edge2];
    console.log({ from1, to1, from2, to2 });

    const { x: x1, y: y1 } = from1;
    const { x: x2, y: y2 } = to1;
    const { x: x3, y: y3 } = from2;
    const { x: x4, y: y4 } = to2;

    const t =
        ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) /
        ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    const u =
        ((x1 - x3) / (y1 - y2) - (y1 - y3) * (x1 - x2)) /
        ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    return (t >= 0 && t <= 1) || (u >= 0 && u <= 1);
}

function Node({ node, position }) {
    return (
        <div
            className="absolute rounded-full bg-emerald-400 w-20 h-20 cursor-pointer select-none center"
            style={{
                left: position.x,
                top: position.y,
                transform: "translate(-50%, -50%)",
            }}
        >
            {node}
        </div>
    );
}

function Edge({ from, to, edges }) {
    const length = Math.sqrt((from.x - to.x) * (from.x - to.x) + (from.y - to.y) * (from.y - to.y));
    const angle = Math.atan((from.y - to.y) / (from.x - to.x)) + (to.x < from.x ? Math.PI : 0);

    const intersected = edges.filter((e) => isIntersection([from, to], e));

    return (
        <div
            className="absolute h-2 bg-amber-500"
            style={{
                width: length,
                transformOrigin: `left`,
                transform: `translate(calc(${from.x}px), calc(${from.y}px)) rotate(${angle}rad)`,
            }}
        >
            <span className="text-red-500">{intersected.length}</span>
        </div>
    );
}

export function Graph({ neighbors }) {
    const start = "start";
    const end = "end";

    const nodes = Array.from(neighbors.keys());
    const edges = flatMap(Array.from(neighbors.entries()), ([k, v]) => v.map((n) => [k, n]));

    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        if (!ref.current) return;
        const { width, height } = ref.current.getBoundingClientRect();
        setSize({ width, height });
    }, []);

    const nodePositions = new Map();
    nodes.forEach((n) =>
        nodePositions.set(n, { x: Math.random() * size.width, y: Math.random() * size.height })
    );
    nodePositions.set("start", { x: 40, y: size.height / 2 });
    nodePositions.set("end", { x: size.width - 50, y: size.height / 2 });

    const edgesPos = edges.map(([from, to]) => [nodePositions.get(from), nodePositions.get(to)]);

    return (
        <div className="relative bg-slate-900 h-full w-full border-4" ref={ref}>
            {nodes.map((node, i) => (
                <Node key={i} node={node} position={nodePositions.get(node)} />
            ))}
            {edges.map(([from, to], i) => (
                <Edge
                    key={i}
                    from={nodePositions.get(from)}
                    to={nodePositions.get(to)}
                    edges={edgesPos}
                />
            ))}
        </div>
    );
}
