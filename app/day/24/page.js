"use client";

import { useContext, useState } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import clsx from "clsx";
import { cloneDeep, isEqual, uniqWith } from "lodash";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

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

    // add(other) {
    //     if (typeof this.s === "number" && typeof other.s === "number") {
    //         return new Value(this.s + other.s);
    //     }
    //     return new Value(`(${this.s} + ${other.s})`);
    // }
    // mul(other) {
    //     if (typeof this.s === "number" && typeof other.s === "number") {
    //         return new Value(this.s * other.s);
    //     }
    //     return new Value(`(${this.s} * ${other.s})`);
    // }
    // div(other) {
    //     if (typeof this.s === "number" && typeof other.s === "number") {
    //         return new Value(
    //             Math.floor(Math.abs(this.s / other.s)) * (this.s / other.s < 0 ? -1 : 1)
    //         );
    //     }
    //     return new Value(`(${this.s} / ${other.s})`);
    // }
    // mod(other) {
    //     if (typeof this.s === "number" && typeof other.s === "number") {
    //         return new Value(this.s % other.s);
    //     }
    //     return new Value(`(${this.s} % ${other.s})`);
    // }
    // eql(other) {
    //     if (typeof this.s === "number" && typeof other.s === "number") {
    //         return new Value(Number(this.s === other.s));
    //     }
    //     return new Value(`(${this.s} == ${other.s})`);
    // }

    // toString() {}
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
    // static templates = [];

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

function OperationLine({ op, args }) {
    const operatorName = operatorNames[op];
    return (
        <div className="flex items-center gap-2 px-6 py-2 font-mono border-b-[6px] border-zinc-950 bg-zinc-900">
            <div className="w-12 text-xl font-bold text-zinc-400">{operatorName}</div>
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

export default function Day24() {
    const { lines, isExample } = useContext(ChallengeContext);
    const operations = lines.map((line) => Operation.fromLine(line));

    console.log(operations.map((o) => o.toString()));

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
                        {state.x.toString()}
                    </div>
                </div>
            </details>
            <div className="flex flex-wrap gap-4 p-4 overflow-auto border-2">
                {blocks.map((block, iBlock) => (
                    <div key={iBlock} className="flex flex-col gap-1 border-4 border-zinc-200">
                        {block.map((operation, i) => (
                            <div
                                key={i}
                                className={clsx(
                                    "flex items-center gap-2",
                                    diffLines.includes(i) && "bg-amber-500/50"
                                )}
                            >
                                <div className="w-6 h-6 font-bold center text-zinc-100">
                                    {iBlock * 18 + i === index && "▶"}
                                </div>
                                <OperationLine {...operation} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="z-20 flex justify-between gap-2 basis-14 shrink-0">
                <button
                    onClick={handleNext}
                    className="relative h-full border-2 basis-64 shrink-0 bg-emerald-500 before:absolute before:w-full before:h-full before:bg-emerald-800 before:left-1.5 before:top-1.5 before:-z-10 border-emerald-800"
                >
                    {/* <span className="font-mono text-xl text-emerald-950">{"Run"}</span> */}
                </button>
                <button
                    onClick={() => setIndex(0)}
                    className="relative h-full px-2 border-2 center w-14 bg-emerald-500 before:absolute before:w-full before:h-full before:bg-emerald-800 before:left-1.5 before:top-1.5 before:-z-10 border-emerald-800"
                >
                    <ArrowPathIcon className="w-8 h-8 fill-emerald-800" />
                    {/* <span className="font-mono text-xl text-emerald-950">{"Reset"}</span> */}
                </button>
            </div>
        </div>
    );
}
