import clsx from "clsx";
import { motion } from "framer-motion";
import { forwardRef } from "react";

import { ScannerDot } from "./ScannerDot";

function CubeFace({ className, style }) {
    return (
        <div
            className={clsx("border border-cyan-500 bg-cyan-500/5", className)}
            style={style}
        ></div>
    );
}

export const ScannerCube = motion(
    forwardRef(function ScannerCube({ width, beacons, matchingBeacons, style }, ref) {
        const getCoord = (x) => (x / 2000) * width;

        return (
            <div ref={ref} className="preserve-3d" style={{ width, height: width, ...style }}>
                <CubeFace
                    className="w-full h-full"
                    style={{ transform: `translateZ(${width / 2}px)` }}
                />
                <CubeFace
                    className="absolute inset-0"
                    style={{ transform: `rotateY(90deg) translateZ(${-width / 2}px)` }}
                />
                <CubeFace
                    className="absolute inset-0"
                    style={{ transform: `rotateY(90deg) translateZ(${width / 2}px)` }}
                />
                <CubeFace
                    className="absolute inset-0"
                    style={{ transform: `rotateX(90deg) translateZ(${-width / 2}px)` }}
                />
                <CubeFace
                    className="absolute inset-0"
                    style={{ transform: `rotateX(90deg) translateZ(${width / 2}px)` }}
                />
                <CubeFace
                    className="absolute inset-0"
                    style={{ transform: `translateZ(${-width / 2}px)` }}
                />

                {/* Beacons */}
                <div className="absolute bg-pink-500 left-1/2 top-1/2 preserve-3d">
                    {beacons.map(({ x, y, z }, i) => (
                        <ScannerDot
                            key={i}
                            x={getCoord(x)}
                            y={getCoord(y)}
                            z={getCoord(z)}
                            className={clsx(
                                matchingBeacons.includes(i)
                                    ? "bg-yellow-500 animate-flash"
                                    : "bg-red-500"
                            )}
                        />
                    ))}
                </div>
            </div>
        );
    })
);
