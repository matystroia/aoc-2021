import clsx from "clsx";
import { motion } from "framer-motion";
import { forwardRef } from "react";

import { Sphere } from "../../components/shapes/Sphere";
import { RegularPolygon } from "../../components/shapes/RegularPolygon";

export const Pawn = motion(
    forwardRef(function Pawn({ isPlayerTwo, className }, ref) {
        return (
            <div ref={ref} className={clsx("center preserve-3d", className)}>
                <Sphere
                    circleClass={clsx("w-8 h-8", isPlayerTwo ? "bg-cyan-700" : "bg-rose-700")}
                    className="absolute [transform:translate3d(-1rem,-1rem,55px)]"
                />
                <RegularPolygon
                    className="absolute"
                    n={5}
                    angle={95}
                    width={35}
                    height={35}
                    depth={35}
                    topClass={isPlayerTwo ? "bg-cyan-600" : "bg-rose-600"}
                    sideClass={isPlayerTwo ? "bg-cyan-800" : "bg-rose-800"}
                    topBorder={{
                        width: 1,
                        borderClass: isPlayerTwo ? "bg-cyan-800" : "bg-rose-800",
                    }}
                    sideBorder={{
                        width: 1,
                        borderClass: isPlayerTwo ? "bg-cyan-600" : "bg-rose-600",
                    }}
                />
            </div>
        );
    })
);
