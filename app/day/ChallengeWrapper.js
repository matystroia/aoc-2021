"use client";

import { OptionsBar } from "./OptionsBar";
import { Fragment, createContext, useMemo, useState } from "react";
import { useFile } from "../hooks/useFile";
import { useSelectedLayoutSegment } from "next/navigation";
import clsx from "clsx";
import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/solid";

function PartToggle({ onClickOne, onClickTwo, isPartOne }) {
    return (
        <div className="flex flex-row items-center h-10 gap-2">
            <button
                className={clsx(
                    "h-10 w-10 rounded-lg border-2 items-center justify-center",
                    isPartOne ? "border-amber-500" : "text-slate-500 border-slate-500"
                )}
                onClick={onClickOne}
            >
                1
            </button>
            <button
                className={clsx(
                    "h-10 w-10 rounded-lg border-2 items-center justify-center",
                    isPartOne ? "text-slate-500 border-slate-500" : "border-amber-500"
                )}
                onClick={onClickTwo}
            >
                2
            </button>
        </div>
    );
}

function ExampleToggle({ onClick, isExampleToggled }) {
    return (
        <button
            className={clsx(
                "w-10 h-10 rounded-lg flex justify-center items-center",
                isExampleToggled ? "bg-emerald-500" : "border-2 border-emerald-500"
            )}
            onClick={onClick}
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

function Loading() {
    return <div className="flex items-center justify-center h-full text-8xl animate-pulse">😪</div>;
}

function Error({ error }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-8xl">
            💀
            <span className="px-4 m-4 font-mono text-lg text-center rounded-lg bg-slate-100 text-rose-800">
                {error.message}
            </span>
        </div>
    );
}

export const ChallengeContext = createContext({
    rawText: null,
    lines: null,
    isPartOne: null,
    isExample: null,
});

export function ChallengeWrapper({ children }) {
    const day = useSelectedLayoutSegment();
    const [isExampleToggled, setIsExampleToggled] = useState(true);
    const [isPartOne, setIsPartOne] = useState(true);
    const { rawText, lines, isExample, error, isLoading } = useFile(`day${day}`, isExampleToggled);

    const contextValue = { rawText, lines, isPartOne, isExample };

    return (
        <div className="relative h-full">
            {error && <Error error={error} />}
            {isLoading && <Loading />}
            <div className="flex flex-col w-full h-full">
                <ChallengeContext.Provider value={contextValue}>
                    <div className="flex-grow p-4 overflow-auto">
                        {!error && !isLoading && <Fragment key={isExample}>{children}</Fragment>}
                    </div>
                    <OptionsBar
                        day={day}
                        onChangePart={(part) => setIsPartOne(part === 1)}
                        onChangeExample={setIsExampleToggled}
                    />
                </ChallengeContext.Provider>
            </div>
        </div>
    );
}
