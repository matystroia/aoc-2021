import clsx from "clsx";
import { useEffect, useState } from "react";

function Dot({ className }) {
    return <div className={clsx("w-3 h-3 bg-zinc-900 rounded-full", className)} />;
}

function DieFace({ className, children }) {
    return (
        <div className="w-[100px] h-[100px] bg-zinc-300 font-mono text-zinc-900 text-2xl">
            <div
                className={clsx(
                    "w-full h-full center border-4 bg-zinc-200 border-zinc-300 rounded-xl p-3",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}

export function Die() {
    return (
        <div className="relative preserve-3d">
            <DieFace className="flex-wrap gap-4">
                <Dot />
                <Dot />
                <Dot />
                <Dot />
                <Dot />
                <Dot />
            </DieFace>
            <div className="absolute inset-0 origin-top [transform:rotateX(-90deg)]">
                <DieFace className="flex gap-4">
                    <Dot className="self-start" />
                    <Dot />
                    <Dot className="self-end" />
                </DieFace>
            </div>
            <div className="absolute inset-0 origin-bottom [transform:rotateX(90deg)]">
                <DieFace className="flex-wrap gap-8">
                    <Dot />
                    <Dot />
                    <Dot />
                    <Dot />
                </DieFace>
            </div>
            <div className="absolute inset-0 origin-left [transform:rotateY(90deg)]">
                <DieFace className="flex gap-8">
                    <Dot className="self-start" />
                    <Dot className="self-end" />
                </DieFace>
            </div>
            <div className="absolute inset-0 origin-right [transform:rotateY(-90deg)]">
                <DieFace className="flex flex-col">
                    <div className="flex gap-6">
                        <Dot />
                        <Dot />
                    </div>
                    <Dot className="m-4" />
                    <div className="flex gap-6">
                        <Dot />
                        <Dot />
                    </div>
                </DieFace>
            </div>
            <div className="absolute inset-0 [transform:translateZ(-100px)]">
                <DieFace className="">
                    <Dot />
                </DieFace>
            </div>
        </div>
    );
}

export function CustomDie({ delay, value }) {
    const [shownValue, setShownValue] = useState(value);
    const [isSpinning, setIsSpinning] = useState(false);

    useEffect(() => {
        setIsSpinning(true);
        const handle = setTimeout(() => {
            setShownValue(value);
            setIsSpinning(false);
        }, delay * 1000);

        return () => {
            setShownValue(value);
            setIsSpinning(false);
            clearTimeout(handle);
        };
    }, [delay, value]);

    return (
        <div
            className={clsx(
                "relative preserve-3d origin-[50%_50%_-50px]",
                isSpinning && "animate-spin-die"
            )}
            style={{ transform: `` }}
        >
            <DieFace>{isSpinning ? "?" : shownValue}</DieFace>
            <div className="absolute inset-0 origin-top [transform:rotateX(-90deg)]">
                <DieFace>{isSpinning && "?"}</DieFace>
            </div>
            <div className="absolute inset-0 origin-bottom [transform:rotateX(90deg)]">
                <DieFace>{isSpinning && "?"}</DieFace>
            </div>
            <div className="absolute inset-0 origin-left [transform:rotateY(90deg)]">
                <DieFace></DieFace>
            </div>
            <div className="absolute inset-0 origin-right [transform:rotateY(-90deg)]">
                <DieFace></DieFace>
            </div>
            <div className="absolute inset-0 [transform:translateZ(-100px)]">
                <DieFace>{isSpinning && "?"}</DieFace>
            </div>
        </div>
    );
}
