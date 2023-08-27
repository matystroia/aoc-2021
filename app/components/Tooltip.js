import clsx from "clsx";

const positionClass = {
    topLeft: "bottom-full right-full rounded-br-none",
    topRight: "bottom-full left-full rounded-bl-none",
    bottomLeft: "top-full right-full rounded-tr-none",
    bottomRight: "top-full left-full rounded-tl-none",
};
export function Tooltip({ description, position, children }) {
    return (
        <div className="relative group">
            {children}
            <div
                className={clsx(
                    "transition-opacity opacity-0 absolute w-32 text-center p-2 font-mono rounded-md bg-slate-950 pointer-events-none group-hover:opacity-100",
                    positionClass[position]
                )}
            >
                {description}
            </div>
        </div>
    );
}
