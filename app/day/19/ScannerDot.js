import clsx from "clsx";

export function ScannerDot({ x, y, z, className }) {
    return (
        <div
            className="absolute w-1 h-1 preserve-3d"
            style={{ transform: `translate3d(${x}px, ${y}px, ${z}px)` }}
        >
            <div className={clsx("absolute inset-0 rounded-full", className)} />
            <div className={clsx("absolute inset-0 rounded-full rotate-y-90", className)} />
        </div>
    );
}
