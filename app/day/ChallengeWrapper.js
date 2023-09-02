"use client";

import { Fragment, createContext, useMemo, useEffect, useRef, useState } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import clsx from "clsx";
import { AcademicCapIcon, BookOpenIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { dynamic } from "next/dynamic";

import { useFile } from "../hooks/useFile";
import { useNotes } from "../hooks/useNotes";
import { ChallengeConfig } from "../input/config";

import { OptionsBar } from "./OptionsBar";

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
    return <div className="flex items-center justify-center h-full text-8xl animate-pulse">⌛</div>;
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
    const { Component: NotesComponent } = useNotes(day);

    const contextValue = {
        rawText,
        lines,
        isPartOne,
        isExample,
        hasNotes: Boolean(NotesComponent),
    };

    const ref = useRef();
    const handleOpenNotes = () => {
        ref.current.showModal();
    };

    return (
        <div className="relative h-full">
            {error && <Error error={error} />}
            {isLoading && <Loading />}
            <div className="flex flex-col w-full h-full">
                <ChallengeContext.Provider value={contextValue}>
                    <div className="relative flex-grow p-4 overflow-auto">
                        {!error && !isLoading && <Fragment key={isExample}>{children}</Fragment>}
                    </div>
                    <OptionsBar
                        day={day}
                        onChangePart={(part) => setIsPartOne(part === 1)}
                        onChangeExample={setIsExampleToggled}
                        onOpenNotes={handleOpenNotes}
                    />
                </ChallengeContext.Provider>
            </div>
            <dialog
                ref={ref}
                className="p-10 pt-0 prose rounded-lg prose-notes bg-slate-950 backdrop:backdrop-blur-sm backdrop:bg-slate-900/25"
            >
                <button onClick={() => ref.current.close()} className="absolute right-4 top-4">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                {NotesComponent && <NotesComponent />}
            </dialog>
        </div>
    );
}
