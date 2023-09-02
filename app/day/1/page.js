"use client";
import { motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useContext, useState, useRef } from "react";
import {
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { maxBy } from "lodash";

import { useCanvas } from "../../hooks/useCanvas";
import { ObjectInspector } from "../../components/ObjectInspector";
import { Canvas, CanvasContext } from "../../components/Canvas";
import { ChallengeContext } from "../ChallengeWrapper";

import { SeaFloor } from "./SeaFloor";
import { SeaFloorRamp } from "./SeaFloorRamp";

function part1(values) {
    let ans = 0;
    for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i - 1]) ans += 1;
    }

    return ans;
}

function part2(values) {
    let ans = 0;
    for (let i = 3; i < values.length; i++) {
        if (
            values[i - 3] + values[i - 2] + values[i - 1] <
            values[i - 2] + values[i - 1] + values[i]
        )
            ans += 1;
    }

    return ans;
}

const N_BUFFER = 12;
const WIDTH = 50 * 2;
const START_OFFSET = (-N_BUFFER * WIDTH) / 2;
export default function Day1() {
    const { lines } = useContext(ChallengeContext);
    let values = lines.map((s) => parseInt(s));

    const maxDepth = maxBy(values) + 50;
    values = values.map((depth) => ({ depth, height: maxDepth - depth }));

    const x = useMotionValue(0);
    const y = useMotionValue(values[0].height - 200);
    const velocity = useMotionValue(1);

    const [offsetIndex, setOffsetIndex] = useState(0);
    useMotionValueEvent(x, "change", (latest) => {
        setOffsetIndex(Math.floor(Math.abs(latest / WIDTH)));
    });

    const slice = values.slice(offsetIndex, offsetIndex + N_BUFFER);

    const intervalRef = useRef(null);
    const handleUp = () => {
        intervalRef.current = setInterval(() => {
            y.set(y.get() + velocity.get());
            velocity.set(Math.max(3, velocity.get() + 0.1));
        }, 10);
    };
    const handleDown = () => {
        intervalRef.current = setInterval(() => {
            y.set(y.get() - velocity.get());
            velocity.set(Math.max(3, velocity.get() + 0.1));
        }, 10);
    };
    const handleLeft = () => {
        intervalRef.current = setInterval(() => {
            x.set(x.get() + velocity.get());
            velocity.set(Math.max(3, velocity.get() + 0.1));
        }, 10);
    };
    const handleRight = () => {
        intervalRef.current = setInterval(() => {
            x.set(x.get() - velocity.get());
            velocity.set(Math.max(3, velocity.get() + 0.1));
        }, 10);
    };
    const handleCenter = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        velocity.set(1);
    };

    return (
        <div className="absolute inset-0 [perspective:1000px] bg-stone-950 overflow-hidden">
            <motion.div
                className="absolute bottom-0 w-full preserve-3d"
                initial={false}
                style={{ x, y }}
                transition={{ type: "tween", ease: "linear" }}
            >
                <motion.div className="relative flex justify-center w-full preserve-3d">
                    {slice.map(({ depth, height }, i) => (
                        <SeaFloor
                            className="absolute bottom-0"
                            key={offsetIndex + i}
                            depth={depth}
                            height={height}
                            prevHeight={i > 0 && slice[i - 1].height}
                            style={{ x: START_OFFSET + (offsetIndex + i) * WIDTH, rotateX: 90 }}
                            width={WIDTH / 2}
                        />
                    ))}
                </motion.div>
            </motion.div>

            <div
                className="absolute inset-x-0 top-0 transition-colors h-14 hover:bg-stone-800 center"
                onMouseEnter={handleUp}
                onMouseLeave={handleCenter}
            >
                <ChevronUpIcon className="w-12 h-12" />
            </div>
            <div
                className="absolute inset-x-0 bottom-0 transition-colors h-14 hover:bg-stone-800 center"
                onMouseEnter={handleDown}
                onMouseLeave={handleCenter}
            >
                <ChevronDownIcon className="w-12 h-12" />
            </div>
            <div
                className="absolute inset-y-0 left-0 transition-colors w-14 hover:bg-stone-800 center"
                onMouseEnter={handleLeft}
                onMouseLeave={handleCenter}
            >
                <ChevronLeftIcon className="w-12 h-12" />
            </div>
            <div
                className="absolute inset-y-0 right-0 transition-colors w-14 hover:bg-stone-800 center"
                onMouseEnter={handleRight}
                onMouseLeave={handleCenter}
            >
                <ChevronRightIcon className="w-12 h-12" />
            </div>
        </div>
    );
}
