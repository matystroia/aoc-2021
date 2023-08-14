"use client";

import { useContext, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from "@heroicons/react/24/solid";
import { fill, sum } from "lodash";
import clsx from "clsx";

const memo = new Map();
function countNewFish(timer, turn) {
    if (timer + 1 > turn) return 0;

    const key = `${timer},${turn}`;
    if (memo.has(key)) {
        return memo.get(key);
    }

    let t = turn - timer - 1;
    let ret = 1;

    while (t >= 7) {
        ret += 1 + countNewFish(8, t);
        t -= 7;
    }

    memo.set(key, ret);
    return ret;
}

function Fish({ timer }) {
    return (
        <div
            className={clsx(
                "flex flex-col items-center rounded-lg border-2 border-slate-500 text-lg",
                timer === 0 && "animate-grow"
            )}
        >
            🐡
            <div className="font-mono aoc-glow">{timer}</div>
        </div>
    );
}

function Controls({ turn, onReset, onNext }) {
    return (
        <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500">
                <ArrowUturnLeftIcon className="w-6 h-6" onClick={onReset} />
            </button>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500">
                {turn}
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500">
                <ArrowUturnRightIcon className="w-6 h-6" onClick={onNext} />
            </button>
        </div>
    );
}

export default function Day6() {
    const { lines } = useContext(ChallengeContext);
    const [turn, setTurn] = useState(0);
    const [fish, setFish] = useState(lines[0].split(",").map((s) => parseInt(s)));

    const handleReset = () => {
        setTurn(0);
        setFish(lines[0].split(",").map((s) => parseInt(s)));
    };

    const handleNext = () => {
        const nextFish = [];
        let newFish = 0;
        fish.forEach((t) => {
            if (t - 1 < 0) {
                nextFish.push(6);
                newFish++;
            } else nextFish.push(t - 1);
        });
        nextFish.push(...fill(Array(newFish), 8));

        setTurn(turn + 1);
        setFish(nextFish);
    };

    const ans = sum(fish.map((t) => countNewFish(t, 256))) + fish.length;

    return (
        <div>
            <ObjectInspector>{{ lines, ans }}</ObjectInspector>
            <div className="absolute top-2 right-2">
                <Controls turn={turn} onReset={handleReset} onNext={handleNext} />
            </div>
            <div className="flex flex-wrap gap-2">
                {fish.map((t, i) => (
                    <Fish key={i} timer={t} />
                ))}
            </div>
        </div>
    );
}
