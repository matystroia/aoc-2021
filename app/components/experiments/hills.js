"use client";

import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { motion, motionValue, useMotionValueEvent, useTime, useTransform } from "framer-motion";
import { ObjectInspector } from "../../components/ObjectInspector";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useSize } from "../../hooks/useSize";
import { maxBy, random } from "lodash";
import { useImmer } from "use-immer";
import clsx from "clsx";

function SettingsGroup({ className, children }) {
    return (
        <div className={clsx("p-2 border rounded border-zinc-900/50", className)}>{children}</div>
    );
}

const Settings = forwardRef(function Settings({ settings, onUpdate }, ref) {
    const { perspective, speed, layers } = settings;

    return (
        <dialog
            ref={ref}
            className="w-1/2 border h-1/2 bg-zinc-300/50 backdrop-blur border-zinc-200 drop-shadow-xl"
        >
            <div className="flex flex-col gap-2 px-16 font-mono text-zinc-700">
                <SettingsGroup className="flex items-center">
                    <span className="font-bold">perspective</span>

                    <input
                        type="range"
                        className="w-32 ml-auto"
                        value={perspective}
                        min={500}
                        max={5000}
                        onChange={(e) =>
                            onUpdate((draft) => {
                                draft.perspective = Number(e.target.value);
                            })
                        }
                    />
                </SettingsGroup>

                <SettingsGroup className="flex items-center">
                    <span className="font-bold">speed</span>

                    <input
                        type="range"
                        className="w-32 ml-auto"
                        value={speed}
                        min={-1000}
                        max={1000}
                        step={100}
                        onChange={(e) =>
                            onUpdate((draft) => {
                                draft.speed = Number(e.target.value);
                            })
                        }
                    />
                </SettingsGroup>
                <SettingsGroup>
                    <details className="">
                        <summary className="font-bold">layers</summary>
                        {layers.map((layer, i) => (
                            <details key={i} className="ml-4">
                                <summary>{i}</summary>
                            </details>
                        ))}
                    </details>
                </SettingsGroup>
            </div>
        </dialog>
    );
});

const colors = ["#1d1e36", "#22274c", "#1e356d", "#2652a1", "#2e60b6", "#376db8"];

function generateHill(baseHeight, heightDelta, pointCount) {
    const xDelta = 1 / (pointCount - 1);
    return [...Array(pointCount).keys()].map((i) => {
        return { x: xDelta * i, y: baseHeight + random(-heightDelta, heightDelta) };
    });
}

function midpointDisplacement(baseHeight, heightDelta) {
    let ret = [
        { x: 0, y: baseHeight },
        { x: 1, y: baseHeight },
    ];

    for (let k = 0; k < 3; k++) {
        const newRet = [];
        for (let i = 0; i < ret.length; i++) {
            newRet.push(ret[i]);
            if (i < ret.length - 1) {
                const delta = heightDelta / (2 * (k + 1));
                const midpoint = {
                    x: (ret[i].x + ret[i + 1].x) / 2,
                    y: (ret[i].y + ret[i + 1].y) / 2 + random(-delta, delta),
                };
                newRet.push(midpoint);
            }
        }
        ret = newRet;
    }

    return ret;
}

export function Hill({ width, height, color, points, style, xMotionValue }) {
    const maxY = maxBy(points, "y").y;
    height = maxY;

    points = points.map(({ x, y }) => ({ x: width * x, y: height - y }));

    const pointsPath = points.map(({ x, y }) => `${x},${y}`).join(" ");

    // let cubicPath = `M 0,${height}`;
    // for (let i = 1; i < points.length - 2; i++) {
    //     const c1 = points.at(i - 1);
    //     const to = points.at(i + 1);
    //     const c2 = points.at(i + 2);

    //     cubicPath += ` C ${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
    // }
    // cubicPath += `V ${height}`;

    let path = [];
    // for (let i = 0; i < points.length - 2; i += 2) {
    //     const control = points[i + 1];
    //     const next = points[i + 2];
    //     path.push(`${control.x},${control.y} ${next.x},${next.y}`);
    // }

    // let path = points
    //     .map(({ x, y }, i) => {
    //         const before = points.at(i - 1);
    //         const after = points[i];
    //         const control = { x: (before.x + after.x) / 2, y: (before.y + after.y) / 2 };

    //         return `Q ${control.x},${control.y} ${x},${y}`;
    //     })
    //     .join(" ");

    // path = `H ${width}`;
    // path = `M 0,${height} ` + path + ` V ${height} H ${-width}`;

    path = `M 0,${height} L ${pointsPath} H ${width} V ${height}`;

    const offset = useTransform(xMotionValue, (value) => Math.floor(value / width) * -width);

    // useMotionValueEvent(offset, "change", (latest) => {
    //     console.log({ latest });
    // });

    return (
        <motion.div drag="x" className="absolute bottom-0 flex preserve-3d" style={{ x: offset }}>
            <svg className="" width={width} height={height} style={style}>
                <path d={path} fill={color} />
            </svg>
            <svg className="" width={width} height={height} style={style}>
                <path d={path} fill={color} />
            </svg>
            <svg className="" width={width} height={height} style={style}>
                <path d={path} fill={color} />
            </svg>
            {/* <svg className="absolute bottom-0" width={width} height={height} style={style}>
                // <path d={pointsPath} fill="transparent" stroke="red" />
            </svg> */}
        </motion.div>
    );
}

export function Hills() {
    const points = colors.map((_, i) =>
        // generateHill(Math.pow(1.8, i) * 100, 10 * Math.pow(1.7, i), 30)
        midpointDisplacement(Math.pow(1.8, i) * 100, Math.pow(2, i) * 50)
    );

    const [settings, updateSettings] = useImmer({
        perspective: 1000,
        speed: 0,
        layers: colors.map((c, i) => ({
            depth: 1000 * i,
            color: c,
            points: points[i],
        })),
    });

    const wrapperRef = useRef();
    const { width, height } = useSize(wrapperRef);

    const time = useTime();
    const x = useTransform(time, [0, 1000], [0, settings.speed], { clamp: false });

    const settingsRef = useRef();

    return (
        <div
            ref={wrapperRef}
            className="w-full h-full bg-[#e2eaf3] -z-50 [perspectiveOrigin:bottom]"
            style={{ perspective: `${settings.perspective}px` }}
        >
            <motion.div
                style={{ x }}
                className="relative flex justify-center w-full h-full preserve-3d"
            >
                {settings.layers.map(({ color, depth, points }, i) => (
                    <Hill
                        key={i}
                        height={height}
                        width={((depth + settings.perspective) * width) / settings.perspective}
                        color={color}
                        style={{
                            zIndex: -i,
                            transform: `translateZ(${-depth}px)`,
                        }}
                        points={points}
                        xMotionValue={x}
                    />
                ))}
            </motion.div>

            <button
                onClick={() => settingsRef.current.showModal()}
                className="absolute block transition-transform cursor-pointer top-4 right-4 hover:rotate-45 group"
            >
                <Cog6ToothIcon className="w-10 h-10 fill-zinc-400 group-hover:fill-zinc-600" />
            </button>

            <Settings ref={settingsRef} settings={settings} onUpdate={updateSettings} />
        </div>
    );
}
