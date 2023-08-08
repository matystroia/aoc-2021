"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChallengeNames } from "../input/names";

function DayLink({ day }) {
    const pathname = usePathname();
    const href = `/day/${day}`;
    const isActive = pathname.startsWith(href);
    const name = ChallengeNames[day];

    return (
        <Link
            key={day}
            href={href}
            className={clsx(
                isActive && "bg-slate-500",
                "w-full h-10 py-1 flex items-center border-b border-slate-500 hover:bg-slate-500 relative"
            )}
        >
            <div className="w-10 font-mono text-center shrink-0">{day}</div>
            <div className="overflow-hidden text-xs text-center transition-opacity opacity-0 text-slate-300 text-ellipsis whitespace-nowrap group-hover:opacity-100">
                {name}
            </div>
        </Link>
    );
}

export function Navigation() {
    const days = Array.from({ length: 25 }, (_, i) => i + 1);

    return (
        <nav className="flex flex-col w-10 overflow-x-hidden overflow-y-auto bg-slate-700 hover:w-64 transition-[width] group">
            {days.map((day) => (
                <DayLink key={day} day={day} />
            ))}
            {/* <div className="mt-auto h-14 bg-emerald-500"></div> */}
        </nav>
    );
}
