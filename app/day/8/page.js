"use client";

import clsx from "clsx";
import {
    difference,
    flatMap,
    flatten,
    includes,
    intersection,
    range,
    repeat,
    sortBy,
    sum,
    sumBy,
    uniq,
} from "lodash";
import { useContext } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";

const digitBySegments = {
    abcefg: 0,
    cf: 1,
    acdeg: 2,
    acdfg: 3,
    bcdf: 4,
    abdfg: 5,
    abdefg: 6,
    acf: 7,
    abcdefg: 8,
    abcdfg: 9,
};

function SegmentDisplay({ decoder, value }) {
    const [a, b, c, d, e, f, g] = decoder;

    return (
        <div className="flex flex-col items-center w-24 p-4 font-mono leading-4 border-2 rounded-lg border-slate-500 bg-slate-900 text-slate-800">
            <span className={clsx(value.includes(a) && "aoc-glow")}>{repeat(a, 4)}</span>
            <div className="flex self-stretch justify-between">
                <span className={clsx(value.includes(b) && "aoc-glow")}>
                    {b}
                    <br />
                    {b}
                </span>
                <span className={clsx(value.includes(c) && "aoc-glow")}>
                    {c}
                    <br />
                    {c}
                </span>
            </div>
            <span className={clsx(value.includes(d) && "aoc-glow")}>{repeat(d, 4)}</span>
            <div className="flex self-stretch justify-between">
                <span className={clsx(value.includes(e) && "aoc-glow")}>
                    {e}
                    <br />
                    {e}
                </span>
                <span className={clsx(value.includes(f) && "aoc-glow")}>
                    {f}
                    <br />
                    {f}
                </span>
            </div>
            <span className={clsx(value.includes(g) && "aoc-glow")}>{repeat(g, 4)}</span>
        </div>
    );
}

function toNumber(decoder, outputValues) {
    const outputDigits = outputValues.map((v) => {
        const formal = Array.from(v).map((c) => "abcdefg"[decoder.indexOf(c)]);
        return digitBySegments[sortBy(formal).join("")];
    });

    return outputDigits[0] * 1000 + outputDigits[1] * 100 + outputDigits[2] * 10 + outputDigits[3];
}

function Display({ inputValues, outputValues }) {
    const values = inputValues.concat(outputValues).map((s) => sortBy(s));
    const decoder = decode(values);

    const output = toNumber(decoder, outputValues);

    return (
        <div className="flex items-center justify-center gap-4">
            <div className="font-mono text-xl aoc-glow">{output}</div>
            {outputValues.map((val, i) => (
                <SegmentDisplay key={i} decoder={decoder} value={val} />
            ))}
            <div className="font-mono text-xl aoc-glow">{output}</div>
        </div>
    );
}

function decode(values) {
    const oneSegments = values.find((s) => s.length === 2);
    const fourSegments = values.find((s) => s.length === 4);
    const sevenSegments = values.find((s) => s.length === 3);
    const eightSegments = values.find((s) => s.length === 7);

    const zeroSixNineSegments = uniq(values.filter((s) => s.length === 6));
    const twoThreeFiveSegments = uniq(values.filter((s) => s.length === 5));

    const a = difference(sevenSegments, oneSegments);

    const adg = intersection(...twoThreeFiveSegments);
    const dg = difference(adg, a);

    const d = intersection(dg, fourSegments);
    const g = difference(dg, d);

    const zeroSegments = zeroSixNineSegments.find((s) => !s.includes(d[0]));
    const bf = difference(
        intersection(
            ...zeroSixNineSegments.filter((s) => s !== zeroSegments).map((s) => Array.from(s))
        ),
        adg
    );
    const cd = difference(fourSegments, bf);

    const c = intersection(cd, oneSegments);
    const f = difference(oneSegments, c);
    const b = difference(fourSegments, d, c, f);
    const e = difference(eightSegments, a, b, c, d, f, g);

    return flatten([a, b, c, d, e, f, g]).join("");
}

export default function Day8() {
    const { lines, isPartOne } = useContext(ChallengeContext);

    const displays = lines.map((s) => {
        const [inputValues, outputValues] = s.split(" | ");
        return [inputValues.split(" "), outputValues.split(" ")];
    });

    let ans;

    if (isPartOne) {
        ans = sumBy(
            flatMap(displays, (d) => d[1]),
            (value) => includes([2, 3, 4, 7], value.length)
        );
    } else {
        const outputNumbers = displays.map(([inputValues, outputValues]) => {
            const decoder = decode(inputValues.map((v) => sortBy(v)));
            return toNumber(decoder, outputValues);
        });

        ans = sum(outputNumbers);
    }

    return (
        <div>
            <ObjectInspector>{{ ans }}</ObjectInspector>
            <div className="flex flex-col gap-6">
                {lines.map((line, i) => {
                    const [inputValues, outputValues] = line.split(" | ");
                    return (
                        <Display
                            key={i}
                            inputValues={inputValues.split(" ")}
                            outputValues={outputValues.split(" ")}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export const config = {
    exampleOnly: false,
};
