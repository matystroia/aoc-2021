"use client";

import { useContext, useState } from "react";
import clsx from "clsx";
import { useImmer } from "use-immer";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";

import { ChallengeContext } from "../ChallengeWrapper";

import { backtracking } from "./alt";

// #############
// #89.a.b.c.de#
// ###0#2#4#6###
//   #1#3#5#7#
//   #########

const dependencies = new Map();
function getDependencies(array, pos) {
    if (dependencies.has(pos)) return dependencies.get(pos);
    if (array[pos] === "ABCD"[Math.floor(pos / 2)]) return [];

    const ret = [];

    // Top needs to move out of the way
    if (pos % 2 == 1) ret.push(pos - 1);

    // Amphipods in target room need to move
    const color = "ABCD".indexOf(array[pos]);
    const [iTop, iBottom] = [color * 2, color * 2 + 1];

    // Bottom needs to move => Top will move too
    if (array[iBottom] !== array[pos]) ret.push(iTop, iBottom);
    // Only top needs to move
    else if (array[iBottom] === array[pos] && array[iTop] !== array[pos]) ret.push(iTop);

    dependencies.set(pos, ret);
    return ret;
}

function Amphipod({ i, j, color, onMove }) {
    let isWall = i > 0 && (j % 2 == 1 || j < 2 || j > 9);
    isWall = isWall || (i === 0 && j % 2 === 0 && j > 1 && j < 9);

    const handleDragStart = (e) => {
        e.dataTransfer.setData("text/plain", `${i},${j}`);
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e) => {
        if (isWall) return;
        const start = e.dataTransfer
            .getData("text/plain")
            .split(",")
            .map((s) => parseInt(s));

        onMove(start, [i, j]);
    };

    return (
        <div
            draggable={!isWall}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={clsx(
                "rounded-md w-16 h-16 center cursor-pointer  font-mono text-3xl font-black",
                color === "A" && "bg-orange-500 border-orange-600 text-white",
                color === "B" && "bg-red-500 border-red-600 text-white",
                color === "C" && "bg-cyan-500 border-cyan-600 text-white",
                color === "D" && "bg-pink-500 border-pink-600 text-white",
                !color && !isWall && "bg-zinc-500 border-zinc-600",
                !isWall && "border drop-shadow-md"
            )}
        >
            {color}
        </div>
    );
}

