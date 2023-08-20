import { motion } from "framer-motion";
import { forwardRef } from "react";

import { RegularPolygon } from "../../components/shapes/RegularPolygon";

export const RoundButton = motion(
    forwardRef(function RoundButton({ onClick }, ref) {
        return (
            <div ref={ref} className="cursor-pointer preserve-3d" onClick={onClick}>
                <RegularPolygon
                    n={8}
                    width={30}
                    height={30}
                    depth={10}
                    topClass="bg-red-500"
                    sideClass="bg-red-600"
                    topBorder={{ width: 1, borderClass: "bg-red-900" }}
                />
            </div>
        );
    })
);
