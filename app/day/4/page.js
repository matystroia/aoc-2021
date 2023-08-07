"use client";

import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { experimental_useEffectEvent as useEffectEvent } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { compact, every, filter, flatten, includes, range, sum } from "lodash";
import { splitGroups } from "app/utils";
import clsx from "clsx";
import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    PlayIcon,
    PauseIcon,
} from "@heroicons/react/24/solid";

function isBingo(board, drawnNumbers) {
    // Rows
    for (let i = 0; i < board.length; i++)
        if (every(board[i], (x) => drawnNumbers.includes(x))) return true;

    // Columns
    for (let i = 0; i < board[0].length; i++) {
        const column = range(0, board[0].length).map((row) => board[row][i]);
        if (every(column, (x) => drawnNumbers.includes(x))) return true;
    }

    return false;
}

function BingoNumber({ number, isDrawn }) {
    return (
        <div
            className={clsx(
                "w-10 h-10 flex items-center justify-center",
                isDrawn ? "bg-emerald-700" : "bg-slate-500"
            )}
        >
            {number}
        </div>
    );
}

const BingoBoard = forwardRef(function BingoBoard({ board, drawnNumbers }, ref) {
    const isWinner = isBingo(board, drawnNumbers);
    const score = isWinner
        ? sum(filter(flatten(board), (x) => !includes(drawnNumbers, x))) * drawnNumbers.at(-1)
        : 0;

    return (
        <div
            className={clsx(
                "p-2 flex flex-col w-fit gap-2 border-4",
                isWinner ? "border-emerald-700 animate-grow" : "border-slate-400"
            )}
            ref={ref}
        >
            {board.map((row, i) => (
                <div key={i} className="flex flex-row gap-2">
                    {row.map((number, j) => (
                        <BingoNumber
                            key={j}
                            number={number}
                            isDrawn={includes(drawnNumbers, number)}
                        />
                    ))}
                </div>
            ))}
            {isWinner && <span className="text-right">{score}</span>}
        </div>
    );
});

function Controls({ turn, turnsLength, isPlaying, onChangePlay, onChangeTurn }) {
    return (
        <div className="flex flex-row gap-2">
            <button
                className="bg-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center disabled:bg-slate-500"
                onClick={() => onChangeTurn(turn - 1)}
                disabled={turn === 0}
            >
                <ArrowUturnLeftIcon className="h-6 w-6" />
            </button>

            <button
                className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center"
                onClick={onChangePlay}
            >
                {isPlaying ? <PauseIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
            </button>

            <button
                className="bg-cyan-500 w-10 h-10 rounded-lg flex items-center justify-center disabled:bg-slate-500"
                onClick={() => onChangeTurn(turn + 1)}
                disabled={turn === turnsLength - 1}
            >
                <ArrowUturnRightIcon className="h-6 w-6" />
            </button>
        </div>
    );
}

export default function Day4() {
    const { lines, isPartOne } = useContext(ChallengeContext);

    const groups = splitGroups(lines);
    const drawnNumbers = groups[0][0].split(",").map((s) => parseInt(s));
    const boards = groups
        .slice(1)
        .map((group) => group.map((row) => compact(row.split(" ")).map((x) => parseInt(x))));

    const [turn, setTurn] = useState(0);
    const turnsLength = drawnNumbers.length + 1; // First turn will be empty
    const drawnNumbersSlice = drawnNumbers.slice(0, turn);

    // Part One, scroll to first winner
    const boardsRef = useRef(new Map());
    useEffect(() => {
        if (!isPartOne) return;

        const firstWinnerIndex = boards.findIndex((b) => isBingo(b, drawnNumbersSlice));
        if (firstWinnerIndex !== -1) {
            setIsPlaying(false);

            if (boardsRef.current.has(firstWinnerIndex)) {
                boardsRef.current.get(firstWinnerIndex).scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }, [boards, drawnNumbersSlice, isPartOne]);

    // Play turns
    const [isPlaying, setIsPlaying] = useState(false);
    const onIncrementTurn = useEffectEvent(() => {
        if (turn + 1 < turnsLength) setTurn(turn + 1);
        else setIsPlaying(false);
    });
    useEffect(() => {
        if (!isPlaying) return;

        const intervalId = setInterval(() => {
            onIncrementTurn();
        }, 100);
        return () => clearInterval(intervalId);
    }, [isPlaying]);

    const shownBoards = isPartOne ? boards : boards.filter((b) => !isBingo(b, drawnNumbersSlice));

    return (
        <div className="">
            <div className="absolute top-4 right-4 z-10">
                <Controls
                    turn={turn}
                    turnsLength={turnsLength}
                    onChangeTurn={(newTurn) => setTurn(newTurn)}
                    isPlaying={isPlaying}
                    onChangePlay={() => setIsPlaying(!isPlaying)}
                />
            </div>
            <div className="flex gap-6 flex-wrap items-start">
                {shownBoards.map((board, i) => (
                    <BingoBoard
                        key={i}
                        board={board}
                        drawnNumbers={drawnNumbersSlice}
                        ref={(node) => {
                            if (node) boardsRef.current.set(i, node);
                            else boardsRef.current.delete(i);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
