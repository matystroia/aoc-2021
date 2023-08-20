"use client";
import { motion, useMotionValue } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { isEqual, sumBy } from "lodash";
import clsx from "clsx";

import { Cube } from "../../components/shapes/Cube";
import { ChallengeContext } from "../ChallengeWrapper";
import { product } from "../../utils";
import { Box } from "../../components/shapes/Box";

const intersect = ([a, b], [c, d]) => {
    if (a > d || c > b) return null;
    return [Math.max(a, c), Math.min(b, d)];
};

class Cuboid {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    intersect(other) {
        if (
            !intersect(this.x, other.x) ||
            !intersect(this.y, other.y) ||
            !intersect(this.z, other.z)
        )
            return null;

        return new Cuboid(
            intersect(this.x, other.x),
            intersect(this.y, other.y),
            intersect(this.z, other.z)
        );
    }

    subtract(other) {
        if (!this.intersect(other)) return [this];

        return product(
            [
                [-Infinity, other.x[0] - 1],
                [other.x[0], other.x[1]],
                [other.x[1] + 1, Infinity],
            ],
            [
                [-Infinity, other.y[0] - 1],
                [other.y[0], other.y[1]],
                [other.y[1] + 1, Infinity],
            ],
            [
                [-Infinity, other.z[0] - 1],
                [other.z[0], other.z[1]],
                [other.z[1] + 1, Infinity],
            ]
        )
            .map(([ix, iy, iz]) => {
                if (
                    isEqual(ix, [other.x[0], other.x[1]]) &&
                    isEqual(iy, [other.y[0], other.y[1]]) &&
                    isEqual(iz, [other.z[0], other.z[1]])
                )
                    return null;

                return new Cuboid(ix, iy, iz).intersect(this);
            })
            .filter((c) => c && c.size());
    }

    size() {
        return (
            (this.x[1] - this.x[0] + 1) * (this.y[1] - this.y[0] + 1) * (this.z[1] - this.z[0] + 1)
        );
    }
}

function Button({ isLeft, onClick, disabled, children }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "relative block w-10 h-10 font-mono border disabled:opacity-50 disabled:before:hidden text-amber-700 bg-amber-500 border-amber-700 before:absolute before:bg-amber-700 before:h-full before:w-full before:-z-10 before:top-1",
                isLeft ? "before:-left-1" : "before:left-1"
            )}
        >
            {children}
        </button>
    );
}

function VizCube({ x, y, z }) {
    const [xWidth, yWidth, zWidth] = [x[1] - x[0] + 1, y[1] - y[0] + 1, z[1] - z[0] + 1];

    return (
        <div
            className="absolute preserve-3d"
            style={{
                transform: `translate3d(${x[0]}px, ${y[0]}px, ${z[0]}px)`,
            }}
        >
            <Box depth={zWidth} sideClass="bg-pink-300 opacity-50 border border-pink-950">
                <div
                    className="bg-pink-300 border opacity-50 border-pink-950"
                    style={{
                        width: xWidth,
                        height: yWidth,
                    }}
                />
            </Box>
            <div className="absolute inset-0 bg-pink-300 border opacity-50 border-pink-950"></div>
        </div>
    );
}

function runSteps(steps) {
    let cubes = [];
    for (const step of steps) {
        const cube = new Cuboid(step.x, step.y, step.z);
        cubes = cubes.flatMap((c) => c.subtract(cube));
        if (step.on) cubes.push(cube);
    }

    return cubes;
}

export default function Day22() {
    const { lines } = useContext(ChallengeContext);
    const steps = lines.map((s) => {
        const [on, coords] = s.split(" ");
        const [x, y, z] = coords.split(",").map((s) =>
            s
                .split("=")[1]
                .split("..")
                .map((s) => parseInt(s))
        );
        return { on: on === "on", x, y, z };
    });

    const [stepIndex, setStepIndex] = useState(0);
    const cubes = runSteps(steps.slice(0, stepIndex));

    const [zoomLevel, setZoomLevel] = useState(2.5);
    const zoom = (x) => [x[0] * zoomLevel, x[1] * zoomLevel];
    const zoomedCubes = cubes.map((c) => new Cuboid(zoom(c.x), zoom(c.y), zoom(c.z)));

    const panX = useMotionValue(0);
    const panY = useMotionValue(0);
    const handlePan = (e, info) => {
        panX.set(panX.get() + info.delta.x);
        panY.set(panY.get() + info.delta.y);
    };

    return (
        <motion.div className="relative h-full center [perspective:800px]" onPan={handlePan}>
            <motion.div className="relative preserve-3d" style={{ rotateX: panY, rotateZ: panX }}>
                {zoomedCubes.map((cube, i) => (
                    <VizCube key={i} x={cube.x} y={cube.y} z={cube.z} />
                ))}
            </motion.div>
            <div className="absolute bottom-0 flex items-end -mb-4">
                <div className="w-20 h-12 rounded-tl-lg center bg-amber-300 text-amber-700">
                    {stepIndex} / {steps.length}
                </div>
                <div className="z-10 flex gap-8 p-6 rounded-t-lg bg-amber-200 drop-shadow-lg">
                    <div className="flex gap-2 bottom-4 left-4">
                        <Button
                            isLeft
                            disabled={stepIndex === 0}
                            onClick={() => setStepIndex(stepIndex - 1)}
                        >
                            {"<"}
                        </Button>
                        <Button
                            isLeft
                            disabled={stepIndex === steps.length - 1}
                            onClick={() => setStepIndex(stepIndex + 1)}
                        >
                            {">"}
                        </Button>
                    </div>
                    <div className="flex gap-2 bottom-4 right-4">
                        <Button onClick={() => setZoomLevel(zoomLevel - 0.1)}>{"-"}</Button>
                        <Button onClick={() => setZoomLevel(zoomLevel + 0.1)}>{"+"}</Button>
                    </div>
                </div>
                <div className="w-20 h-12 rounded-tr-lg center bg-amber-300 text-amber-700">
                    {zoomLevel.toFixed(1)}
                </div>
            </div>
        </motion.div>
    );
}
