"use client";

import { Canvas } from "app/components/Canvas";
import { ObjectInspector } from "app/components/ObjectInspector";
import { useFile } from "app/hooks/useFile";
import { normalizePoints } from "app/utils";
import { useCallback, useMemo } from "react";

const dirs = { forward: [1, 0], down: [0, 1], up: [0, -1] };

export default function Day2() {
    const { lines } = useFile("day2");

    // Part 1
    const points1 = useMemo(() => {
        if (!lines) return [];

        const ret = [];
        let [x, y] = [0, 0];
        lines.forEach((line) => {
            ret.push({ x, y });

            const [a, b] = line.split(" ");
            const [d, k] = [dirs[a], parseInt(b)];
            [x, y] = [x + d[0] * k, y + d[1] * k];
        });
        return ret;
    }, [lines]);

    // Part 2
    const points2 = useMemo(() => {
        if (!lines) return [];

        const ret = [];
        let [x, y] = [0, 0];
        let aim = 0;
        const points2 = [];
        lines.forEach((line) => {
            ret.push({ x, y });

            const [a, b] = line.split(" ");
            const [d, k] = [a, parseInt(b)];

            if (d === "down") aim += k;
            else if (d === "up") aim -= k;
            else [x, y] = [x + k, y + aim * k];
        });
        return ret;
    }, [lines]);

    const drawPart1 = useCallback(
        (ctx, { width, height }) => {
            const normalizedPoints = normalizePoints(points1, {
                minX: 50,
                maxX: width - 50,
                minY: 50,
                maxY: height - 50,
            });

            ctx.beginPath();
            normalizedPoints.forEach((p) => {
                ctx.lineTo(p.x, p.y);
            });
            ctx.strokeStyle = "green";
            ctx.stroke();
        },
        [points1]
    );

    const drawPart2 = useCallback(
        (ctx, { width, height }) => {
            const normalizedPoints = normalizePoints(points2, {
                minX: 50,
                maxX: width - 50,
                minY: 50,
                maxY: height - 50,
            });

            ctx.beginPath();
            normalizedPoints.forEach((p) => {
                ctx.lineTo(p.x, p.y);
            });
            ctx.strokeStyle = "green";
            ctx.stroke();
        },
        [points2]
    );

    return (
        <div className="flex flex-row h-full w-full">
            <Canvas className="flex-grow overflow-hidden" onDraw={drawPart1} />
            <Canvas className="flex-grow overflow-hidden" onDraw={drawPart2} />
        </div>
    );
}
