import Link from "next/link";
import { ChallengeConfig } from "../input/names";
import clsx from "clsx";
import { motion } from "framer-motion";
import { forwardRef } from "react";

const importantDays = [8, 11, 12, 16, 17, 19, 21];

function Day({ day, name }) {
    return (
        <Link href={`/day/${day}`} className="preserve-3d">
            <motion.div
                whileHover="open"
                className="relative w-24 h-24 font-mono rounded-sm cursor-pointer bg-slate-950 preserve-3d center"
            >
                <motion.div
                    initial={{ rotateY: -12 }}
                    variants={{ open: { rotateY: -90 } }}
                    className="absolute inset-0 flex items-end p-2 text-2xl origin-left border-2 border-dashed rounded-sm pointer-events-none bg-slate-700 border-slate-500 text-slate-200"
                >
                    {day}
                    {importantDays.includes(parseInt(day)) && (
                        <div className="absolute top-1 right-1 text-[#ffff66] font-mono text-5xl">
                            *
                        </div>
                    )}
                </motion.div>
                <div className="p-4 text-xs text-center">{name}</div>
            </motion.div>
        </Link>
    );
}

export const Calendar = motion(
    forwardRef(function Calendar({ className }, ref) {
        return (
            <div ref={ref} className={clsx("center relative", className)}>
                <div className="flex flex-wrap gap-4 p-8 border-2 border-slate-800 justify-center perspective-[800px] bg-slate-900 relative">
                    {Object.entries(ChallengeConfig).map(([day, { name }]) => (
                        <Day key={day} day={day} name={name} />
                    ))}
                </div>
                <div className="absolute w-full h-full bg-slate-800 -z-20 left-1.5 top-1.5" />
            </div>
        );
    })
);
