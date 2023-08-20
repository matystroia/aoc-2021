"use client";

import { cloneDeep, intersection, intersectionBy, isEqual, range, sortBy, uniq } from "lodash";
import { useContext, useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import { combinations, permutations, product, splitGroups } from "../../utils";
import { Box } from "../../components/shapes/Box";
import { ChallengeContext } from "../ChallengeWrapper";

import { ScannerDevice } from "./ScannerDevice";

class Beacon {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotateToMatch(axes) {
        const [x, y, z] = axes.map(([a, negative]) => (negative ? -this[a] : this[a]));
        return new Beacon(x, y, z);
    }

    translate(delta) {
        [this.x, this.y, this.z] = [this.x - delta[0], this.y - delta[1], this.z - delta[2]];
    }
}

class Scanner {
    constructor(i, beacons) {
        this.i = i;
        this.beacons = beacons;

        this.lines = combinations(this.beacons, 2).map(([b1, b2], i) => [b1, b2, distance(b1, b2)]);
    }

    isTranslation(otherBeacons, delta) {
        let matches = 0;
        for (const b1 of this.beacons) {
            const match = otherBeacons.find((b2) =>
                isEqual([b2.x, b2.y, b2.z], [b1.x + delta[0], b1.y + delta[1], b1.z + delta[2]])
            );
            if (match && ++matches >= 12) return true;
        }
        return false;
    }

    getIntersection(otherBeacons, delta) {
        const ret = [[], []];
        for (let i = 0; i < this.beacons.length; i++) {
            const b1 = this.beacons[i];
            const match = otherBeacons.findIndex((b2) =>
                isEqual([b2.x, b2.y, b2.z], [b1.x + delta[0], b1.y + delta[1], b1.z + delta[2]])
            );

            if (match !== -1) {
                ret[0].push(i);
                ret[1].push(match);
            }
        }

        return ret;
    }

    translate(delta) {
        for (const b of this.beacons) b.translate(delta);
    }
}

const distance = (a, b) => Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2);

const getAxes = (deltas1, deltas2) => {
    const ret = [];
    for (const d1 of deltas1) {
        const i = deltas2.findIndex((d2) => Math.abs(d1) === Math.abs(d2));
        if (i === -1) return null;
        const negative = d1 === -deltas2[i];
        ret.push(["xyz"[i], negative]);
    }
    return ret;
};

const isMatch = (s1, s2) => {
    for (const [b1, b2, length1] of s1.lines) {
        for (const [b3, b4, length2] of s2.lines) {
            if (length1 === length2) {
                const deltas1 = ["x", "y", "z"].map((a) => b2[a] - b1[a]);
                const deltas2 = ["x", "y", "z"].map((a) => b4[a] - b3[a]);

                const transform = getAxes(deltas1, deltas2);
                if (transform === null) continue;

                const rotatedBeacons = s2.beacons.map((s) => s.rotateToMatch(transform));
                const rotatedBeacon = b3.rotateToMatch(transform);

                const delta = ["x", "y", "z"].map((a) => rotatedBeacon[a] - b1[a]);

                if (s1.isTranslation(rotatedBeacons, delta)) {
                    // s2.transform = transform;
                    // for (let i = 0; i < s2.beacons.length; i++) {
                    //     s2.beacons[i].x = rotatedBeacons[i].x;
                    //     s2.beacons[i].y = rotatedBeacons[i].y;
                    //     s2.beacons[i].z = rotatedBeacons[i].z;
                    // }
                    // s2.translate(delta);
                    // return true;
                    return s1.getIntersection(rotatedBeacons, delta);
                }
            }
        }
    }
    return false;
};

function Axes() {
    return (
        <div className="relative z-50 preserve-3d">
            <div className="absolute w-32 h-1 bg-red-600 rounded-lg">
                <div className="absolute -right-4 -top-1.5 w-0 h-0 border-8 border-l-red-600 border-r-transparent border-y-transparent" />
            </div>
            <div className="absolute w-32 h-1 rounded-lg bg-green-600 [transform:rotateZ(90deg)translate(4rem,4rem)]">
                <div className="absolute -right-4 -top-1.5 w-0 h-0 border-8 border-l-green-600 border-r-transparent border-y-transparent" />
            </div>
            <div className="absolute w-32 h-1 rounded-lg bg-blue-600 [transform:rotateY(-90deg)translate3d(4rem,0,4rem)]">
                <div className="absolute -right-4 -top-1.5 w-0 h-0 border-8 border-l-blue-600 border-r-transparent border-y-transparent" />
            </div>
        </div>
    );
}

