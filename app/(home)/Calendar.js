import Link from "next/link";
import { ChallengeNames } from "../input/names";
import clsx from "clsx";
import { motion } from "framer-motion";
import { forwardRef } from "react";

function Day({ day, name }) {
    return (
        <Link href={`/day/${day}`} className="preserve-3d">
            <div className="relative w-24 h-24 font-mono rounded-sm cursor-pointer bg-slate-950 group preserve-3d center">
                <div className="absolute inset-0 flex items-end p-2 text-2xl transition-transform origin-left border-2 border-dashed rounded-sm pointer-events-none bg-slate-700 group-hover:-rotate-y-90 border-slate-500 text-slate-200">
                    {day}
                </div>
                <div className="p-4 text-xs text-center">{name}</div>
            </div>
        </Link>
    );
}

export const Calendar = motion(
    forwardRef(function Calendar({ className }, ref) {
        return (
            <div ref={ref} className={clsx("center relative", className)}>
                <div className="flex flex-wrap gap-4 p-8 border-2 border-slate-800 justify-center perspective-[1200px] bg-slate-900 relative">
                    {Object.entries(ChallengeNames).map(([day, name]) => (
                        <Day key={day} day={day} name={name} />
                    ))}
                </div>
                <div className="absolute w-full h-full bg-slate-800 -z-20 left-1.5 top-1.5" />
            </div>
        );
    })
);
