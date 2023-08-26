"use client";

import { useContext } from "react";
import {
    chunk,
    flatMap,
    inRange,
    min,
    max,
    range,
    intersectionWith,
    isEqual,
    flatten,
    unionWith,
    filter,
    minBy,
} from "lodash";

import { normalizePoints, randomHSL } from "../../utils";
import { Canvas, CanvasContext } from "../../components/Canvas";
import { ObjectInspector } from "../../components/ObjectInspector";
import { ChallengeContext } from "../ChallengeWrapper";

function getLinePoints([from, to]) {
    if (from.x === to.x) {
        const [start, end] = [min([from.y, to.y]), max([from.y, to.y])];
        return range(start, end + 1).map((y) => ({
            x: from.x,
            y,
        }));
    } else if (from.y === to.y) {
        const [start, end] = [min([from.x, to.x]), max([from.x, to.x])];
        return range(start, end + 1).map((x) => ({
            x,
            y: from.y,
        }));
    } else if (from.x - from.y === to.x - to.y) {
        const [startX, endX] = [min([from.x, to.x]), max([from.x, to.x])];
        const [startY, endY] = [min([from.y, to.y]), max([from.y, to.y])];

        return range(endX - startX + 1).map((dx) => ({
            x: startX + dx,
            y: startY + dx,
        }));
    } else {
        const [startX, endX] = [min([from.x, to.x]), max([from.x, to.x])];
        const [startY, endY] = [min([from.y, to.y]), max([from.y, to.y])];

        return range(endY - startY + 1).map((dy) => ({
            x: endX - dy,
            y: startY + dy,
        }));
    }
}

function getIntersection(line1, line2) {
    return intersectionWith(getLinePoints(line1), getLinePoints(line2), isEqual);
}

export default function Day5() {
    const { lines, isPartOne } = useContext(ChallengeContext);

    const pairs = lines.map((s) => s.split("->").map((s) => s.split(",").map((s) => parseInt(s))));

    let vents = pairs.map(([from, to]) => [
        { x: from[0], y: from[1] },
        { x: to[0], y: to[1] },
    ]);

    // Only orthogonal lines for part one
    if (isPartOne) {
        vents = vents.filter(([from, to]) => from.x === to.x || from.y === to.y);
    }

    const pointSet = new Set();
    const intersectionSet = new Set();
    for (const vent of vents) {
        const linePoints = getLinePoints(vent);
        for (const p of linePoints) {
            const key = `${p.x},${p.y}`;
            if (pointSet.has(key)) {
                intersectionSet.add(key);
            } else {
                pointSet.add(key);
            }
        }
    }

    const intersectionPoints = [];
    for (const s of intersectionSet.values()) {
        const [x, y] = s.split(",");
        intersectionPoints.push({ x: parseInt(x), y: parseInt(y) });
    }

    const draw = (ctx, { width, height }) => {
        const canvasContext = new CanvasContext(ctx, width, height);
        canvasContext.fit(flatten(vents), 50);
        vents.forEach(([from, to]) => {
            canvasContext.ctx.strokeStyle = randomHSL(0.5);
            canvasContext.line(from, to);
        });

        intersectionPoints.forEach((p) => {
            canvasContext.ctx.fillStyle = "red";
            canvasContext.circle(p, 2);
        });
    };

    return (
        <div className="flex flex-col w-full h-full gap-2">
            <ObjectInspector>{{ lines, pairs, vents, intersectionPoints }}</ObjectInspector>
            <Canvas className="flex-grow" onDraw={draw} />
        </div>
    );
}
