import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import clsx from "clsx";
import { forwardRef, useEffect } from "react";

import { SeaFloorRamp } from "./SeaFloorRamp";

export const SeaFloor = motion(
    forwardRef(function SeaFloor({ depth, height, prevHeight, className, width }, ref) {
        const scale = useMotionValue(1);
        // useEffect(() => {
        //     animate(scale, 1, { type: "tween", ease: "easeInOut", duration: 0.5 });
        // }, [scale]);

        const animatedHeight = useTransform(scale, (x) => x * height);

        const rampSidePath = useTransform(animatedHeight, (h) => {
            if (prevHeight < h) return `polygon(0 ${h - prevHeight}px, 100% 0, 100% 100%, 0 100%)`;
            else return `polygon(0 0, 100% ${prevHeight - h}px, 100% 100%, 0 100%)`;
        });

        return (
            <div ref={ref} className={clsx("preserve-3d", className)}>
                <motion.div
                    className="h-32 center bg-emerald-500 preserve-3d"
                    style={{ width, z: animatedHeight }}
                >
                    {prevHeight && (
                        <SeaFloorRamp
                            from={prevHeight}
                            to={height}
                            toAnimated={animatedHeight}
                            gap={width}
                        />
                    )}

                    <motion.div
                        className="absolute flex flex-col items-center w-full font-mono origin-top bg-emerald-600 top-full -rotate-x-90"
                        style={{ height: animatedHeight }}
                    >
                        <div className="p-5">{depth}</div>
                    </motion.div>
                </motion.div>

                {/* Ramp Side */}
                {prevHeight && (
                    <motion.div
                        className="absolute bottom-0 origin-bottom bg-emerald-500 right-full"
                        style={{
                            width,
                            clipPath: rampSidePath,
                            transform: "rotateX(-90deg)",
                            height: Math.max(prevHeight, height),
                        }}
                    />
                )}
            </div>
        );
    })
);
