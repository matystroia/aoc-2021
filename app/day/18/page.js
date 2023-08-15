"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { cloneDeep, isFinite, maxBy } from "lodash";
import { product } from "app/utils";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useImmer } from "use-immer";

class Snailfish {
    constructor(parent, value = null) {
        this.parent = parent;
        this.value = value;
    }

    level() {
        if (this.parent === null) return 0;
        return this.parent.level() + 1;
    }

    before() {
        if (!this.parent) return null;
        if (this === this.parent.left) {
            return this.parent.before()?.last();
        } else {
            return this.parent.left.last();
        }
    }

    after() {
        if (!this.parent) return null;
        if (this === this.parent.right) {
            return this.parent.after()?.first();
        } else {
            return this.parent.right.first();
        }
    }

    first() {
        if (this.value !== null) return this;
        return this.left.first();
    }

    last() {
        if (this.value !== null) return this;
        return this.right.last();
    }

    findNested() {
        if (this.value !== null) return null;
        if (this.level() >= 4) return this;

        let ret;
        ret = this.left.findNested();
        if (ret) return ret;
        ret = this.right.findNested();
        if (ret) return ret;

        return null;
    }

    findGreater() {
        if (this.value !== null && this.value >= 10) return this;
        if (this.value !== null) return null;

        let ret;
        ret = this.left.findGreater();
        if (ret) return ret;
        ret = this.right.findGreater();
        if (ret) return ret;

        return null;
    }

    magnitude() {
        if (this.value !== null) return this.value;
        return 3 * this.left.magnitude() + 2 * this.right.magnitude();
    }

    toString() {
        if (this.value !== null) return this.value;
        return `[${this.left},${this.right}]`;
    }
}

function parseLine(line, parent = null) {
    const generator = (function* () {
        yield* line;
    })();

    const char = generator.next().value;
    if (isFinite(parseInt(char))) return new Snailfish(parent, parseInt(char));

    const ret = new Snailfish(parent);
    [ret.left, {}, ret.right] = [
        parseLine(generator, ret),
        generator.next(),
        parseLine(generator, ret),
        generator.next(),
    ];

    return ret;
}

function explode(number) {
    const nested = number.findNested();
    if (nested) {
        const before = nested.before();
        if (before) before.value += nested.left.value;

        const after = nested.after();
        if (after) after.value += nested.right.value;

        nested.left = null;
        nested.right = null;
        nested.value = 0;
        return true;
    }
    return false;
}

function split(number) {
    const greater = number.findGreater();
    if (greater) {
        greater.left = new Snailfish(greater, Math.floor(greater.value / 2));
        greater.right = new Snailfish(greater, Math.ceil(greater.value / 2));
        greater.value = null;
        return true;
    }
    return false;
}

function add(first, second) {
    const [a, b] = [cloneDeep(first), cloneDeep(second)];
    const ret = [];

    let tentative = new Snailfish(null);
    [a.parent, b.parent] = [tentative, tentative];
    [tentative.left, tentative.right] = [a, b];

    while (true) {
        ret.push(tentative);
        tentative = cloneDeep(tentative);
        if (explode(tentative)) continue;
        if (split(tentative)) continue;
        break;
    }

    return ret;
}

function RegularNumber({ value }) {
    return (
        <span className={clsx("font-mono text-sky-100", value >= 10 && "bg-amber-700 rounded-sm")}>
            {value}
        </span>
    );
}

function SnailfishNumber({ index, number, onAdd }) {
    if (number.value !== null) return <RegularNumber value={number.value} />;
    const level = number.level();

    const handleDragStart = (e) => {
        e.dataTransfer.dropEffect = "copy";
        e.dataTransfer.setData("numberIndex", index);
    };

    const handleDrop = (e) => {
        const otherIndex = parseInt(e.dataTransfer.getData("numberIndex"));
        onAdd(otherIndex);
    };

    return (
        <div
            className={clsx(
                "flex justify-center items-center gap-1 drop-shadow-xl cursor-pointer select-none",
                level === 0 &&
                    "bg-zinc-900 rounded-md border border-zinc-800 p-2 transition-transform hover:scale-105",
                level > 0 && "pointer-events-none mb-2",
                level === 4 && "bg-zinc-700 rounded-md"
            )}
            draggable={onAdd !== undefined}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <span className="text-zinc-500">{"["}</span>
            <SnailfishNumber number={number.left} />
            <span className="text-zinc-500">{","}</span>
            <SnailfishNumber number={number.right} />
            <span className="text-zinc-500">{"]"}</span>
        </div>
    );
}

function Addition({ a, b, onClose }) {
    const tentativeResults = add(a, b);
    const [index, setIndex] = useState(0);

    const handleClick = () => {
        if (index < tentativeResults.length - 1) setIndex(index + 1);
    };

    return (
        <div className="flex flex-col gap-2">
            <button className="self-end text-zinc-700" onClick={onClose}>
                <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-stretch gap-2 p-2">
                <SnailfishNumber number={a} />
                <span className="self-center text-2xl text-yellow-400">+</span>
                <SnailfishNumber number={b} />
                <hr className="my-4 border-2 border-yellow-400" />
                <div onClick={handleClick}>
                    <SnailfishNumber number={tentativeResults[index]} />
                </div>
            </div>
        </div>
    );
}

export default function Day18() {
    const { lines } = useContext(ChallengeContext);

    const [numbers, updateNumbers] = useImmer(lines.map((s) => parseLine(s)));

    const [numberIndex, setNumberIndex] = useState(null);
    const [otherIndex, setOtherIndex] = useState(null);
    const handleAdd = (index, otherIndex) => {
        setNumberIndex(index);
        setOtherIndex(otherIndex);
        ref.current.showModal();
    };

    const handleClose = () => {
        ref.current.close();
        if (numberIndex === null) return;

        updateNumbers((draft) => {
            const result = add(numbers[numberIndex], numbers[otherIndex]).at(-1);
            draft[numberIndex] = result;
            draft.splice(otherIndex, 1);
        });

        setNumberIndex(null);
        setOtherIndex(null);
    };

    const ref = useRef();

    return (
        <div className="h-full center">
            <div className="flex flex-col items-stretch gap-4 p-6 overflow-auto border rounded-lg max-h-1/2 border-zinc-600 bg-zinc-700 drop-shadow-xl">
                {numbers.map((number, i) => (
                    <SnailfishNumber
                        key={i}
                        index={i}
                        number={number}
                        onAdd={(otherIndex) => handleAdd(otherIndex, i)}
                    />
                ))}
            </div>
            <dialog
                ref={ref}
                className="rounded-lg bg-zinc-950 backdrop:bg-zinc-900/50 backdrop:backdrop-blur"
                onClose={handleClose}
            >
                {numberIndex !== null && (
                    <Addition
                        a={numbers[numberIndex]}
                        b={numbers[otherIndex]}
                        onClose={handleClose}
                    />
                )}
            </dialog>
        </div>
    );
}
