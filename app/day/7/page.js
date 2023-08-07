"use client";

import { useContext, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { min, max, range, sum, mean, minBy, sumBy } from "lodash";
import clsx from "clsx";

function Range({ value, onChange, minValue, maxValue, className }) {
    const range = maxValue - minValue;
    const marginLeft = `calc((100% - 1.25rem) / ${range} * ${value - minValue})`;
    return (
        <>
            <input
                className={clsx(className, "crab-input")}
                type="range"
                value={value}
                min={minValue}
                max={maxValue}
                step={1}
                onChange={(e) => onChange(parseInt(e.target.value))}
            />
            <div
                className="absolute h-full w-4 border-l-2 border-dashed border-slate-500 translate-x-2.5"
                style={{ marginLeft }}
            ></div>
            <div className="absolute w-6 -bottom-8 center aoc-glow" style={{ marginLeft }}>
                {value}
            </div>
        </>
    );
}

function Crab({ position, selfPosition, minPosition, maxPosition }) {
    const range = maxPosition - minPosition;

    let deltaClass;
    if (position < selfPosition) deltaClass = "-left-8";
    else if (selfPosition < position) deltaClass = "-right-8";
    else deltaClass = "invisible";

    return (
        <div
            className="relative w-12 text-2xl rounded-full bg-slate-700 center border-slate-500"
            style={{
                marginLeft: `calc(0.625rem + (100% - 1.25rem) / ${range} * ${
                    selfPosition - minPosition
                })`,
                transform: "translateX(-50%)",
            }}
        >
            🦀
            <div
                className={clsx(
                    "absolute text-base w-7 bg-slate-700 rounded-full center",
                    deltaClass
                )}
            >
                {Math.abs(selfPosition - position)}
            </div>
        </div>
    );
}

function Crabs({ crabs }) {
    const [minPosition, maxPosition] = [min(crabs), max(crabs)];
    const [position, setPosition] = useState(minPosition);

    return (
        <div className="relative flex flex-col mx-10">
            <div className="z-20 flex flex-col gap-4">
                {crabs.map((x, i) => (
                    <Crab
                        key={i}
                        position={position}
                        selfPosition={x}
                        minPosition={minPosition}
                        maxPosition={maxPosition}
                    />
                ))}
            </div>
            <Range
                className="z-20 mt-5"
                value={position}
                onChange={(newValue) => setPosition(newValue)}
                minValue={minPosition}
                maxValue={maxPosition}
            />
        </div>
    );
}

export default function Day7() {
    const { lines, isExample, isPartOne } = useContext(ChallengeContext);
    const crabs = lines[0].split(",").map((s) => parseInt(s));

    const cost = (meet, x) => {
        const distance = Math.abs(meet - x);
        return isPartOne ? distance : (distance * (distance + 1)) / 2;
    };

    const [minCrab, maxCrab] = [min(crabs), max(crabs)];
    const ans = minBy(range(minCrab, maxCrab + 1), (meet) => sumBy(crabs, (x) => cost(meet, x)));
    const costSum = sumBy(crabs, (x) => cost(ans, x));

    return (
        <div>
            <ObjectInspector>{{ lines, crabs, ans, costSum }}</ObjectInspector>
            {isExample && <Crabs crabs={crabs} />}
        </div>
    );
}
