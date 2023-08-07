"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

function DayLink({ day }) {
    const pathname = usePathname();
    const href = `/day/${day}`;
    const isActive = pathname.startsWith(href);

    return (
        <Link
            key={day}
            href={href}
            className={clsx(
                isActive && "text-slate-300",
                "p-2 text-center border-b border-slate-600 hover:bg-slate-400"
            )}
        >
            {day}
        </Link>
    );
}

export function Navigation() {
    const days = Array.from({ length: 25 }, (_, i) => i + 1);

    return (
        <nav className="flex flex-col bg-slate-700 w-14">
            {days.map((day) => (
                <DayLink key={day} day={day} />
            ))}
            <div className="h-14 mt-auto bg-emerald-500"></div>
        </nav>
    );
}