function Cube({ x, y, z }) {
    const [tick, setTick] = useState(0);
    // useEffect(() => {
    //     let ignore = false;
    //     const animate = () => {
    //         setTick((t) => t + 1);
    //         if (!ignore) requestAnimationFrame(animate);
    //     };
    //     animate();
    //     return () => {
    //         ignore = true;
    //     };
    // }, []);

    return (
        <div
            className="w-[50px] h-[50px] relative preserve-3d"
            style={{
                transform: `translate3d(${Math.sin(tick / 100) * (x - 25)}px, ${
                    Math.sin(tick / 100) * (y - 25)
                }px, ${0}px)`,
            }}
        >
            <div className="absolute w-[10px] h-[10px] left-[20px] top-[20px] bg-red-500 rounded-full"></div>
            <div className="absolute w-[10px] h-[10px] left-[20px] top-[20px] bg-red-500 rounded-full [transform:rotateY(90deg)]"></div>
            <div className="absolute w-[10px] h-[10px] left-[20px] top-[20px] bg-red-500 rounded-full [transform:rotateX(90deg)]"></div>
        </div>
    );
    // return (
    //     <Box
    //         height={50}
    //         sideClass="bg-red-500 group-hover:bg-amber-500"
    //         borderWidth={2}
    //         borderClass="bg-red-950 opacity-25 group-hover:bg-amber-950"
    //         className="select-none group"
    //     >
    //         <div className="w-[50px] h-[50px] bg-red-500 border-2 border-red-950 opacity-25 group-hover:bg-amber-500" />
    //         <div className="absolute w-full h-full bg-red-500 border-2 border-red-950 left-0 top-0 [transform:translateZ(-50px)] opacity-25 group-hover:bg-amber-500" />
    //     </Box>
    // );
}

function Dot({ x, y, z, className }) {
    return (
        <div
            className="absolute center preserve-3d"
            style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}
        >
            <div className={clsx("absolute w-1 h-1 rounded-full", className)}></div>
            <div
                className={clsx(
                    "absolute w-1 h-1 rounded-full [transform:rotateX(90deg)]",
                    className
                )}
            ></div>
            <div
                className={clsx(
                    "absolute w-1 h-1 rounded-full [transform:rotateY(90deg)]",
                    className
                )}
            ></div>
        </div>
    );
}

