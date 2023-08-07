"use client";

import { useContext, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { divmod, mapDiff, mapSum, splitGroups } from "app/utils";
import { ObjectInspector } from "app/components/ObjectInspector";
import clsx from "clsx";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { clone, compact, countBy, entries, flatten, maxBy, minBy, zip } from "lodash";

function nextPolymer(polymer, rules) {
    let ret = "";
    for (let i = 0; i < polymer.length; i++) {
        const result = rules.get(polymer[i] + polymer[i + 1]);
        ret += polymer[i] + (result ?? "");
    }

    return ret;
}

const memo = new Map();
function pairCounts(left, right, steps, rules) {
    const key = `${left},${right},${steps}`;
    if (memo.has(key)) return memo.get(key);

    const result = rules.get(left + right);
    let counts = new Map();
    if (steps === 1) {
        counts = mapSum(counts, new Map([[left, 1]]));
        counts = mapSum(counts, new Map([[right, 1]]));
        counts = mapSum(counts, new Map([[result, 1]]));
    } else {
        counts = mapSum(counts, pairCounts(left, result, steps - 1, rules));
        counts = mapSum(counts, pairCounts(result, right, steps - 1, rules));
        counts = mapDiff(counts, new Map([[result, 1]]));
    }

    memo.set(key, counts);
    return counts;
}

function polymerCounts(polymer, steps, rules) {
    let ret = new Map();
    for (let i = 0; i < polymer.length - 1; i++) {
        ret = mapSum(ret, pairCounts(polymer[i], polymer[i + 1], steps, rules));
        if (i < polymer.length - 2) {
            ret = mapDiff(ret, new Map([[polymer[i + 1], 1]]));
        }
    }
    return ret;
}

function pairCounts2(left, right, rules, steps, reverse = false) {
    const indexMap = new Map();
    const results = [];
    const counts = [new Map()];

    let other = reverse ? left : right;
    let i = 0;
    while (!indexMap.has(other)) {
        results.push(other);
        indexMap.set(other, i++);

        const key = reverse ? other + right : left + other;
        const result = rules.get(key);
        other = result;

        const newCounts = clone(counts.at(-1));
        newCounts.set(result, (newCounts.get(result) ?? 0) + 1);
        counts.push(newCounts);
    }

    const prevIndex = indexMap.get(other);
    const prevCount = counts.at(prevIndex);
    const lastCount = counts.at(-1);

    const countDiff = new Map();
    for (let k of lastCount.keys()) {
        const diff = lastCount.get(k) - (prevCount.get(k) ?? 0);
        if (diff > 0) countDiff.set(k, diff);
    }

    const ret = prevIndex === 0 ? new Map() : clone(counts.at(prevIndex - 1));
    const stepsRemaining = prevIndex === 0 ? steps : steps - (prevIndex - 1);
    if (stepsRemaining) {
        const [fullRotations, remainder] = divmod(stepsRemaining, i - prevIndex);

        if (fullRotations > 0) {
            for (let k of countDiff.keys()) {
                const diff = countDiff.get(k);
                ret.set(k, (ret.get(k) ?? 0) + diff * fullRotations);
            }
        }

        if (remainder > 0) {
            for (let ii = 1; ii <= remainder; ii++) {
                const result = results[prevIndex + ii];
                ret.set(result, (ret.get(result) ?? 0) + 1);
            }
        }
    }
    console.log("pairCounts");
    console.log({ left, right, steps, ret });
    return ret;
}

function finalCount(polymer, rules, steps) {
    let ret = new Map();
    const nextOne = nextPolymer(polymer, rules);
    Object.entries(countBy(nextOne)).forEach(([elem, count]) => ret.set(elem, count));
    for (let i = 0; i < nextOne.length - 1; i++) {
        const pairGen1 = pairCounts(nextOne[i], nextOne[i + 1], rules, steps);
        const pairGen2 = pairCounts(nextOne[i], nextOne[i + 1], rules, steps, true);

        ret = mapSum(ret, pairGen1);
        ret = mapSum(ret, pairGen2);
    }

    return ret;
}

function PairMarker({ odd, result }) {
    return (
        <div
            className={clsx(
                "absolute w-24 left-0 font-mono text-center border-stone-400 aoc-glow",
                odd ? "-top-8 border-b-2" : "-bottom-8 border-t-2"
            )}
        >
            {result}
        </div>
    );
}

function Element({ name, index, nextElement, rules }) {
    const result = rules.get(name + nextElement);
    return (
        <div className="relative">
            <div className="font-mono text-4xl h-10 w-10 bg-stone-800 rounded-lg center border-2 border-stone-500 text-stone-300">
                {name}
            </div>
            {nextElement && result && <PairMarker odd={index % 2} result={result} />}
        </div>
    );
}

function Polymer({ polymer, rules }) {
    const elements = Array.from(polymer);

    return (
        <div className="flex gap-4 items-center">
            {elements.map((element, i) => (
                <Element
                    key={i}
                    index={i}
                    name={element}
                    nextElement={elements[i + 1]}
                    rules={rules}
                />
            ))}
        </div>
    );
}

export default function Day14() {
    const { lines } = useContext(ChallengeContext);
    const groups = splitGroups(lines);
    const template = groups[0][0];

    const rules = new Map();
    groups[1].forEach((s) => {
        const values = s.split(" -> ");
        rules.set(values[0][0] + values[0][1], values[1]);
    });

    const [polymers, setPolymers] = useState([template]);
    const handleNext = () => {
        setPolymers(polymers.concat([nextPolymer(polymers.at(-1), rules)]));
    };

    const finalCounts = polymerCounts(template, 40, rules);
    const ans2 = maxBy(Array.from(finalCounts.values())) - minBy(Array.from(finalCounts.values()));

    return (
        <div className="flex flex-col">
            {polymers.map((polymer, i) => {
                const isLast = i === polymers.length - 1;

                return (
                    <div key={i} className="flex py-10">
                        <button
                            className="center w-10 h-10 font-mono border-emerald-500 border-2 rounded-lg text-lg font-bold group mr-4"
                            onClick={isLast && handleNext}
                        >
                            <span>{i}</span>
                            {isLast && (
                                <div className="w-10 h-10 absolute bg-emerald-700 border-emerald-500 border-2 rounded-lg invisible group-hover:visible center">
                                    <ArrowDownIcon className="w-6 h-6 bg-emerald-700" />
                                </div>
                            )}
                        </button>
                        <Polymer polymer={polymer} rules={rules} />
                    </div>
                );
            })}
            <ObjectInspector>{{ qDiff: 0 }}</ObjectInspector>
        </div>
    );
}
