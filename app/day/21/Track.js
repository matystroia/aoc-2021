import clsx from "clsx";
import { range } from "lodash";

import { Box } from "../../components/shapes/Box";

export const coords = (i) => [
    Math.cos(((2 * Math.PI) / 10) * i) * 150,
    Math.sin(((2 * Math.PI) / 10) * i) * 150,
];

export function Track({ positionOne, positionTwo }) {
    return (
        <div className="-translate-z-[20px] preserve-3d">
            <Box depth={20} sideClass="bg-zinc-800" borderWidth={1} borderClass="bg-zinc-900">
                <div className="w-[400px] h-[400px] center bg-zinc-900">
                    {range(10).map((i) => {
                        const [x, y] = coords(i);

                        let circleClass;
                        if (i === positionOne && i === positionTwo)
                            circleClass =
                                "bg-gradient-to-r from-cyan-600 from-50% to-rose-600 to-50%";
                        else if (i === positionOne) circleClass = "bg-rose-600";
                        else if (i === positionTwo) circleClass = "bg-cyan-600";
                        else circleClass = "bg-zinc-600";

                        return (
                            <div
                                key={i}
                                className={clsx(
                                    "absolute w-16 h-16 rounded-full center font-mono text-zinc-800",
                                    circleClass
                                )}
                                style={{
                                    transform: `translate(${x}px, ${y}px)`,
                                }}
                            >
                                {i + 1}
                            </div>
                        );
                    })}
                </div>
            </Box>
        </div>
    );
}
