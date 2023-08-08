"use client";

import { useContext, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { minBy, range } from "lodash";
import {
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { PriorityQueue, divmod, product } from "app/utils";
import FlatQueue from "flatqueue";

class BigMatrix {
    constructor(height, width, n, m) {
        this.height = height;
        this.width = width;
        this.n = n;
        this.m = m;

        this.subHeight = this.height / this.n;
        this.subWidth = this.width / this.m;

        this.sub = range(n).map((_) =>
            range(m).map((_) => range(this.subHeight).map((_) => Array(this.subWidth)))
        );

        this.proxyHandler = {
            get(target, prop) {
                const [ri, rj] = prop.split(",").map((x) => parseInt(x));
                const [ii, i] = divmod(ri, target.subHeight);
                const [jj, j] = divmod(rj, target.subWidth);
                return target.sub[ii][jj][i][j];
            },
            set(target, prop, value) {
                const [ri, rj] = prop.split(",").map((x) => parseInt(x));
                const [ii, i] = divmod(ri, target.subHeight);
                const [jj, j] = divmod(rj, target.subWidth);
                target.sub[ii][jj][i][j] = value;
                return true;
            },
        };

        return new Proxy(this, this.proxyHandler);
    }
}

function neighbors(i, j, height, width) {
    const ret = [];
    [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
    ].forEach(([di, dj]) => {
        const [ni, nj] = [i + di, j + dj];
        if (ni >= 0 && ni < height && nj >= 0 && nj < width) ret.push([ni, nj]);
    });
    return ret;
}

function dijkstra(dist, risk, parent, height, width) {
    const visited = new Set();
    const pq = new FlatQueue();

    dist[[0, 0]] = 0;
    pq.push([0, 0], 0);

    while (pq.length) {
        const x = pq.pop();

        neighbors(...x, height, width).forEach((n) => {
            if (visited.has(`${n[0]},${n[1]}`)) return;
            const cost = dist[x] + risk[n];
            if (cost < dist[n]) {
                dist[n] = cost;
                parent[n] = x;
                pq.push(n, cost);
            }
        });
        visited.add(`${x[0]},${x[1]}`);
    }
}

function buildPath(parent, end) {
    const ret = new Set();
    while (parent[end] !== undefined) {
        ret.add(`${end[0]},${end[1]}`);
        end = parent[end];
    }
    return ret;
}

function Square({ value, className }) {
    return (
        <div className={clsx("w-10 h-10 center border-2 rounded-md font-mono", className)}>
            {value}
        </div>
    );
}

function NavButton({ position, onClick }) {
    const className = {
        left: "w-10 h-[30rem] rounded-l-full",
        right: "w-10 h-[30rem] rounded-r-full",
        up: "h-10 w-[30rem] rounded-t-full",
        down: "h-10 w-[30rem] rounded-b-full",
    }[position];

    const Icon = {
        left: ArrowLeftIcon,
        right: ArrowRightIcon,
        up: ArrowUpIcon,
        down: ArrowDownIcon,
    }[position];

    return (
        <div className="flex justify-center -z-10" style={{ perspective: "800px" }}>
            <button
                className={clsx(
                    "bg-teal-500 center [transform:translateZ(-100px)] transition-all disabled:opacity-0",
                    className
                )}
                onClick={onClick}
                disabled={!onClick}
            >
                <Icon className="w-6 h-6" />
            </button>
        </div>
    );
}

function Matrix({ height, width, render, className, style }) {
    return (
        <div
            className={clsx(
                "flex flex-col gap-2 items-center bg-stone-900 p-5 rounded-lg bg-opacity-75",
                className
            )}
            style={style}
        >
            {range(height).map((i) => (
                <div key={i} className="flex gap-2">
                    {range(width).map((j) => render(i, j))}
                </div>
            ))}
        </div>
    );
}

function MatrixNavigation({
    risk,
    distance,
    height,
    width,
    minPath,
    showValues,
    showSolution,
    isPartOne,
}) {
    const [metaX, setMetaX] = useState(0);
    const [metaY, setMetaY] = useState(0);

    return (
        <div
            className="flex flex-col justify-center"
            style={{ transform: "rotate3d(1, 0, 0, 30deg)" }}
        >
            <NavButton
                position="up"
                onClick={!isPartOne && metaY > 0 && (() => setMetaY(metaY - 1))}
            />
            <div className="relative flex items-center" style={{ perspective: "800px" }}>
                <NavButton
                    position="left"
                    onClick={!isPartOne && metaX > 0 && (() => setMetaX(metaX - 1))}
                />
                <Matrix
                    height={height}
                    width={width}
                    render={(i, j) => {
                        const r = risk[[metaY * height + i, metaX * width + j]];
                        return (
                            <Square
                                value={
                                    <span
                                        className={clsx(
                                            "transition-opacity",
                                            showValues ? "opacity-100" : "opacity-0"
                                        )}
                                    >
                                        {r}
                                    </span>
                                }
                                className={`bg-rose-${100 * r} border-rose-900`}
                            />
                        );
                    }}
                />
                <Matrix
                    height={height}
                    width={width}
                    render={(i, j) => {
                        const [ri, rj] = [metaY * height + i, metaX * width + j];
                        const d = distance[[ri, rj]];
                        return (
                            <Square
                                value={
                                    <span
                                        className={clsx(
                                            "transition-opacity",
                                            showValues ? "opacity-100" : "opacity-0"
                                        )}
                                    >
                                        {d}
                                    </span>
                                }
                                className={
                                    minPath.has(`${ri},${rj}`)
                                        ? "bg-emerald-500 border-emerald-700"
                                        : "bg-stone-500 border-stone-700"
                                }
                            />
                        );
                    }}
                    className={clsx(
                        "absolute left-10 transition-all z-50",
                        !showSolution && "opacity-0"
                    )}
                    style={{
                        transform: showSolution && "translateZ(50px)",
                    }}
                />
                <NavButton
                    position="right"
                    onClick={!isPartOne && metaX < 4 && (() => setMetaX(metaX + 1))}
                />
            </div>
            <NavButton
                position="down"
                onClick={!isPartOne && metaY < 4 && (() => setMetaY(metaY + 1))}
            />
            {/* Otherwise classes don't get loaded */}
            <span className="bg-rose-100 bg-rose-200 bg-rose-300 bg-rose-400 bg-rose-500 bg-rose-600 bg-rose-700 bg-rose-800 bg-rose-900" />
        </div>
    );
}

export default function Day15() {
    const { lines, isExample, isPartOne } = useContext(ChallengeContext);
    const risk = lines.map((s) => Array.from(s).map((x) => parseInt(x)));

    let height = risk.length;
    let width = risk[0].length;

    let bigDist, bigRisk, bigParent;
    if (isPartOne) {
        bigDist = new BigMatrix(height, width, 1, 1);
        bigRisk = new BigMatrix(height, width, 1, 1);
        bigParent = new BigMatrix(height, width, 1, 1);

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                bigDist[[i, j]] = Infinity;
                bigRisk[[i, j]] = risk[i][j];
            }
        }
    } else {
        bigDist = new BigMatrix(height * 5, width * 5, 5, 5);
        bigRisk = new BigMatrix(height * 5, width * 5, 5, 5);
        bigParent = new BigMatrix(height * 5, width * 5, 5, 5);

        for (let i = 0; i < height * 5; i++) {
            for (let j = 0; j < width * 5; j++) {
                const [ii, ri] = divmod(i, height);
                const [jj, rj] = divmod(j, width);
                const x = risk[ri][rj] + ii + jj;
                bigDist[[i, j]] = Infinity;
                bigRisk[[i, j]] = x > 9 ? (x % 10) + 1 : x;
            }
        }

        [height, width] = [height * 5, width * 5];
    }

    dijkstra(bigDist, bigRisk, bigParent, height, width);

    const minPath = buildPath(bigParent, [height - 1, width - 1]);

    const [showSolution, setShowSolution] = useState(false);
    const [showValues, setShowValues] = useState(false);

    const ans = bigDist[[height - 1, width - 1]];

    if (!isExample) return <ObjectInspector>{{ minTotalRisk: ans }}</ObjectInspector>;

    return (
        <div className="h-full center" style={{ perspective: "800px" }}>
            <MatrixNavigation
                key={isPartOne}
                risk={bigRisk}
                distance={bigDist}
                height={isPartOne ? height : height / 5}
                width={isPartOne ? width : width / 5}
                minPath={minPath}
                showValues={showValues}
                showSolution={showSolution}
                isPartOne={isPartOne}
            />
            <div className="absolute flex gap-4 p-4 bottom-1 right-1 bg-zinc-600 rounded-xl">
                <button
                    className="w-10 h-10 rounded-md bg-emerald-500 center"
                    onClick={() => setShowSolution(!showSolution)}
                >
                    {showSolution ? (
                        <ArrowDownIcon className="w-6 h-6" />
                    ) : (
                        <ArrowUpIcon className="w-6 h-6" />
                    )}
                </button>
                <button
                    className="w-10 h-10 rounded-md bg-emerald-500 center"
                    onClick={() => setShowValues(!showValues)}
                >
                    {showValues ? (
                        <EyeSlashIcon className="w-6 h-6" />
                    ) : (
                        <EyeIcon className="w-6 h-6" />
                    )}
                </button>
            </div>
        </div>
    );
}
