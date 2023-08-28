"use client";

import { useContext, useState } from "react";
import clsx from "clsx";
import { cloneDeep, isEqual, uniqWith } from "lodash";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

import { ChallengeContext } from "../ChallengeWrapper";

const Operator = {
    INPUT: 0,
    ADD: 1,
    MUL: 2,
    DIV: 3,
    MOD: 4,
    EQL: 5,
};

const operatorSymbols = [null, "+", "*", "/", "%", "=="];
class Value {
    constructor() {}
}

class LiteralValue extends Value {
    constructor(value) {
        super();
        this.value = value;
    }

    toString() {
        return this.value.toString();
    }
}

class VariableValue extends Value {
    constructor(varIndex) {
        super();
        this.varIndex = varIndex;
    }

    toString() {
        return `x${this.varIndex}`;
    }
}

const Type = {
    VariableVariable: 0,
    VariableLiteral: 1,
    OperationLiteral: 2,
};

class OperationValue extends Value {
    constructor(op, arg1, arg2) {
        super();
        this.op = op;
        this.arg1 = arg1;
        this.arg2 = arg2;
    }

    static oneVar(op, arg1, arg2) {
        return [arg1, arg2].filter((x) => x instanceof VariableValue).length === 1;
    }

    static templates = [
        // x not in 1-9
        {
            condition: ({ type, op, literalArg }) =>
                type === Type.VariableLiteral &&
                op === Operator.EQL &&
                (literalArg < 1 || literalArg > 9),
            result: () => new LiteralValue(0),
        },

        // x + 0
        {
            condition: ({ type, op, literalArg }) =>
                type === Type.VariableLiteral && op === Operator.ADD && literalArg === 0,
            result: ({ varArg }) => varArg,
        },

        // x * 1
        {
            condition: ({ type, op, literalArg }) =>
                type === Type.VariableLiteral && op === Operator.MUL && literalArg === 1,
            result: ({ varArg }) => varArg,
        },

        // x * 0
        {
            condition: ({ type, op, literalArg }) =>
                type === Type.VariableLiteral && op === Operator.MUL && literalArg === 0,
            result: () => new LiteralValue(0),
        },

        // x / 1
        {
            condition: ({ op, arg1, arg2 }) =>
                op === Operator.DIV &&
                arg1 instanceof VariableValue &&
                arg2 instanceof LiteralValue &&
                arg2.value === 1,
            result: ({ arg1 }) => arg1,
        },

        // x % (>= 10)
        {
            condition: ({ op, arg1, arg2 }) =>
                op === Operator.MOD &&
                arg1 instanceof VariableValue &&
                arg2 instanceof LiteralValue &&
                arg2.value >= 10,
            result: ({ arg1 }) => arg1,
        },

        // ? * 0
        {
            condition: ({ type, op, literalArg }) =>
                type === Type.OperationLiteral && op === Operation.MUL && literalArg === 0,
            result: () => new LiteralValue(0),
        },
    ];

    static run(op, arg1, arg2) {
        if (arg1 instanceof LiteralValue && arg2 instanceof LiteralValue) {
            switch (op) {
                case Operator.ADD:
                    return new LiteralValue(arg1.value + arg2.value);
                case Operator.MUL:
                    return new LiteralValue(arg1.value * arg2.value);
                case Operator.DIV:
                    return new LiteralValue(arg1.value / arg2.value);
                case Operator.MOD:
                    return new LiteralValue(arg1.value % arg2.value);
                case Operator.EQL:
                    return new LiteralValue(Number(arg1.value === arg2.value));
            }
        }

        // Prepare template args
        let type, varArg, literalArg;
        if (arg1 instanceof VariableValue && arg2 instanceof VariableValue) {
            type = Type.VariableVariable;
        } else if (arg1 instanceof VariableValue && arg2 instanceof LiteralValue) {
            type = Type.VariableLiteral;
            varArg = arg1;
            literalArg = arg2.value;
        } else if (arg1 instanceof LiteralValue && arg2 instanceof VariableValue) {
            type = Type.VariableLiteral;
            varArg = arg2;
            literalArg = arg1.value;
        } else if (arg1 instanceof OperationValue && arg2 instanceof LiteralValue) {
            type = Type.OperationLiteral;
            literalArg = arg2.value;
        } else if (arg1 instanceof LiteralValue && arg2 instanceof OperationValue) {
            type = Type.OperationLiteral;
            literalArg = arg1.value;
        }

        const templateArgs = { type, varArg, literalArg, op, arg1, arg2 };

        // Check templates
        for (const { condition, result } of OperationValue.templates) {
            if (condition(templateArgs)) return result(templateArgs);
        }

        return new OperationValue(op, arg1, arg2);
    }

    toString() {
        return `(${this.arg1} ${operatorSymbols[this.op]} ${this.arg2})`;
    }
}

class State {
    constructor() {
        this.x = new LiteralValue(0);
        this.y = new LiteralValue(0);
        this.z = new LiteralValue(0);
        this.w = new LiteralValue(0);
        this.varIndex = 0;
    }

    var() {
        return new VariableValue(this.varIndex++);
    }
}

class Operation {
    constructor(op, ...args) {
        this.op = op;
        this.args = args;

        this.reg = args[0];
        this.arg = args.length === 2 ? args[1] : null;
    }

    run(state) {
        if (this.op === Operator.INPUT) {
            state[this.reg] = state.var();
            return;
        }

        let argValue;
        if (typeof this.arg === "string") argValue = state[this.arg];
        else argValue = new LiteralValue(this.arg);

        state[this.reg] = OperationValue.run(this.op, state[this.reg], argValue);
    }

