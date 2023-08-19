"use client";

import { useContext, useState } from "react";
import { cloneDeep } from "lodash";

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

    if (!isMove) return null;
    return prevCucumbers;
}

function Cucumber({ type }) {
    const char = { null: ".", 1: ">", 2: "v" }[type];
    return (
        <div className="w-6 h-6 font-mono text-lg bg-green-600 border-2 border-green-500 center">
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

    let c = cucumbers;
    let i = 0;
    while (c) {
        c = move(c);
        i++;
    }
    console.log(i);

    let lastCucumbers = cloneDeep(cucumbers);
    // for (let t = 0; t < turn; t++) {
    //     lastCucumbers = move(lastCucumbers);
    // }

    return (
        <div className="flex flex-col h-full gap-1 center">
            {lastCucumbers.map((row, i) => (
                <div key={i} className="flex gap-1">
                    {row.map((c, j) => (
                        <Cucumber key={j} type={c} />
                    ))}
                </div>
            ))}
            <div className="absolute w-12 h-12 top-6 left-6">
                <button
                    className="w-12 h-12 bg-pink-500 border-4"
                    onClick={() => setTurn(turn + 1)}
                />
            </div>
        </div>
    );
}
