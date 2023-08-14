"use client";

import { useContext, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import clsx from "clsx";
import { divmod, randomColorPalette, randomHSL } from "app/utils";
import { min, max, sortBy, sumBy } from "lodash";

function parseChunk(chunk) {
    const pairIndex = Array(chunk.length);

    const stack = [];
    for (let i = 0; i < chunk.length; i++) {
        const [type, closed] = divmod("()[]{}<>".indexOf(chunk[i]), 2);

        if (closed) {
            const [openType, openIndex] = stack.at(-1);
            if (type !== openType) return i;
            stack.pop();

            pairIndex[i] = openIndex;
            pairIndex[openIndex] = i;
        } else {
            stack.push([type, i]);
        }
    }
    return pairIndex;
}

function completeChunk(chunk) {
    const stack = [];
    for (let i = 0; i < chunk.length; i++) {
        const [type, closed] = divmod("()[]{}<>".indexOf(chunk[i]), 2);
        closed ? stack.pop() : stack.push(type);
    }
    stack.reverse();
    return stack.map((t) => ")]}>"[t]);
}

function ChunkCharacter({ character, className, isIllegal, color, onEnter, onLeave }) {
    return (
        <span
            className={clsx(
                "font-mono w-3 text-xl cursor-pointer text-slate-400",
                isIllegal && "border-b-rose-700 border-b-2",
                className
            )}
            style={{ color }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            {character}
        </span>
    );
}

const randomColors = randomColorPalette(100, 75, 60);

function ChunkLine({ line }) {
    const characters = Array.from(line);

    let [pairIndex, illegalIndex] = [Array(characters.length), null];
    const ret = parseChunk(line);
    if (Array.isArray(ret)) pairIndex = ret;
    else illegalIndex = ret;

    const colors = Array(characters.length);
    if (pairIndex) {
        for (let i = 0; i < characters.length; i++) {
            if (pairIndex[i] === undefined || colors[i]) continue;
            const color = randomColors[i % 100];

            colors[i] = color;
            colors[pairIndex[i]] = color;
        }
    }

    // TODO: Fix pair highlighting on completion
    const { isPartOne } = useContext(ChallengeContext);
    let completion;
    if (!illegalIndex && !isPartOne) completion = completeChunk(line);

    const [hoverIndex, setHoverIndex] = useState(null);

    let left, right, width;
    if (hoverIndex !== null) {
        left = min([hoverIndex, pairIndex[hoverIndex]]);
        right = max([hoverIndex, pairIndex[hoverIndex]]);
        width = right - left + 1;
    }

    return (
        <div className="relative p-4 border-2 rounded-lg border-slate-500">
            <div className="flex items-center">
                {characters.map((c, i) => {
                    const isHighlighted =
                        hoverIndex === null || hoverIndex === i || hoverIndex === pairIndex[i];

                    return (
                        <ChunkCharacter
                            key={i}
                            character={c}
                            isIllegal={illegalIndex === i}
                            color={colors[i]}
                            className={clsx(!isHighlighted && "opacity-25")}
                            onEnter={() => setHoverIndex(i)}
                            onLeave={() => setHoverIndex(null)}
                        />
                    );
                })}
                {completion && (
                    <div className="border-2 border-dashed rounded-sm border-slate-400">
                        {completion.map((c, i) => {
                            const isHighlighted =
                                hoverIndex === null ||
                                hoverIndex === i ||
                                hoverIndex === pairIndex[i];

                            return (
                                <ChunkCharacter
                                    key={i}
                                    character={c}
                                    isIllegal={illegalIndex === i}
                                    color={colors[i]}
                                    className={clsx(!isHighlighted && "opacity-25")}
                                    onEnter={() => setHoverIndex(i)}
                                    onLeave={() => setHoverIndex(null)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            {hoverIndex !== null && width > 1 && (
                <div
                    className="h-2 mt-2 border-2 border-t-0"
                    style={{
                        width: `calc(0.75rem * ${width})`,
                        marginLeft: `calc(0.75rem * ${left})`,
                        borderColor: colors[hoverIndex],
                    }}
                />
            )}
        </div>
    );
}

export default function Day10() {
    const { lines } = useContext(ChallengeContext);

    const ans = sumBy(lines, (s) => {
        const ret = parseChunk(s);
        if (Array.isArray(ret)) return 0;
        return { ")": 3, "]": 57, "}": 1197, ">": 25137 }[s[ret]];
    });

    const lineScores = lines
        .filter((s) => parseChunk(s) === null)
        .map((s) => completeChunk(s).reduce((acc, c) => acc * 5 + ")]}>".indexOf(c) + 1, 0));
    const ans2 = sortBy(lineScores)[Math.floor(lineScores.length / 2)];

    return (
        <div>
            <div className="flex flex-col items-center gap-4">
                {lines.map((line, i) => (
                    <ChunkLine key={i} line={line} />
                ))}
            </div>
        </div>
    );
}

export const config = {
    exampleOnly: false,
};
