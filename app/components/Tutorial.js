import { CursorArrowRaysIcon } from "@heroicons/react/24/solid";

export function Tutorial({ children }) {
    return (
        <div className="relative px-4 border-2 rounded-md border-slate-800 bg-slate-900">
            {children}
            <CursorArrowRaysIcon className="absolute w-8 h-8 -top-4" />
        </div>
    );
}