    static fromLine(line) {
        const values = line.split(" ");
        const op = {
            inp: Operator.INPUT,
            add: Operator.ADD,
            mul: Operator.MUL,
            div: Operator.DIV,
            mod: Operator.MOD,
            eql: Operator.EQL,
        }[values[0]];

        const args = values.slice(1);
        if (args.length === 2) args[1] = isNaN(parseInt(args[1])) ? args[1] : parseInt(args[1]);
        return new Operation(op, ...args);
    }

    toString() {
        return `${operatorNames[this.op]} ${this.reg} ${this.arg}`;
    }
}

const isRegister = (value) => typeof value === "string";
const operatorNames = ["INP", "ADD", "MUL", "DIV", "MOD", "EQL"];
const registerClass = {
    x: "bg-red-500 border-red-700",
    y: "bg-green-500 border-green-700",
    z: "bg-blue-500 border-blue-700",
    w: "bg-pink-500 border-pink-700",
};

function OperationLine({ op, args, className }) {
    const operatorName = operatorNames[op];
    return (
        <div
            className={clsx(
                "flex items-center gap-2 px-6 py-2 font-mono border-b-[6px]",
                className
            )}
        >
            <div className="w-12 text-xl font-bold text-zinc-50">{operatorName}</div>
            {args.map((arg, i) => (
                <div
                    className={clsx(
                        "h-8 relative px-3 border-b-4",
                        isRegister(arg) ? registerClass[arg] : "bg-zinc-500 border-zinc-700"
                    )}
                    key={i}
                >
                    {arg}
                </div>
            ))}
        </div>
    );
}

const a = [10, 12, 13, 13, 14, -2, 11, -15, -10, 10, -10, -4, -1, -1];
const b = [0, 6, 4, 2, 9, 1, 10, 6, 4, 6, 3, 9, 15, 5];
function bt(digits, i, z) {
    if (i === 14) {
        if (z === 0) console.log(digits);
        return;
    }

    if (a[i] < 0) {
        const digit = (z % 26) + a[i];
        if (digit >= 1 && digit <= 9) {
            bt(digits.concat(digit), i + 1, Math.floor(z / 26));
        }
    } else {
        for (const digit of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
            bt(digits.concat(digit), i + 1, z * 26 + digit + b[i]);
        }
    }
}

export default function Day24() {
    const { lines, isExample } = useContext(ChallengeContext);
    const operations = lines.map((line) => Operation.fromLine(line));

    let blocks;
    if (isExample) blocks = [operations];
    else {
        blocks = [...Array(operations.length / 18).keys()].map((i) =>
            operations.slice(i * 18, i * 18 + 18)
        );
    }

    const diffLines = [...Array(18).keys()].filter((i) => {
        return (
            uniqWith(
                blocks.map((b) => b[i]),
                isEqual
            ).length > 1
        );

        // const firstBlockOperation = blocks[0][i];
        // for (let iBlock = 0; iBlock < blocks.length; iBlock++) {
        //     if (!isEqual(blocks[iBlock][i], firstBlockOperation)) return true;
        // }
    });

    const [index, setIndex] = useState(0);
    const [state, setState] = useState(new State());

    const handleNext = () => {
        const newState = cloneDeep(state);
        operations[index].run(newState);
        setIndex(index + 1);
        setState(newState);
    };

    return (
        <div className="relative flex flex-col h-full gap-4">
            <details className="p-4 font-mono bg-zinc-900">
                <summary>Registers</summary>
                <div className="flex flex-col gap-2 p-2 font-mono">
                    <div className="flex items-center gap-4">
                        <div className={clsx(registerClass.x, "border-b-4 w-8 center")}>x</div>
                        {state.x.toString()}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={clsx(registerClass.y, "border-b-4 w-8 center")}>y</div>
                        {state.y.toString()}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={clsx(registerClass.z, "border-b-4 w-8 center")}>z</div>
                        {state.z.toString()}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={clsx(registerClass.w, "border-b-4 w-8 center")}>w</div>
                        {state.w.toString()}
                    </div>
                </div>
            </details>
            <div className="flex flex-wrap gap-4 p-4 overflow-auto border-2 rounded-lg border-zinc-500">
                {blocks.map((block, iBlock) => (
                    <div
                        key={iBlock}
                        className="flex flex-col gap-1 border rounded-lg border-zinc-600"
                    >
                        {block.map((operation, i) => (
                            <div key={i} className={clsx("flex items-center gap-2")}>
                                <div className="w-6 h-6 font-bold center text-zinc-100">
                                    {iBlock * 18 + i === index && "▶"}
                                </div>
                                <OperationLine
                                    {...operation}
                                    className={clsx(
                                        diffLines.includes(i)
                                            ? "bg-orange-400 border-orange-600"
                                            : "bg-zinc-900 border-zinc-950"
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="z-20 flex gap-2 basis-14 shrink-0">
                <button
                    onClick={() => setIndex(0)}
                    className="relative h-full px-2 border-b-8 center w-14 bg-emerald-500 border-emerald-800"
                >
                    <ArrowPathIcon className="w-8 h-8 fill-emerald-800" />
                </button>
                <button
                    onClick={handleNext}
                    className="relative h-full border-b-8 basis-48 shrink-0 bg-emerald-500 border-emerald-800"
                >
                    <span className="font-mono text-xl text-emerald-800">NEXT</span>
                </button>
            </div>
        </div>
    );
}
