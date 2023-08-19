"use client";

import { useContext, useEffect, useState } from "react";
import * as Zdog from "zdog";
import {
    flatten,
    min,
    max,
    every,
    inRange,
    sum,
    range,
    sumBy,
    flatMap,
    reduce,
    sortBy,
    takeRight,
} from "lodash";
import clsx from "clsx";

import { randomHSL } from "../../utils";
import { ObjectInspector } from "../../components/ObjectInspector";
import { Canvas } from "../../components/Canvas";
import { ChallengeContext } from "../ChallengeWrapper";

const heightScale = 5;

function getSlopeStyle(fromHeight, toHeight, margin, isVertical = false) {
    const isAscending = toHeight > fromHeight;

    const delta = (toHeight - fromHeight) * heightScale;
    const length = Math.sqrt(delta * delta + margin * margin);

    const angle = Math.asin(Math.abs(delta) / length) * (isAscending ? -1 : 1);

    const style = {
        [isVertical ? "height" : "width"]: `${length}px`,
    };

    // Position
    const pos = {
        [isVertical ? "y" : "x"]: 40 - (length - margin) / 2,
        [isVertical ? "x" : "y"]: 0,
        z: ((fromHeight + toHeight) / 2) * heightScale,
    };
    style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;

    // Rotate
    const rotationVector = isVertical ? "-1, 0, 0" : "0, 1, 0";
    style.transform += ` rotate3d(${rotationVector}, ${angle}rad)`;

    return style;
}

const dirs = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
];

function isLowPoint(map, i, j) {
    return every(
        dirs,
        ([di, dj]) =>
            !(inRange(i + di, map.length) && inRange(j + dj, map[0].length)) ||
            map[i + di][j + dj] > map[i][j]
    );
}

function Tile({ map, i, j }) {
    const height = map[i][j];
    const isLow = isLowPoint(map, i, j);

    const styleEast = j < map[i].length - 1 ? getSlopeStyle(map[i][j], map[i][j + 1], 16) : null;

    const styleSouth =
        i < map.length - 1 ? getSlopeStyle(map[i][j], map[i + 1][j], 16, true) : null;

    return (
        <>
            <div
                className={clsx(
                    "h-10 w-10 center absolute",
                    isLow ? "bg-amber-900" : "bg-amber-500"
                )}
                style={{
                    top: `calc(${i} * 3.5rem + 0.5rem)`,
                    left: `calc(${j} * 3.5rem + 0.5rem)`,
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${height * heightScale}px)`,
                }}
            >
                {height}
            </div>
            {styleEast && (
                <div
                    className="absolute h-10 bg-amber-700"
                    style={{
                        ...styleEast,
                        top: `calc(${i} * 3.5rem + 0.5rem)`,
                        left: `calc(${j} * 3.5rem + 0.5rem)`,
                        transformStyle: "preserve-3d",
                    }}
                ></div>
            )}
            {styleSouth && (
                <div
                    className="absolute w-10 bg-amber-600"
                    style={{
                        ...styleSouth,
                        top: `calc(${i} * 3.5rem + 0.5rem)`,
                        left: `calc(${j} * 3.5rem + 0.5rem)`,
                        transformStyle: "preserve-3d",
                    }}
                ></div>
            )}
        </>
    );
}

function Plane({ map }) {
    const [yRotation, setYRotation] = useState(0);
    useEffect(() => {
        let requestNext = true;
        const animate = () => {
            setYRotation((y) => y + 0.1);

            if (requestNext) {
                requestAnimationFrame(animate);
            }
        };

        animate();

        return () => {
            requestNext = false;
        };
    }, []);

    return (
        <div
            className="relative"
            style={{
                transformStyle: "preserve-3d",
                transform: `rotate3d(1, 0, 0, 45deg) rotate3d(0, 0, 1, ${yRotation}deg)`,
                // transform: "rotate3d(0, 0, 1, 45deg)",
            }}
        >
            <div className="flex flex-col">
                {map.map((row, i) => (
                    <div key={i} className="flex">
                        {row.map((height, j) => (
                            <div
                                key={j}
                                className="w-10 h-10 m-2 border-2 bg-slate-500 opacity-10"
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            {map.map((row, i) =>
                row.map((height, j) => <Tile key={`${i},${j}`} map={map} i={i} j={j} />)
            )}
        </div>
    );
}

export default function Day9() {
    const { lines, isExample } = useContext(ChallengeContext);
    const map = lines.map((s) => Array.from(s).map((s) => parseInt(s)));
    const [minHeight, maxHeight] = [min(flatten(map)), max(flatten(map))];

    const handleDraw = (ctx, { width, height }) => {
        let illo = new Zdog.Illustration({
            element: ".canvas-grid",
            dragRotate: true,
            translate: {},
            rotate: { x: Zdog.TAU / 8, y: Zdog.TAU / 2, z: Zdog.TAU / 4 },
            zoom: 0.25,
        });

        const anchor = new Zdog.Anchor({
            addTo: illo,
            translate: {},
        });

        const options = {
            addTo: anchor,
            width: 50,
            height: 50,
        };

        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                const depth = map[i][j] * 10;
                new Zdog.Box({
                    ...options,
                    color: `rgb(${(map[i][j] / maxHeight) * 255}, 0, 0)`,
                    depth: depth,
                    translate: {
                        x: i * 50,
                        y: j * 50,
                        z: -depth / 2,
                    },
                });
            }
        }

        function animate() {
            illo.updateRenderGraph();
            requestAnimationFrame(animate);
        }
        animate();
    };

    const [n, m] = [map.length, map[0].length];

    const lowPoints = flatMap(range(n), (i) => range(m).map((j) => [i, j])).filter(([i, j]) =>
        isLowPoint(map, i, j)
    );

    const ans = sumBy(lowPoints, ([i, j]) => 1 + map[i][j]);

    const basins = lowPoints.map(([li, lj]) => {
        const basin = new Set();
        const dfs = (i, j) => {
            basin.add(`${i},${j}`);
            dirs.forEach(([di, dj]) => {
                const [ii, jj] = [i + di, j + dj];
                if (!inRange(ii, n) || !inRange(jj, m) || basin.has(`${ii},${jj}`)) return;
                if (map[ii][jj] <= map[i][j] || map[ii][jj] === 9) return;
                dfs(ii, jj);
            });
        };
        dfs(li, lj);
        return Array.from(basin);
    });

    const ans2 = takeRight(sortBy(basins, "length"), 3)
        .map((b) => b.length)
        .reduce((a, b) => a * b);

    return (
        <div className="flex flex-col items-center">
            <ObjectInspector>{{ ans, ans2 }}</ObjectInspector>
            {isExample && <Plane map={map} />}
            {/* <Canvas className="w-full h-full" onDraw={handleDraw} /> */}
        </div>
    );
}
