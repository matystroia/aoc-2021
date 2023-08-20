import clsx from "clsx";
import { motion } from "framer-motion";
import { forwardRef } from "react";

import { ExtrudedPolygonPath } from "../../components/shapes/ExtrudedPolygonPath";

function Half({ className, children }) {
    return (
        <ExtrudedPolygonPath
            className={className}
            path={[
                { x: 0, y: 0 },
                { x: "100%", y: 0 },
                { x: "100%", y: "100%" },
                { x: 0, y: "100%" },
            ]}
            width={25}
            height={25}
            depth={20}
            sideClass="bg-red-600"
            topBorder={{ width: 1, borderClass: "bg-red-900" }}
        >
            <div className="w-full h-full bg-red-500 center">{children}</div>
        </ExtrudedPolygonPath>
    );
}

export const RockerSwitch = motion(
    forwardRef(function RockerSwitch({ onClick, className, style }, ref) {
        return (
            <div
                ref={ref}
                className={clsx("flex flex-col preserve-3d cursor-pointer", className)}
                style={style}
                onClick={onClick}
            >
                <Half className="-rotate-x-[10]">
                    <div className="w-[2px] bg-red-400 h-[8px]" />
                </Half>
                <Half className="rotate-x-[10]">
                    <div className="w-[10px] border-red-400 rounded-full border-[2px] h-[10px]" />
                </Half>
            </div>
        );
    })
);
