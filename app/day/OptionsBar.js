import clsx from "clsx";
import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/solid";
import { useContext } from "react";
import { ChallengeContext } from "./ChallengeWrapper";
import { ChallengeConfig } from "../input/names";

function PartToggle({ onChangePart }) {
    const { isPartOne } = useContext(ChallengeContext);
    return (
        <div className="flex flex-row items-center h-10 gap-2">
            <button
                className={clsx(
                    "h-10 w-10 rounded-lg border-2 items-center justify-center",
                    isPartOne ? "border-amber-500" : "text-slate-500 border-slate-500"
                )}
                onClick={() => onChangePart(1)}
            >
                1
            </button>
            <button
                className={clsx(
                    "h-10 w-10 rounded-lg border-2 items-center justify-center",
                    isPartOne ? "text-slate-500 border-slate-500" : "border-amber-500"
                )}
                onClick={() => onChangePart(2)}
            >
                2
            </button>
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

function Notes() {
    return (
        <button className="flex items-center justify-center w-10 h-10 border-2 rounded-lg border-amber-500">
            <BookOpenIcon className="w-6 h-6" />
        </button>
    );
}

export function OptionsBar({ day, onChangePart, onChangeExample, className }) {
    const { name, exampleOnly } = ChallengeConfig[day];

    return (
        <div className={clsx("p-2 flex items-center justify-between bg-slate-700", className)}>
            <PartToggle onChangePart={onChangePart} />
            <div className="flex flex-col items-center">
                <div className="text-sm text-slate-300">Day {day}</div>
                <div className="text-slate-100">{name}</div>
            </div>
            <div className="flex gap-2">
                <Notes />
                <ExampleToggle disabled={exampleOnly} onChangeExample={onChangeExample} />
            </div>
        </div>
    );
}
