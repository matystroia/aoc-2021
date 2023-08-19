"use client";

import { useContext, useState } from "react";
import { maxBy, range } from "lodash";
import { PlayIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

import { splitGroups } from "../../utils";
import { ObjectInspector } from "../../components/ObjectInspector";
import { Canvas } from "../../components/Canvas";
import { ChallengeContext } from "../ChallengeWrapper";

function Square({ i, j, isDot, folds, animationState }) {
    let className = "bg-amber-200";
    const style = { transform: "", transition: "transform 1s ease-in-out" };
    const wrapperStyle = { transform: "", transition: "transform 1s ease-in-out" };

    folds.forEach((fold, foldIndex) => {
        const foldState = foldIndex === folds.length - 1 ? animationState : State.Fold;
        const { isVertical, index } = fold;

        const isMiddle = (isVertical && j === index) || (!isVertical && i === index);
        const isLeft = isVertical ? j < index : i < index;

        if (isMiddle) className = "bg-rose-200";

        if (foldState >= State.Cut) {
            if (isMiddle) style.visibility = "hidden";
            style.transform += `translate${isVertical ? "X" : "Y"}(${isLeft ? "" : "-"}1.25rem) `;
        }

        if (foldState >= State.Fold) {
            if (!isLeft) {
                const styleObj = foldIndex === 0 ? style : wrapperStyle;
                const rotationVector = isVertical ? "0, 1, 0" : "1, 0, 0";
                const xOffset = isVertical ? `calc(${j - index - 0.5} * -2.5rem)` : "0";
                const yOffset = isVertical ? "0" : `calc(${i - index - 1} * -2.5rem)`;

                styleObj.transform += `rotate3d(${rotationVector}, 180deg)`;
                styleObj.transformOrigin = `${xOffset} ${yOffset}`;
            }
        }
    });

    return (
        <div style={wrapperStyle}>
            <div
                className={clsx(
                    "w-10 h-10 center border border-dashed border-stone-900 opacity-50",
                    className
                )}
                style={style}
            >
                {isDot && <div className="w-3 h-3 rounded-full bg-stone-900"></div>}
            </div>
        </div>
    );
}

const State = {
    Highlight: 0,
    Cut: 1,
    Fold: 2,
};

export default function Day13() {
    const { lines, isExample, isPartOne } = useContext(ChallengeContext);

    const groups = splitGroups(lines);
    const dots = groups[0].map((s) => s.split(",").map((s) => parseInt(s)));
    const folds = groups[1].map((s) => {
        const [axis, index] = s.split(" ").at(-1).split("=");
        return { isVertical: axis === "x", index: parseInt(index) };
    });

    let [maxX, maxY] = [maxBy(dots, (d) => d[0])[0], maxBy(dots, (d) => d[1])[1]];

    const [animationState, setAnimationState] = useState(State.Highlight);
    const [foldIndex, setFoldIndex] = useState(0);

    const handlePlay = () => {
        if (animationState === State.Fold) {
            setFoldIndex(foldIndex + 1);
            setAnimationState(State.Highlight);
        } else {
            setAnimationState(animationState + 1);
        }
    };

    const foldsSlice = folds.slice(0, foldIndex + 1);

    const applyFold = (dots, fold) => {
        const ret = new Set();
        dots.forEach(([x, y]) => {
            const isLeft = fold.isVertical ? x < fold.index : y < fold.index;
            if (isLeft) ret.add(`${x},${y}`);
            else {
                if (fold.isVertical) ret.add(`${fold.index - (x - fold.index)},${y}`);
                else ret.add(`${x},${fold.index - (y - fold.index)}`);
            }
        });
        console.log({ maxX, maxY });
        return Array.from(ret.keys()).map((s) => s.split(",").map((s) => parseInt(s)));
    };

    let shownDots = dots;
    if (!isPartOne) {
        let foldedDots = dots;
        folds.forEach((fold) => {
            foldedDots = applyFold(foldedDots, fold);
        });

        shownDots = foldedDots;
        [maxX, maxY] = [maxBy(dots, (d) => d[0])[0], maxBy(dots, (d) => d[1])[1]];
    }

    return (
        <div className="relative h-full center" style={{ perspective: "750px" }}>
            {isExample && isPartOne ? (
                <>
                    <div className="relative flex flex-col">
                        {range(maxY + 1).map((i) => (
                            <div key={i} className="flex">
                                {range(maxX + 1).map((j) => (
                                    <Square
                                        key={j}
                                        i={i}
                                        j={j}
                                        isDot={Boolean(
                                            shownDots.find(([x, y]) => i === y && j === x)
                                        )}
                                        folds={foldsSlice}
                                        animationState={animationState}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <button
                        className="absolute bottom-0 right-0 w-10 h-10 rounded-lg bg-stone-900 center"
                        onClick={handlePlay}
                        disabled={foldIndex > folds.length}
                    >
                        {foldIndex}
                        <PlayIcon className="w-6 h-6" />
                    </button>
                </>
            ) : (
                <Canvas
                    className="w-full h-full"
                    onDraw={(ctx) => {
                        shownDots.forEach(([x, y]) => {
                            ctx.fillRect(100 + x * 10, 100 + y * 10, 10, 10);
                        });
                    }}
                />
            )}
        </div>
    );
}
