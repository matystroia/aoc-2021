"use client";

import { useContext, useState } from "react";
import clsx from "clsx";
import { min, max, sortBy, sumBy } from "lodash";

import { divmod, randomColorPalette, randomHSL } from "../../utils";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "../../components/ObjectInspector";

function parseChunk(chunk) {
    const pairIndex = Array(chunk.length);

    const stack = [];
    for (let i = 0; i < chunk.length; i++) {
        const [type, closed] = divmod("()[]{}<>".indexOf(chunk[i]), 2);

        if (closed) {
            const [openType, openIndex] = stack.at(-1);
            if (type !== openType) throw Error(i);
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

function ChunkCharacter({
    character,
    isHighlighted,
    isHidden,
    isIllegal,
    color,
    onEnter,
    onLeave,
}) {
    return (
        <span
            className={clsx(
                "font-mono w-3 text-xl font-black cursor-pointer",
                isIllegal ? "text-rose-600 scale-125" : "text-slate-400",
                isHidden && "opacity-25",
                isHighlighted && "scale-150"
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

    // Parse line
    let pairIndex = Array(characters.length);
    let illegalIndex = null;
    try {
        pairIndex = parseChunk(line);
    } catch (e) {
        illegalIndex = parseInt(e.message);
    }

    // If part 2, complete line
    const { isPartOne } = useContext(ChallengeContext);
    let completedCharacters = characters.slice();
    if (illegalIndex === null && !isPartOne) {
        completedCharacters.push(...completeChunk(line));
        pairIndex = parseChunk(completedCharacters.join(""));
    }
    const numCompleted = completedCharacters.length - characters.length;

    // Color pairs
    const colors = Array(completedCharacters);
    if (pairIndex) {
        for (let i = 0; i < completedCharacters.length; i++) {
            if (pairIndex[i] === undefined || colors[i]) continue;
            const color = randomColors[i % 100];

            colors[i] = color;
            colors[pairIndex[i]] = color;
        }
    }

    // Hightlight pair on hover
    const [hoverIndex, setHoverIndex] = useState(null);
    let left, right, width;
    if (hoverIndex !== null) {
        left = min([hoverIndex, pairIndex[hoverIndex]]);
        right = max([hoverIndex, pairIndex[hoverIndex]]);
        width = right - left + 1;
    }

    return (
        <div className="relative px-2 py-4 rounded-lg bg-slate-900">
            <div className="flex items-center">
                {completedCharacters.map((c, i) => {
                    const isHighlighted = hoverIndex === i || hoverIndex === pairIndex[i];
                    const isHidden = hoverIndex !== null && !isHighlighted;

                    return (
                        <ChunkCharacter
                            key={i}
                            character={c}
                            isIllegal={illegalIndex === i}
                            isHighlighted={isHighlighted}
                            isHidden={isHidden}
                            color={colors[i]}
                            onEnter={() => setHoverIndex(i)}
                            onLeave={() => setHoverIndex(null)}
                        />
                    );
                })}
            </div>

            {/* Pair indicator */}
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

            {/* Borders */}
            <div
                className={clsx(
                    "absolute top-0 left-0 h-full border-2 rounded-lg pointer-events-none border-emerald-600",
                    numCompleted && "border-r-0 rounded-r-none"
                )}
                style={{
                    width: `calc(0.75rem * ${characters.length + Number(!numCompleted) * 1.25})`,
                }}
            />
            {numCompleted > 0 && (
                <div
                    className="absolute top-0 right-0 h-full border-2 border-l-0 border-dashed rounded-r-lg pointer-events-none border-emerald-600"
                    style={{
                        width: `calc(0.75rem * ${numCompleted})`,
                    }}
                />
            )}
        </div>
    );
}

export default function Day10() {
    const { lines } = useContext(ChallengeContext);

    const ans = sumBy(lines, (s) => {
        try {
            parseChunk(s);
            return 0;
        } catch (e) {
            return { ")": 3, "]": 57, "}": 1197, ">": 25137 }[s[parseInt(e.message)]];
        }
    });

    const lineScores = lines

        .filter((s) => {
            try {
                parseChunk(s);
                return true;
            } catch (e) {}
        })
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
