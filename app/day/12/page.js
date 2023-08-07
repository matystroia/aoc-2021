"use client";

import { useContext } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { toUpper } from "lodash";
import { Graph } from "app/components/Graph";

const addEdge = (edges, node, edge) => {
    if (!edges.has(node)) {
        edges.set(node, []);
    }
    edges.set(node, edges.get(node).concat(edge));
};

const isBig = (node) => toUpper(node) === node;

const canVisit = (node, visited, isPartTwo) => {
    if (isBig(node)) return true;
    if (node === "start") return false;
    if (isPartTwo) {
        const smallVisited = visited.filter((n) => !isBig(n));
        const smallTwice = smallVisited.length > new Set(smallVisited).size;
        return !smallTwice || !visited.includes(node);
    } else {
        return !visited.includes(node);
    }
};
const dfs = (neighbors, node, visited, isPartTwo) => {
    const newVisited = visited.slice();
    newVisited.push(node);

    if (node === "end") return [newVisited];

    const ret = [];
    neighbors.get(node).forEach((neighbor) => {
        if (canVisit(neighbor, newVisited, isPartTwo)) {
            const nextPaths = dfs(neighbors, neighbor, newVisited, isPartTwo);
            ret.push(...nextPaths);
        }
    });

    return ret;
};

export default function Day12() {
    const { lines, isPartOne } = useContext(ChallengeContext);

    const nodes = new Set();
    const neighbors = new Map();

    lines.forEach((s) => {
        const [from, to] = s.split("-");
        nodes.add(from);
        nodes.add(to);
        addEdge(neighbors, from, to);
        addEdge(neighbors, to, from);
    });

    const paths = dfs(neighbors, "start", [], !isPartOne);

    return (
        <div className="h-full center">
            <Graph neighbors={neighbors} />
        </div>
    );
}
