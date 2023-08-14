import clsx from "clsx";
import { motion, useMotionValue, useTime, useTransform } from "framer-motion";
import { useRef } from "react";
import { useSize } from "../hooks/useSize";

const layerColors = ["#93c5fd", "#60a5fa", "#3b82f6", "#2563eb"];
const perspective = 1000;

function WaveLayer({ i, width, height, depth, color, baseHeight, xOffset }) {
    const nPoints = 20 - i * 5;

    const heights = [...Array(nPoints).keys()].map((i) => 25);

    const dist = Math.floor(width / (nPoints - 1));
    const path = heights.map((h) => `q ${dist / 4},${h} ${dist / 2},0 t ${dist / 2},0`).join(" ");

    const offset = useTransform(xOffset, (value) => Math.floor(value / width) * -width);
    const y = useTransform(xOffset, (value) => Math.sin(value / 100) * i * 25);

    return (
        <motion.div
            className="absolute bottom-0 flex"
            style={{ width: width * 3, height, x: offset, y, z: -depth }}
        >
            {[-1, 0, 1].map((pos) => (
                <svg key={pos} className="w-full h-full">
                    <path
                        style={{ fill: color }}
                        d={`M 0,${height - baseHeight} ${path} V ${height} H ${-width}`}
                    />
                </svg>
            ))}
        </motion.div>
    );
}

export function Waves({ className, children }) {
    const ref = useRef();
    const { width } = useSize(ref);

    const time = useTime();
    const xOffset = useTransform(time, [0, 1000], [0, 100], { clamp: false });
    const xReverseOffset = useTransform(xOffset, (x) => -x);

    return (
        <div
            ref={ref}
            className={clsx("[perspectiveOrigin:bottom]", className)}
            style={{ perspective }}
        >
            <motion.div
                className="absolute flex justify-center w-full h-full pointer-events-none preserve-3d"
                style={{ x: xOffset }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 3 }}
            >
                {layerColors.map((color, i) => {
                    const depth = i * 200;
                    const waveWidth = ((depth + perspective) * width) / perspective;
                    const baseHeight = 100 + 75 * i;
                    return (
                        <WaveLayer
                            key={i}
                            i={i}
                            width={waveWidth}
                            height={baseHeight + 25}
                            depth={depth}
                            baseHeight={baseHeight}
                            color={color}
                            xOffset={xOffset}
                        />
                    );
                })}
                <motion.div
                    className="absolute bottom-0 pointer-events-auto center"
                    style={{ x: xReverseOffset, zIndex: -100, z: -300 }}
                >
                    {children}
                </motion.div>
            </motion.div>
        </div>
    );
}
