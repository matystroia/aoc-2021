import clsx from "clsx";
import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/solid";
import { useContext, useRef } from "react";
import Link from "next/link";

import { Tooltip } from "../components/Tooltip";
import { ChallengeConfig } from "../input/config";

import { ChallengeContext } from "./ChallengeWrapper";

function PartToggle({ onChangePart }) {
    const { isPartOne } = useContext(ChallengeContext);
    return (
        <div className="flex flex-row items-center h-10 gap-2">
            <Tooltip description="Part One" position="topRight">
                <button
                    className={clsx(
                        "h-10 w-10 rounded-lg border-2 items-center justify-center",
                        isPartOne ? "border-amber-500" : "text-slate-500 border-slate-500"
                    )}
                    onClick={() => onChangePart(1)}
                >
                    1
                </button>
            </Tooltip>
            <Tooltip description="Part Two" position="topRight">
                <button
                    className={clsx(
                        "h-10 w-10 rounded-lg border-2 items-center justify-center",
                        isPartOne ? "text-slate-500 border-slate-500" : "border-amber-500"
                    )}
                    onClick={() => onChangePart(2)}
                >
                    2
                </button>
            </Tooltip>
        </div>
    );
}

function ExampleToggle({ disabled, onChangeExample }) {
    const { isExample } = useContext(ChallengeContext);
    return (
        <button
            disabled={disabled}
            className={clsx(
                "w-10 h-10 rounded-lg flex justify-center items-center disabled:bg-emerald-700 disabled:text-emerald-500",
                isExample ? "bg-emerald-500" : "border-2 border-emerald-500"
            )}
            onClick={() => onChangeExample(!isExample)}
        >
            <AcademicCapIcon className="w-6 h-6" />
        </button>
    );
}

function Notes({ disabled, onOpenNotes }) {
    return (
        <>
            <button
                disabled={disabled}
                className="flex items-center justify-center w-10 h-10 border-2 rounded-lg border-amber-500 group disabled:border-slate-500"
                onClick={onOpenNotes}
            >
                <BookOpenIcon className="w-6 h-6 group-disabled:fill-slate-500" />
            </button>
        </>
    );
}

export function OptionsBar({ day, onChangePart, onChangeExample, onOpenNotes, className }) {
    const { name, exampleOnly } = ChallengeConfig[day];
    const { hasNotes } = useContext(ChallengeContext);

    return (
        <div className={clsx("p-2 flex items-center justify-between bg-slate-700", className)}>
            <PartToggle onChangePart={onChangePart} />
            <div className="flex flex-col items-center">
                <div className="text-sm text-slate-300">Day {day}</div>
                <div className="underline text-slate-100 decoration-slate-400">
                    <Link href={`https://adventofcode.com/2021/day/${day}`}>{name} </Link>
                </div>
            </div>
            <div className="flex gap-2">
                <Tooltip description="Show notes" position="topLeft">
                    <Notes disabled={true} onOpenNotes={onOpenNotes} />
                </Tooltip>
                <Tooltip description="Toggle example data" position="topLeft">
                    <ExampleToggle disabled={exampleOnly} onChangeExample={onChangeExample} />
                </Tooltip>
            </div>
        </div>
    );
}
