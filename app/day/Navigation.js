"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/solid";

import { ChallengeConfig } from "../input/config";

function NavLink({ icon, title, href, isActive }) {
    return (
        <Link
            href={href}
            className={clsx(
                isActive && "bg-slate-500",
                "w-full h-10 py-1 flex items-center border-b border-slate-500 hover:bg-slate-500 relative"
            )}
        >
            <div className="w-10 font-mono text-center shrink-0">{icon}</div>
            <div className="overflow-hidden text-xs text-center transition-opacity opacity-0 text-slate-300 text-ellipsis whitespace-nowrap group-hover:opacity-100">
                {title}
            </div>
        </Link>
    );
}

export function Navigation() {
    const pathname = usePathname();
    const days = Array.from({ length: 25 }, (_, i) => i + 1);

    return (
        <nav className="flex flex-col w-10 overflow-x-hidden overflow-y-auto bg-slate-700 hover:w-64 transition-[width] group">
            <NavLink
                icon={<HomeIcon className="inline-block w-5 h-5" />}
                title="Home"
                href="/"
                isActive={false}
            />
            {days.map((day) => {
                const href = `/day/${day}`;
                const isActive = pathname === href;
                const name = ChallengeConfig[day].name;
                return (
                    <NavLink key={day} icon={day} title={name} href={href} isActive={isActive} />
                );
            })}
            {/* <div className="mt-auto h-14 bg-emerald-500"></div> */}
        </nav>
    );
}
