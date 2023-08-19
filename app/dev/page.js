"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Die } from "../components/models/Die";
import { usePhysics } from "../hooks/usePhysics";
import { Cube } from "../components/shapes/Cube";
import { ExtrudedPolygonPath } from "../components/shapes/ExtrudedPolygonPath";
import { RegularPolygon } from "../components/shapes/RegularPolygon";

export default function Dev() {
    return (
        <div className="bg-orange-200 h-screen w-screen center [perspective:800px] relative">
            <motion.div
                className="preserve-3d"
                animate={{ rotateX: 45, rotateZ: [0, 360] }}
                transition={{
                    rotateZ: { repeat: Infinity, type: "tween", duration: 15, ease: "linear" },
                }}
            ></motion.div>
            <div className="flex flex-wrap w-full h-full gap-8 center">
                <Link href="dev/nintendo-ds">
                    <div className="flex flex-col justify-end w-64 h-64 p-4 text-lg font-bold text-right text-orange-900 bg-orange-300 border-4">
                        Nintendo DS
                    </div>
                </Link>
                <Link href="dev/computer">
                    <div className="flex flex-col justify-end w-64 h-64 p-4 text-lg font-bold text-right text-orange-900 bg-orange-300 border-4">
                        Computer
                    </div>
                </Link>
                <Link href="dev/hills">
                    <div className="flex flex-col justify-end w-64 h-64 p-4 text-lg font-bold text-right text-orange-900 bg-orange-300 border-4">
                        Hills
                    </div>
                </Link>
                <Link href="dev/polygon">
                    <div className="flex flex-col justify-end w-64 h-64 p-4 text-lg font-bold text-right text-orange-900 bg-orange-300 border-4">
                        Polygons
                    </div>
                </Link>
            </div>
        </div>
    );
}
