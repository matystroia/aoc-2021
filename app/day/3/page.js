"use client";

import { ObjectInspector } from "app/components/ObjectInspector";
import { useContext } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { useImmer } from "use-immer";
import { filter } from "lodash";
import clsx from "clsx";

function part1(numbers, length) {
    let mostCommon = 0;
    for (let i = 0; i < length; i++) {
        const positionBits = numbers.map((x) => x & (1 << i));
        const onesCount = filter(positionBits).length;

        if (onesCount > numbers.length / 2) {
            mostCommon |= 1 << i;
        }
    }

    const leastCommon = mostCommon ^ ((1 << length) - 1);
    return { mostCommon, leastCommon };
}

function part2(numbers, length, keepMostCommon = true) {
    let filtered = numbers.slice();
    for (let i = length - 1; i >= 0; i--) {
        const positionBits = filtered.map((x) => x & (1 << i));
        const onesCount = filter(positionBits).length;
        const zeroesCount = filtered.length - onesCount;

        if (keepMostCommon) {
            if (onesCount >= filtered.length / 2) {
                filtered = filter(filtered, (x) => x & (1 << i));
            } else {
                filtered = filter(filtered, (x) => !(x & (1 << i)));
            }
        } else {
            if (zeroesCount <= filtered.length / 2) {
                filtered = filter(filtered, (x) => !(x & (1 << i)));
            } else {
                filtered = filter(filtered, (x) => x & (1 << i));
            }
        }

        if (filtered.length === 1) return filtered[0];
    }
}

function BinaryBit({ value, isResult, onClick }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-8 h-8 text-black font-mono text-lg transition-transform hover:scale-125 hover:bg-emerald-300",
                isResult ? "bg-amber-500" : "bg-emerald-500"
            )}
        >
            {value}
        </button>
    );
}

function BinaryNumber({ number, length, isResult, onChange }) {
    const binaryArray = Array.from(number.toString(2).padStart(length, "0"));

    const handleClick = (i) => {
        if (!isResult) {
            // :P
            onChange(number ^ (1 << (length - i - 1)));
        }
    };

    return (
        <div className="flex flex-row items-center gap-2">
            <div
                className={clsx(
                    "w-8 text-slate-500 font-mono text-lg text-right",
                    isResult && "aoc-glow"
                )}
            >
                {number}
            </div>
            {binaryArray.map((bit, i) => (
                <BinaryBit key={i} value={bit} isResult={isResult} onClick={() => handleClick(i)} />
            ))}
        </div>
    );
}

function BinaryInspector({ initialNumbers, length }) {
    const [numbers, updateNumbers] = useImmer(initialNumbers);

    const { mostCommon, leastCommon } = part1(numbers, length);

    const handleChange = (i, newNumber) => {
        updateNumbers((draft) => {
            draft[i] = newNumber;
        });
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            {numbers.map((x, i) => (
                <BinaryNumber
                    key={i}
                    number={x}
                    length={length}
                    onChange={(newNumber) => handleChange(i, newNumber)}
                />
            ))}
            <div className="w-full border-t-2 border-rose-500 border"></div>
            <BinaryNumber number={mostCommon} isResult length={length} />
            <BinaryNumber number={leastCommon} isResult length={length} />
        </div>
    );
}

export default function Day3() {
    const { lines, isExample } = useContext(ChallengeContext);
    const linesAsNumbers = lines.map((s) => parseInt(s, 2));

    const { mostCommon: gamma, leastCommon: epsilon } = part1(linesAsNumbers, lines[0].length);

    const oxygenGenerator = part2(linesAsNumbers, lines[0].length, true);
    const scrubber = part2(linesAsNumbers, lines[0].length, false);

    return (
        <div>
            <ObjectInspector>
                {{
                    lines,
                    gamma,
                    epsilon,
                    answer: gamma * epsilon,
                }}
            </ObjectInspector>
            <ObjectInspector>
                {{
                    oxygenGenerator,
                    scrubber,
                    answer: oxygenGenerator * scrubber,
                }}
            </ObjectInspector>
            {isExample && (
                <BinaryInspector initialNumbers={linesAsNumbers} length={lines[0].length} />
            )}
        </div>
    );
}
