"use client";

import {
    useContext,
    useEffect,
    useState,
    experimental_useEffectEvent as useEffectEvent,
} from "react";
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, ForwardIcon } from "@heroicons/react/24/solid";
import { useImmer } from "use-immer";
import clsx from "clsx";
import {
    cloneDeep,
    differenceWith,
    drop,
    flatMap,
    inRange,
    isEqual,
    range,
    uniqWith,
} from "lodash";

import { product } from "../../utils";
import { ObjectInspector } from "../../components/ObjectInspector";
import { ChallengeContext } from "../ChallengeWrapper";

const positions = product(range(10), range(10));
const directions = drop(product([0, 1, -1], [0, 1, -1]), 1);
const neighbors = (i, j) => {
    return directions
        .map(([di, dj]) => [i + di, j + dj])
        .filter(([i, j]) => inRange(i, 10) && inRange(j, 10));
};

function getStepTurns(octopuses) {
    const ret = [];

    // Increment all
    let newOctopuses = cloneDeep(octopuses);
    positions.forEach(([i, j]) => newOctopuses[i][j]++);
    ret.push(newOctopuses);

    // Get flashing
    let flashingPositions = positions.filter(([i, j]) => newOctopuses[i][j] > 9);
    const flashingSet = [];
    while (flashingPositions.length > 0) {
        newOctopuses = cloneDeep(newOctopuses);
        flashingSet.push(...flashingPositions);

        const flashingNeighbors = flatMap(flashingPositions, ([i, j]) => neighbors(i, j));
        flashingNeighbors.forEach(([i, j]) => newOctopuses[i][j]++);

        ret.push(newOctopuses);
        flashingPositions = differenceWith(
            positions.filter(([i, j]) => newOctopuses[i][j] > 9),
            flashingSet
        );
    }

    // Reset energy
    const flashedPositions = positions.filter(([i, j]) => newOctopuses[i][j] > 9);
    if (flashedPositions.length > 0) {
        newOctopuses = cloneDeep(newOctopuses);
        flashedPositions.forEach(([i, j]) => (newOctopuses[i][j] = 0));
        ret.push(newOctopuses);
    }

    return ret;
}

function totalFlashes(octopuses, steps) {
    let ret = 0;
    let newOctopuses = cloneDeep(octopuses);
    for (let i = 0; i < steps; i++) {
        const turns = getStepTurns(newOctopuses);
        if (turns.length > 1) {
            newOctopuses = turns.at(-1);
            ret += positions.filter(([i, j]) => turns.at(-2)[i][j] > 9).length;
        } else {
            newOctopuses = turns[0];
        }
    }
    return ret;
}

function Octopus({ energy }) {
    const isFlashing = energy > 9;

    return (
        <div
            className={clsx(
                "border-2 border-slate-500 bg-slate-900 rounded-md h-14 w-14 center flex flex-col font-mono transition-all",
                isFlashing && "brightness-200"
            )}
        >
            <span>🐙</span>
            {isFlashing ? "⚡" : energy}
        </div>
    );
}

export default function Day11() {
    const { lines, isPartOne } = useContext(ChallengeContext);
    const [octopuses, updateOctopuses] = useImmer(
        lines.map((line) => Array.from(line).map((e) => parseInt(e)))
    );
    const [stepTurns, setStepTurns] = useState(
        getStepTurns(lines.map((line) => Array.from(line).map((e) => parseInt(e))))
    );
    const [turnIndex, setTurnIndex] = useState(0);
    const [step, setStep] = useState(0);

    const handleReset = () => {
        updateOctopuses(lines.map((line) => Array.from(line).map((e) => parseInt(e))));
        setStepTurns([]);
        setTurnIndex(0);
        setStep(0);
    };

    const handleNext = () => {
        if (turnIndex + 1 >= stepTurns.length) {
            const newTurns = getStepTurns(octopuses);
            updateOctopuses(newTurns[0]);
            setStepTurns(newTurns);
            setTurnIndex(0);
            setStep(step + 1);
        } else {
            updateOctopuses(stepTurns[turnIndex + 1]);
            setTurnIndex(turnIndex + 1);
        }
    };

    const [isForward, setIsForward] = useState(false);
    const onNextTurn = useEffectEvent(() => {
        if (positions.filter(([i, j]) => octopuses[i][j] > 9).length === 100) {
            setIsForward(false);
        } else {
            handleNext();
        }
    });
    useEffect(() => {
        if (!isForward) return;

        const interval = setInterval(() => {
            onNextTurn();
        }, 10);
        return () => clearInterval(interval);
    }, [isForward]);

    return (
        <div className="flex flex-col h-full center">
            <div className="flex flex-col p-4 border-2 rounded-lg w-fit border-slate-600">
                <div className="flex flex-col gap-2">
                    {octopuses.map((row, i) => (
                        <div key={i} className="flex gap-2">
                            {row.map((energy, j) => (
                                <Octopus key={j} energy={energy} />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex items-center mt-4">
                    <div className="font-mono">
                        Step {step} ({turnIndex + 1}/{stepTurns.length})
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <button
                            className="w-10 h-10 rounded-lg bg-slate-500 center"
                            onClick={handleReset}
                        >
                            <ArrowUturnLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                            className="w-10 h-10 rounded-lg bg-slate-500 center"
                            onClick={handleNext}
                        >
                            <ArrowUturnRightIcon className="w-6 h-6" />
                        </button>
                        {!isPartOne && (
                            <button
                                className="w-10 h-10 rounded-lg bg-slate-500 center"
                                onClick={() => setIsForward(!isForward)}
                            >
                                <ForwardIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