function AmphipodMap({ initialMap }) {
    const [amphipodMap, updateAmphipodMap] = useImmer(initialMap);
    const [cost, setCost] = useState(0);

    const handleMove = (from, to) => {
        const distance = Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1]);
        setCost(cost + distance * Math.pow(10, "ABCD".indexOf(amphipodMap[from[0]][from[1]])));
        updateAmphipodMap((draft) => {
            const x = draft[from[0]][from[1]];
            draft[from[0]][from[1]] = draft[to[0]][to[1]];
            draft[to[0]][to[1]] = x;
        });
    };
    const handleReset = () => {
        updateAmphipodMap(initialMap);
        setCost(0);
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col gap-2 p-4 bg-zinc-200 drop-shadow-lg rounded-xl">
                {amphipodMap.map((row, i) => (
                    <div key={i} className="flex gap-2">
                        {row.map((color, j) => {
                            return (
                                <Amphipod key={i} i={i} j={j} color={color} onMove={handleMove} />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <div className="px-12 py-2 font-mono text-2xl rounded-lg bg-zinc-200 drop-shadow-md text-zinc-900">
                    {cost}
                </div>
                <button
                    className="px-6 py-2 font-mono rounded-lg bg-zinc-200 drop-shadow-md center"
                    onClick={handleReset}
                >
                    <ArrowPathRoundedSquareIcon className="w-8 h-8 fill-zinc-900" />
                </button>
            </div>
        </div>
    );
}

function moveToHall(index, positions) {
    const ret = [];
    const colIndex = Math.floor(index / 4);

    // Left
    const indexLeft = 17 + colIndex;
    for (let i = indexLeft; i >= 16; i--) {
        if (positions.includes(i)) break; // Blocked
        ret.push(i);
    }

    // Right
    const indexRight = 18 + colIndex;
    for (let i = indexRight; i <= 22; i++) {
        if (positions.includes(i)) break; // Blocked
        ret.push(i);
    }

    return ret;
}

const colorToColIndex = { A: 0, B: 1, C: 2, D: 3 };
function moveToRoom(index, positions, initialColors, dependencies, isMoved) {
    const color = initialColors[index];
    const targetColIndex = colorToColIndex[color];

    const hallIndex = positions[index];
    if (hallIndex < 16) throw new Error("moveToRoom called for amphipod not in hall");

    // Check if path is blocked
    if (hallIndex <= 17 + targetColIndex) {
        // amphipod < target
        for (let i = hallIndex; i <= 17 + targetColIndex; i++)
            if (positions.includes(i)) return null;
    } else {
        // target < amphipod
        for (let i = hallIndex; i >= 18 + targetColIndex; i--)
            if (positions.includes(i)) return null;
    }

    // Check if can move into room
    for (const depIndex of dependencies[color]) if (!isMoved[depIndex]) return null;

    // Find bottom-most empty slot
    for (let j = 3; j >= 0; j--) {
        const targetIndex = targetColIndex * 4 + j;
        if (!positions.includes(targetIndex)) return targetIndex;
    }

    return ret;
}

function buildGraph(edges) {
    // Check top of rooms
    for (let i = 0; i < 16; i += 4) {
        for (const edge of edges) if (edge[0] === i) console.log(edge);
    }
}

function isSolution(positions, initialColors) {
    for (let i = 0; i < 16; i++) {
        const initialColor = initialColors[i];
        const columnColor = "ABCD"[Math.floor(positions[i] / 4)];
        if (initialColor !== columnColor) return false;
    }
    return true;
}

function isImpossible(positions, initialColors, isMoved) {
    // Hear me out...
    // Idea is to check if there exists an amphipod in hall
    //   that is left/right of its target room
    //   the n amphipods in the target room don't have n empty spaces right/left
    for (let i = 0; i < 16; i++) {
        if (positions[i] < 16) continue;
        // In the hall
        const index = positions[i];
        const color = initialColors[i];
        const colIndex = colorToColIndex[color];

        // Number of amphipods that need to get out of room
        let wrongCount = 0;
        for (
            let j = colIndex * 4;
            j < colIndex * 4 + 4 && (color !== initialColors[j] || isMoved[j]);
            j++
        )
            wrongCount++;

        if (index <= colIndex + 17) {
            // Left of target, so check right
            for (let j = colIndex + 18; j < colIndex + 18 + wrongCount; j++)
                if (positions.includes(j)) return true;
        } else {
            // Right of target, so check left
            for (let j = colIndex + 17; j > colIndex + 17 - wrongCount; j--)
                if (positions.includes(j)) return true;
        }
    }

    return false;
}

let overflow = 0;
const memo = new Set();
function bt(positions, isMoved, initialColors, dependencies, cost = 0) {
    if (isImpossible(positions, initialColors, isMoved)) return;

    // if (overflow++ > 99999) return;
    const key = positions.join(",");
    // ALlow if lower cost
    if (memo.has(key)) return;
    else memo.add(key);

    // Check if solution
    if (isSolution(positions, initialColors)) {
        console.log("Found solution, cost:", cost);
        return;
    }

    // Top of rooms
    for (let colIndex = 0; colIndex < 4; colIndex++) {
        const rightColor = "ABCD"[colIndex];

        let firstIndex = null;
        for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
            const arrIndex = colIndex * 4 + rowIndex;
            if (!isMoved[arrIndex]) {
                firstIndex = arrIndex;
                break;
            }
        }

        // Move from room to hall
        if (firstIndex !== null) {
            for (const newIndex of moveToHall(firstIndex, positions)) {
                const newPositions = positions.slice();
                const newIsMoved = isMoved.slice();
                newPositions[firstIndex] = newIndex;
                newIsMoved[firstIndex] = true;

                const addCost = 0;

                bt(newPositions, newIsMoved, initialColors, dependencies);
            }
        }

        // Move from hall to right room
        for (let colIndex = 0; colIndex < 4; colIndex++) {
            for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                const arrIndex = colIndex * 4 + rowIndex;

                if (positions[arrIndex] < 16) continue;

                const newIndex = moveToRoom(
                    arrIndex,
                    positions,
                    initialColors,
                    dependencies,
                    isMoved
                );

                const newPositions = positions.slice();
                newPositions[arrIndex] = newIndex;

                const addCost = 0;

                bt(newPositions, isMoved, initialColors, dependencies);
            }
        }
    }
}

export default function Day23() {
    const { lines, isPartOne } = useContext(ChallengeContext);

    const initialMap = [...Array(3).keys()].map((_) => [...Array(11).keys()].map((__) => null));
    // A
    initialMap[1][2] = lines[2][3];
    initialMap[2][2] = lines[3][3];
    // B
    initialMap[1][4] = lines[2][5];
    initialMap[2][4] = lines[3][5];
    // C
    initialMap[1][6] = lines[2][7];
    initialMap[2][6] = lines[3][7];
    // D
    initialMap[1][8] = lines[2][9];
    initialMap[2][8] = lines[3][9];

    if (!isPartOne) {
        initialMap.splice(
            2,
            0,
            [null, null, "D", null, "C", null, "B", null, "A", null, null],
            [null, null, "D", null, "B", null, "A", null, "C", null, null]
        );

        // Build positions for backtracking
        const positions = [];
        const initialColors = [];
        for (let j = 2; j <= 8; j += 2)
            for (let i = 1; i <= 4; i++) {
                positions.push(positions.length);
                initialColors.push(initialMap[i][j]);
            }
        const isMoved = [...Array(16).keys()].map((_) => false);

        // Build dependencies
        const dependencies = { A: [], B: [], C: [], D: [] };
        for (let colIndex = 0; colIndex < 4; colIndex++) {
            const color = "ABCD"[colIndex];

            // Find bottom-most wrong amphipod
            let wrongRowIndex = null;
            for (let rowIndex = 3; rowIndex >= 0; rowIndex--) {
                if (initialMap[rowIndex + 1][colIndex * 2 + 2] !== color) {
                    wrongRowIndex = rowIndex;
                    break;
                }
            }

            // Add all above wrong
            if (wrongRowIndex !== null) {
                for (let rowIndex = wrongRowIndex; rowIndex >= 0; rowIndex--) {
                    const arrayIndex = colIndex * 4 + rowIndex;
                    dependencies[color].push(arrayIndex);
                }
            }
        }

        // Build graph dependencies
        const edges = [];
        for (let arrIndex = 0; arrIndex < 16; arrIndex++) {
            const columnIndex = Math.floor(arrIndex / 4);
            const color = initialColors[arrIndex];
            const targetIndex = colorToColIndex[color];
            const rowIndex = arrIndex % 4;

            // Correct column and at bottom. Doesn't need to move
            if (columnIndex === targetIndex && rowIndex === 3) continue;

            const set = new Set();

            // Clear above
            for (let i = arrIndex - 1; i >= columnIndex * 4; i--) set.add(i);

            // Clear target column
            let wrongIndex = targetIndex * 4 + 3;
            while (wrongIndex >= targetIndex * 4 && initialColors[wrongIndex] === color)
                wrongIndex--;

            for (let i = wrongIndex; i >= targetIndex * 4; i--) set.add(i);

            set.delete(arrIndex);
            set.forEach((i) => edges.push([arrIndex, i]));
        }

        // buildGraph(edges);

        bt(positions, isMoved, initialColors);

        const rooms = [
            [1, 3, 3, 0],
            [2, 2, 1, 3],
            [1, 1, 0, 2],
            [3, 0, 2, 0],
        ];

        // const rooms = [
        //     [1, 3, 3, 2],
        //     [3, 2, 1, 3],
        //     [2, 1, 0, 1],
        //     [0, 0, 2, 0],
        // ];

        const hall = [...Array(7).keys()].map((_) => null);

        backtracking(rooms, hall);
    }

    return (
        <div className="h-full center">
            <AmphipodMap key={isPartOne} initialMap={initialMap} />
        </div>
    );
}
