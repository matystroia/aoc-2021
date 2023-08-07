"use client";

import { Fragment, createContext, useMemo, useState } from "react";
import { useFile } from "../hooks/useFile";
import { useSelectedLayoutSegment } from "next/navigation";
import clsx from "clsx";
import { AcademicCapIcon, BookOpenIcon } from "@heroicons/react/24/solid";

function PartToggle({ onClickOne, onClickTwo, isPartOne }) {
    return (
        <div className="h-10 flex flex-row items-center gap-2">
            <button
                className={clsx(
                    "h-10 w-10 rounded-lg border-2 items-center justify-center",
                    isPartOne
                        ? "border-amber-500"
                        : "text-slate-500 border-slate-500"
                )}
                onClick={onClickOne}
            >
                1
            </button>
            <button
                className={clsx(
                    "h-10 w-10 rounded-lg border-2 items-center justify-center",
                    isPartOne
                        ? "text-slate-500 border-slate-500"
                        : "border-amber-500"
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
                isExampleToggled
                    ? "bg-emerald-500"
                    : "border-2 border-emerald-500"
            )}
            onClick={onClick}
        >
            <AcademicCapIcon className="h-6 w-6" />
        </button>
    );
}

function Notes() {
    return (
        <button className="w-10 h-10 rounded-lg flex justify-center items-center border-2 border-amber-500">
            <BookOpenIcon className="h-6 w-6" />
        </button>
    );
}

function Loading() {
    return (
        <div className="h-full flex items-center justify-center text-8xl animate-pulse">
            😪
        </div>
    );
}

function Error({ error }) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-8xl">
            💀
            <span className="text-lg text-center m-4 font-mono bg-slate-100 rounded-lg px-4 text-rose-800">
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
    const { rawText, lines, isExample, error, isLoading } = useFile(
        `day${day}`,
        isExampleToggled
    );

    const contextValue = { rawText, lines, isPartOne, isExample };

    return (
        <div className="relative h-full">
            {error && <Error error={error} />}
            {isLoading && <Loading />}
            <div className="w-full h-full flex flex-col">
                <div className="flex-grow p-4 overflow-auto">
                    {!error && !isLoading && (
                        <ChallengeContext.Provider value={contextValue}>
                            <Fragment key={isExample}>{children}</Fragment>
                        </ChallengeContext.Provider>
                    )}
                </div>
                <div className="bg-slate-700 p-2 flex">
                    <div className="flex flex-row gap-2">
                        <PartToggle
                            onClickOne={() => setIsPartOne(true)}
                            onClickTwo={() => setIsPartOne(false)}
                            isPartOne={isPartOne}
                        />
                    </div>
                    <div className="flex flex-row gap-2 ml-auto">
                        <Notes />
                        <ExampleToggle
                            onClick={() =>
                                setIsExampleToggled(!isExampleToggled)
                            }
                            isExampleToggled={isExampleToggled}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
