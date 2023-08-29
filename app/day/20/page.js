"use client";

import { useState, useContext } from "react";
import clsx from "clsx";
import { sumBy, inRange, times } from "lodash";

import { ChallengeContext } from "../ChallengeWrapper";
import { product } from "../../utils";

function Tile({ isLight, className }) {
    return (
        <div
            className={clsx(
                "border-2 rounded-sm font-mono center transition-transform cursor-pointer",
                isLight
                    ? "bg-zinc-300 border-zinc-400 text-zinc-400"
                    : "bg-zinc-800 border-zinc-900 text-zinc-900",
                className
            )}
        ></div>
    );
}

const dir = product([-1, 0, 1], [-1, 0, 1]);
function sharpen(rows, algorithm, border) {
    const ret = Array.from({ length: rows.length + 2 }).map((_) =>
        Array.from({ length: rows.length + 2 }, (__) => null)
    );

    for (let i = 0; i < ret.length; i++) {
        for (let j = 0; j < ret[0].length; j++) {
            const tiles = dir.map(([di, dj]) => {
                const [ii, jj] = [i + di - 1, j + dj - 1];
                return inRange(ii, rows.length) && inRange(jj, rows.length) ? rows[ii][jj] : border;
            });
            ret[i][j] = algorithm[parseInt(tiles.join(""), 2)];
        }
    }
    return ret;
}

export default function Day20() {
    const { lines, isPartOne, isExample } = useContext(ChallengeContext);

    const algorithm = Array.from(lines[0], (c) => (c === "#" ? 1 : 0));
    const n = lines[2].length;

    const [rows, setRows] = useState([
        ...lines.slice(2).map((s) => [...Array.from(s, (c) => (c === "#" ? 1 : 0))]),
    ]);

    const handleSharpen = () => {
        let r = rows;
        let border = 0;
        for (let i = 0; i < (isPartOne ? 2 : 50); i++) {
            r = sharpen(r, algorithm, border);
            border = 1 - border;
        }
        setRows(r);
    };

    const ans = sumBy(rows, (row) => sumBy(row));

    return (
        <div className={clsx("h-full flex flex-col center relative", isExample && "gap-2")}>
            {rows.map((row, i) => (
                <div key={i} className={clsx("flex", isExample && "gap-2")}>
                    {row.map((tile, j) => (
                        <Tile
                            key={j}
                            isLight={tile}
                            className={isExample ? "w-10 h-10 hover:scale-125" : "w-1 h-1 text-xs"}
                        />
                    ))}
                </div>
            ))}
            <div className="font-mono text-2xl">{ans}</div>
            <button
                className="absolute p-4 font-mono text-xl font-bold transition-transform border-4 rounded-md bottom-4 text-zinc-800 bg-zinc-300 border-zinc-400 hover:rotate-6"
                onClick={handleSharpen}
            >
                ENHANCE!
            </button>
        </div>
    );
}
