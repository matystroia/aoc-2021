import { ArrowPathIcon, ForwardIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

function DieIcon({ className }) {
    return (
        <div className={clsx("flex flex-wrap gap-1 bg-zinc-300 center rounded-md", className)}>
            <div className="w-1 h-1 rounded-full bg-zinc-950" />
        </div>
    );
}

export function Buttons({ onReset, onDice, onSkip, isSkipping }) {
    return (
        <div className="flex justify-around h-full bg-zinc-800">
            <button className="flex-grow center" onClick={onReset}>
                <ArrowPathIcon className="w-5 h-5" />
            </button>
            <button className="flex-grow border-x-2 center border-zinc-900" onClick={onDice}>
                <DieIcon className="w-5 h-5" />
            </button>
            <button
                className={clsx("flex-grow center rounded-br-lg", isSkipping && "bg-indigo-500")}
                onClick={onSkip}
            >
                <ForwardIcon className={clsx("w-5 h-5", isSkipping && "fill-indigo-300")} />
            </button>
        </div>
    );
}
