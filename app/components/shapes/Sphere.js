import clsx from "clsx";

export function Sphere({ circleClass, className }) {
    return (
        <div className={clsx("preserve-3d", className)}>
            {["X", "Y", "Z"].map((axis) => (
                <>
                    {[0, 30, 60, 90, 120, 150].map((angle) => (
                        <div
                            key={angle}
                            className={clsx("absolute rounded-full", circleClass)}
                            style={{ transform: `rotate${axis}(${angle}deg)` }}
                        ></div>
                    ))}
                </>
            ))}
        </div>
    );
}
