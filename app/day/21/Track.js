import clsx from "clsx";
import { range } from "lodash";

import { coords } from "./page";

export function Track({ positionOne, positionTwo }) {
    return (
        <div className="w-[400px] h-[400px] center bg-zinc-900 rounded-2xl">
            {range(10).map((i) => {
                const [x, y] = coords(i);

                let circleClass;
                if (i === positionOne && i === positionTwo)
                    circleClass = "bg-gradient-to-r from-cyan-600 from-50% to-rose-600 to-50%";
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
    );
}
