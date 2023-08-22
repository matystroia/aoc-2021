"use client";
import { motion, useAnimation } from "framer-motion";
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";

import {
    RegularPolygon,
    getPolygonPoints as getRegularPolygonPoints,
} from "../../components/shapes/RegularPolygon";
import { ExtrudedPolygonPath, getPolygonPoints } from "../../components/shapes/ExtrudedPolygonPath";
import { distance } from "../../utils";

function Block({ path, className, topClass, sideClass, initial, target, angle }) {
    const controls = useAnimation();

    const ref = useRef(false);
    const handleTap = async () => {
        if (ref.current) {
            await controls.start({ z: angle < 90 ? -100 : 100 });
            await controls.start({ x: initial.x, y: initial.y }, { type: "tween" });
            await controls.start({ z: 0 });
            ref.current = false;
        } else {
            await controls.start({ z: angle < 90 ? -100 : 100 });
            await controls.start({ x: target.x, y: target.y }, { type: "tween" });
            await controls.start({ z: 0 }, { delay: 0.25 });
            ref.current = true;
        }
    };

    return (
        <motion.div
            initial={{ ...initial }}
            animate={controls}
            onTap={handleTap}
            className={clsx("preserve-3d absolute cursor-pointer", className)}
        >
            <motion.div className="preserve-3d" whileHover={{ z: angle < 90 ? -10 : 10 }}>
                <ExtrudedPolygonPath
                    path={path}
                    width={100}
                    height={100}
                    depth={50}
                    topClass={topClass}
                    sideClass={sideClass}
                    topBorder={{ width: 2, borderClass: sideClass }}
                    sideBorder={{ width: 2, borderClass: topClass }}
                    angle={angle}
                />
            </motion.div>
        </motion.div>
    );
}

const width = 400;
const blockWidth = 100;

const getHolePath = (n, alpha, xOffset, yOffset) => {
    return getSVGPath(getRegularPolygonPoints(n, blockWidth, blockWidth, alpha), xOffset, yOffset);
};

const getSVGPath = (points, xOffset, yOffset) => {
    let ret = `M ${points[0].x + xOffset} ${points[0].y + yOffset} `;
    for (const { x, y } of points.slice(1)) ret += `L ${x + xOffset} ${y + yOffset}`;
    ret += " z";
    return ret;
};

function Base({ className, shapes }) {
    const basePoints = [
        { x: 0, y: 0 },
        { x: "100%", y: 0 },
        { x: "100%", y: "100%" },
        { x: 0, y: "100%" },
    ];
    const basePath = getSVGPath(getPolygonPoints(basePoints, width, width), 0, 0);

    const paths = shapes.map(({ x, y, path }) => getSVGPath(path, x, y));
    const finalPath = basePath + paths.join(" ");

    return (
        <ExtrudedPolygonPath
            className={className}
            path={basePoints}
            width={width}
            height={width}
            depth={50}
            sideClass="bg-amber-400"
        >
            <div
                className="absolute w-full h-full border-4 bg-amber-300 border-amber-400"
                style={{ clipPath: `path(evenodd, '${finalPath}')` }}
            />
            {shapes.map(({ x, y, path, angle }, i) => (
                <div
                    key={i}
                    className="absolute preserve-3d"
                    style={{ transform: `translate3d(${x}px, ${y}px, -50px)` }}
                >
                    <ExtrudedPolygonPath
                        key={i}
                        path={path}
                        height={100}
                        width={100}
                        depth={50}
                        sideClass="bg-amber-400"
                        sideBorder={{ width: 1, borderClass: "bg-amber-500" }}
                        angle={angle}
                    />
                </div>
            ))}
        </ExtrudedPolygonPath>
    );
}

const halfCirclePath = [
    { x: 0, y: "50%" },
    { interpolate: 2 },
    { x: "50%", y: 0 },
    { interpolate: 2 },
    { x: "100%", y: "50%" },
];

const starPath = [
    { x: "50%", y: 0 },
    { x: "70%", y: "27%" },
    { x: "100%", y: "39%" },
    { x: "81%", y: "66%" },
    { x: "84%", y: "100%" },
    { x: "50%", y: "90%" },
    { x: "16%", y: "100%" },
    { x: "19%", y: "66%" },
    { x: 0, y: "39%" },
    { x: "30%", y: "27%" },
];

const hourglassPath = [
    { x: 0, y: 0 },
    { x: "100%", y: 0 },
    { x: "70%", y: "50%" },
    { x: "100%", y: "100%" },
    { x: 0, y: "100%" },
    { x: "30%", y: "50%" },
];

const hatPath = [
    { x: 0, y: "50%" },
    { x: "100%", y: 0 },
    { x: "70%", y: "50%" },
    { x: "100%", y: "100%" },
];

export default function Toy() {
    const ref = useRef();
    const [baseOffset, setBaseOffset] = useState({ x: 0, y: 0 });
    useLayoutEffect(() => {
        if (!ref.current) return;
        const box = ref.current.getBoundingClientRect();
        setBaseOffset({ x: box.x, y: box.y });
    }, []);

    const shapes = [
        {
            x: 25,
            y: 50,
            path: getRegularPolygonPoints(3, 100, 100, Math.PI / 4),
            top: "bg-red-500",
            side: "bg-red-600",
            initial: { x: 450, y: 0 },
        },
        {
            x: 150,
            y: 50,
            path: getRegularPolygonPoints(4, 100, 100, Math.PI / 1),
            top: "bg-blue-500",
            side: "bg-blue-600",
            initial: { x: -150, y: 0 },
        },
        {
            x: 275,
            y: 75,
            path: getPolygonPoints(halfCirclePath, 100, 100),
            top: "bg-green-500",
            side: "bg-green-600",
            initial: { x: 450, y: 150 },
        },
        {
            x: 225,
            y: 160,
            path: getRegularPolygonPoints(6, 100, 100),
            top: "bg-pink-500",
            side: "bg-pink-600",
            initial: { x: -150, y: 150 },
            angle: 75,
        },
        {
            x: 75,
            y: 150,
            path: getPolygonPoints(starPath, 100, 100),
            top: "bg-orange-500",
            side: "bg-orange-600",
            initial: { x: 450, y: 250 },
        },
        {
            x: 25,
            y: 275,
            path: getRegularPolygonPoints(12, 100, 100),
            top: "bg-teal-500",
            side: "bg-teal-600",
            initial: { x: -150, y: 300 },
            angle: 110,
        },
        {
            x: 150,
            y: 275,
            path: getPolygonPoints(hourglassPath, 100, 75),
            top: "bg-emerald-500",
            side: "bg-emerald-600",
            initial: { x: -275, y: 100 },
        },
        {
            x: 275,
            y: 275,
            path: getPolygonPoints(hatPath, 100, 100),
            top: "bg-rose-500",
            side: "bg-rose-600",
            initial: { x: 570, y: 190 },
            angle: 110,
        },
    ];

    return (
        <div className="relative w-full h-full center perspective-[800px]">
            <div className="preserve-3d rotate-x-45">
                {shapes.map((shape, i) => (
                    <Block
                        key={i}
                        initial={shape.initial}
                        topClass={shape.top}
                        sideClass={shape.side}
                        target={{ x: shape.x, y: shape.y }}
                        path={shape.path}
                        angle={shape.angle || 90}
                    />
                ))}
                <Base
                    initial={{ x: 200, y: 200 }}
                    className="absolute pointer-events-none"
                    shapes={shapes}
                />
            </div>
        </div>
    );
}
