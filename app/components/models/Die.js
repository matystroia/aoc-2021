import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useState, forwardRef } from "react";

function Dot({ className }) {
    return <div className={clsx("w-3 h-3 bg-zinc-900 rounded-full", className)} />;
}

function DieFace({ className, children }) {
    return (
        <motion.div
            variants={{ invisible: { opacity: 0 }, visible: { opacity: 1 } }}
            className="w-16 h-16 font-mono text-xl bg-zinc-300 text-zinc-900"
        >
            <div
                className={clsx(
                    "relative w-full h-full center border-4 bg-zinc-200 border-zinc-300 rounded-xl p-3",
                    className
                )}
            >
                <motion.div
                    variants={{ valueShown: { opacity: 0 } }}
                    className="absolute inset-0 bg-zinc-200 center"
                >
                    ???
                </motion.div>
                {children}
            </div>
        </motion.div>
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

export const CustomDie = motion(
    forwardRef(function CustomDie({ value }, ref) {
        return (
            <div ref={ref} className={clsx("absolute preserve-3d origin-[50%_50%_-32px]")}>
                <DieFace>{value}</DieFace>
                <div className="absolute inset-0 origin-top [transform:rotateX(-90deg)]">
                    <DieFace></DieFace>
                </div>
                <div className="absolute inset-0 origin-bottom [transform:rotateX(90deg)]">
                    <DieFace></DieFace>
                </div>
                <div className="absolute inset-0 origin-left [transform:rotateY(90deg)]">
                    <DieFace></DieFace>
                </div>
                <div className="absolute inset-0 origin-right [transform:rotateY(-90deg)]">
                    <DieFace></DieFace>
                </div>
                <div className="absolute inset-0 [transform:translateZ(-64px)]">
                    <DieFace></DieFace>
                </div>
            </div>
        );
    })
);
