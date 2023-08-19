import { motion } from "framer-motion";
import { flatMap, flatten, random } from "lodash";
import { useLayoutEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { enableMapSet } from "immer";

import { useSize } from "../hooks/useSize";

import { ObjectInspector } from "./ObjectInspector";

enableMapSet();

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

function Node({ node, position, container, onMove }) {
    return (
        <motion.div
            className="absolute"
            drag
            dragConstraints={container}
            dragElastic={false}
            whileDrag={{ scale: 1.2 }}
            dragMomentum={false}
            onDrag={onMove}
            style={{
                x: position.x,
                y: position.y,
            }}
        >
            <div className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer select-none bg-emerald-400 center">
                {node}
            </div>
        </motion.div>
    );
}

function Edge({ from, to }) {
    const length = Math.sqrt((from.x - to.x) * (from.x - to.x) + (from.y - to.y) * (from.y - to.y));
    const angle = Math.atan((from.y - to.y) / (from.x - to.x)) + (to.x < from.x ? Math.PI : 0);

    return (
        <div
            className="absolute h-2 bg-amber-500"
            style={{
                width: length,
                transformOrigin: `left`,
                transform: `translate(calc(${from.x}px), calc(${from.y}px)) rotate(${angle}rad)`,
            }}
        ></div>
    );
}

export function Graph({ neighbors }) {
    const start = "start";
    const end = "end";

    const nodes = Array.from(neighbors.keys());
    const edges = flatMap(Array.from(neighbors.entries()), ([k, v]) => v.map((n) => [k, n]));

    const ref = useRef(null);
    const { width, height } = useSize(ref);

    const [nodePositions, updateNodePositions] = useImmer(() => {
        const [w, h] = [width || 800, height || 200];
        const map = new Map();

        nodes.forEach((n) => map.set(n, { x: Math.random() * w, y: Math.random() * h }));
        map.set("start", { x: 40, y: height / 2 });
        map.set("end", { x: width - 50, y: height / 2 });

        return map;
    });

    const handleMove = (node, e) => {
        const box = e.target.getBoundingClientRect();
        const containerBox = ref.current.getBoundingClientRect();
        const newPos = { x: box.x - containerBox.x, y: box.y - containerBox.y };
        updateNodePositions((map) => map.set(node, newPos));
    };

    const edgePositions = edges.map(([from, to]) => [
        nodePositions.get(from),
        nodePositions.get(to),
    ]);

    return (
        <div className="relative w-full h-full border-4 bg-slate-900" ref={ref}>
            {nodes.map((node, i) => (
                <Node
                    key={i}
                    node={node}
                    position={nodePositions.get(node)}
                    container={ref}
                    onMove={(e) => handleMove(node, e)}
                />
            ))}
            {edges.map(([from, to], i) => (
                <Edge
                    key={i}
                    from={nodePositions.get(from)}
                    to={nodePositions.get(to)}
                    edges={edgePositions}
                />
            ))}
        </div>
    );
}