function ScannerCube({ scanner, width, animate = false, onClick, className }) {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!animate) return;
        // let ignore = false;
        // const animate = () => {
        //     setTick((t) => t + 1 / 144);
        //     if (!ignore) requestAnimationFrame(animate);
        // };
        // animate();
        // return () => {
        //     ignore = true;
        // };
        const interval = setInterval(() => setTick((t) => t + 1), 1000 / 144);
        return () => clearInterval(interval);
    });

    const sideStyle = { width, height: width };

    return (
        <div
            className={clsx("preserve-3d relative center", className)}
            style={{ width, height: width }}
            onClick={onClick}
        >
            <div
                className="relative w-full h-full preserve-3d"
                style={{
                    transform: `rotateX(75deg) rotateZ(${tick % 360}deg)`,
                }}
            >
                <div className="absolute border-2 border-amber-500" style={sideStyle}></div>
                <div
                    className="absolute border-2 border-amber-500"
                    style={{ ...sideStyle, transform: `translateZ(-${width}px)` }}
                ></div>
                <div
                    className="absolute border-2 border-amber-500"
                    style={{
                        ...sideStyle,
                        transform: `translate3d(0, ${width / 2}px, -${width / 2}px) rotateX(90deg)`,
                    }}
                ></div>
                <div
                    className="absolute border-2 border-amber-500"
                    style={{
                        ...sideStyle,
                        transform: `translate3d(0, -${width / 2}px, -${
                            width / 2
                        }px) rotateX(90deg)`,
                    }}
                ></div>
                <div
                    className="absolute border-2 border-amber-500"
                    style={{
                        ...sideStyle,
                        transform: `translate3d(${width / 2}px, 0, -${width / 2}px) rotateY(90deg)`,
                    }}
                ></div>
                <div
                    className="absolute border-2 border-amber-500"
                    style={{
                        ...sideStyle,
                        transform: `translate3d(-${width / 2}px, 0, -${
                            width / 2
                        }px) rotateY(90deg)`,
                    }}
                ></div>
                <div
                    className="preserve-3d"
                    style={{
                        transform: `translate3d(${width / 2}px, ${width / 2}px, -${width / 2}px)`,
                    }}
                >
                    <Dot x={0} y={0} z={0} className="bg-red-500" />
                    {scanner.beacons.map(({ x, y, z }, i) => (
                        <Dot
                            key={i}
                            x={((x / 1000) * width) / 2}
                            y={((y / 1000) * width) / 2}
                            z={((z / 1000) * width) / 2}
                            className="bg-emerald-400"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function dfs(scanners, visited, i) {
    visited.add(i);
    for (let j = 0; j < scanners.length; j++) {
        if (i === j || visited.has(j)) continue;

        if (isMatch(scanners[i], scanners[j])) {
            dfs(scanners, visited, j);
        }
    }
}

export default function Day19() {
    const { lines } = useContext(ChallengeContext);

    const initialScanners = useMemo(() => {
        const groups = splitGroups(lines).map((s) =>
            s.slice(1).map((x) => x.split(",").map((y) => parseInt(y)))
        );
        return groups.map(
            (s, i) =>
                new Scanner(
                    i,
                    s.map(([x, y, z]) => new Beacon(x, y, z))
                )
        );
    }, [lines]);

    const scanners = useMemo(() => cloneDeep(initialScanners), [initialScanners]);

    useMemo(() => {
        const visited = new Set();

        dfs(scanners, visited, 0);

        const beaconSet = new Set();
        for (const s of scanners)
            for (const b of s.beacons) {
                const key = `${b.x},${b.y},${b.z}`;
                beaconSet.add(key);
            }
    }, [scanners]);

    const [viewAngle, setViewAngle] = useState({ x: 0, y: 0 });

    // useEffect(() => {
    //     let requestNext = true;
    //     const animate = () => {
    //         setViewAngle(({ x, y }) => ({ x: x + 0.5, y: y + 0.5 }));
    //         if (requestNext) requestAnimationFrame(animate);
    //     };
    //     animate();
    //     return () => {
    //         requestNext = false;
    //     };
    // }, []);

    const handleMove = (e) => {
        if (isDown)
            setViewAngle({
                x: viewAngle.x + e.movementX * 0.5,
                y: viewAngle.y + e.movementY * 0.5,
            });
    };

    const [isDown, setIsDown] = useState(false);

    const [scannerIndex, setScannerIndex] = useState(0);

    const [resultIds, setResultIds] = useState([]);
    const optionScanners = initialScanners.filter((s, i) => !resultIds.includes(i));
    const resultScanners = resultIds.map((i) => initialScanners[i]);

    const [matchingIds, setMatchingIds] = useState([null, null]);
    const handleMatch = (scannerIndex) => {
        if (matchingIds.includes(scannerIndex)) {
            setMatchingIds(matchingIds.map((i) => (i === scannerIndex ? null : i)));
        } else if (matchingIds[0] === null) {
            setMatchingIds([scannerIndex, matchingIds[1]]);
        } else if (matchingIds[1] === null) {
            setMatchingIds([matchingIds[0], scannerIndex]);
        }
    };

    let matchingBeacons = [[], []];
    if (matchingIds[0] !== null && matchingIds[1] !== null) {
        const first = cloneDeep(scanners[matchingIds[0]]);
        const second = cloneDeep(scanners[matchingIds[1]]);

        const intersectionBeacons = isMatch(first, second);
        if (intersectionBeacons) {
            matchingBeacons = intersectionBeacons;
        }
    }

    return (
        <div
            className="h-full flex flex-col justify-center items-center preserve-3d [perspective:1000px]"
            onPointerMove={handleMove}
            onPointerDown={() => setIsDown(true)}
            onPointerUp={() => setIsDown(false)}
            onPointerLeave={() => setIsDown(false)}
        >
            <div className="flex mt-[512px] gap-4 preserve-3d">
                {optionScanners.map((scanner, i) => {
                    let highlightedBeacons = [];
                    if (scanner.i === matchingIds[0]) highlightedBeacons = matchingBeacons[0];
                    else if (scanner.i === matchingIds[1]) highlightedBeacons = matchingBeacons[1];
                    return (
                        <ScannerDevice
                            key={scanner.i}
                            beacons={scanner.beacons}
                            matchingBeacons={highlightedBeacons}
                            onMatch={() => handleMatch(i)}
                            isMatching={matchingIds.includes(i)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
