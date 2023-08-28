"use client";

import { useContext, useState } from "react";
import { cloneDeep } from "lodash";
import { ArrowPathIcon, ArrowUturnRightIcon } from "@heroicons/react/24/solid";

import { ChallengeContext } from "../ChallengeWrapper";

const dirs = { 1: [0, 1], 2: [1, 0] };
function move(cucumbers) {
    let isMove = false;

    let prevCucumbers = cloneDeep(cucumbers);
    for (const type of [1, 2]) {
        let nextCucumbers = cloneDeep(prevCucumbers);
        for (let i = 0; i < cucumbers.length; i++) {
            for (let j = 0; j < cucumbers[0].length; j++) {
                const cucumber = prevCucumbers[i][j];
                if (cucumber !== type) continue;

                const d = dirs[cucumber];
                const [ii, jj] = [(i + d[0]) % cucumbers.length, (j + d[1]) % cucumbers[0].length];

                if (prevCucumbers[ii][jj] === null) {
                    nextCucumbers[i][j] = null;
                    nextCucumbers[ii][jj] = cucumber;
                    isMove = true;
                }
            }
        }
        prevCucumbers = nextCucumbers;
    }

    return [isMove, prevCucumbers];
}

function solve(cucumbers) {
    let i = 0;
    let [isMove, c] = [true, cucumbers];

    while (isMove) {
        [isMove, c] = move(c);
        i++;
    }

    return i;
}

function Cucumber({ type }) {
    const char = { null: ".", 1: ">", 2: "v" }[type];
    return (
        <div className="w-8 h-8 font-mono text-xl font-bold text-green-200 bg-green-700 rounded center">
            {char}
        </div>
    );
}

export default function Day25() {
    const { lines } = useContext(ChallengeContext);
    const cucumbers = lines.map((row) =>
        Array.from(row).map((c) => ({ ">": 1, v: 2, ".": null }[c]))
    );

    const [turn, setTurn] = useState(0);
    let lastCucumbers = cloneDeep(cucumbers);
    for (let t = 0; t < turn; t++) {
        lastCucumbers = move(lastCucumbers)[1];
    }

    return (
        <div className="relative flex flex-col h-full gap-1 center">
            {lastCucumbers.map((row, i) => (
                <div key={i} className="flex gap-1">
                    {row.map((c, j) => (
                        <Cucumber key={j} type={c} />
                    ))}
                </div>
            ))}
            <div className="absolute flex items-center gap-4 p-4 bg-violet-500 -top-4 rounded-b-md drop-shadow-md">
                <button
                    className="w-10 h-10 transition-transform border rounded-md hover:scale-105 center bg-violet-600 border-violet-800 drop-shadow-md"
                    onClick={() => setTurn(0)}
                >
                    <ArrowPathIcon className="w-6 h-6 fill-violet-200" />
                </button>
                <div className="w-10 h-10 mt-3 border rounded-md center bg-violet-600 border-violet-800 text-violet-200">
                    {turn}
                </div>
                <button
                    className="w-10 h-10 transition-transform border rounded-md hover:scale-105 center bg-violet-600 border-violet-800 drop-shadow-md"
                    onClick={() => setTurn(turn + 1)}
                >
                    <ArrowUturnRightIcon className="w-6 h-6 fill-violet-200" />
                </button>
            </div>
        </div>
    );
}
