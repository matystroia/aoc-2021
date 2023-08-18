"use client";
import { useState } from "react";
import { motion, useMotionValue } from "framer-motion";

import { RegularPolygon } from "../../components/shapes/RegularPolygon";
import { ExtrudedPolygonPath } from "../../components/shapes/ExtrudedPolygonPath";
import clsx from "clsx";

function PolygonProp({ display, name, value, onChange, type }) {
    const handleChange = (e) => onChange(name, e.target.value);
    return (
        <div className="flex items-center">
            <dt>{display}</dt>
            <dd className="ml-auto font-mono">
                <input
                    type={type}
                    className={clsx(
                        "rounded bg-zinc-800 text-center basic",
                        type === "string" ? "w-36" : "w-16"
                    )}
                    value={value}
                    onChange={handleChange}
                />
            </dd>
        </div>
    );
}

function PolygonProps({ props, onChange }) {
    return (
        <>
            <PolygonProp
                type="number"
                display="Width"
                name="width"
                value={props.width}
                onChange={onChange}
            />
            <PolygonProp
                type="number"
                display="Height"
                name="height"
                value={props.height}
                onChange={onChange}
            />
            <PolygonProp
                type="number"
                display="Depth"
                name="depth"
                value={props.depth}
                onChange={onChange}
            />
            <PolygonProp
                type="number"
                display="Angle"
                name="angle"
                value={props.angle}
                onChange={onChange}
            />
            <PolygonProp
                display="Top Face"
                name="topClass"
                type="string"
                value={props.topClass}
                onChange={onChange}
            />
        </>
    );
}

export default function PolygonKitchenSink() {
    const [type, setType] = useState("regular");

    const offsetX = useMotionValue(0);
    const offsetY = useMotionValue(0);
    const handlePan = (e, info) => {
        offsetX.set(info.offset.x);
        offsetY.set(info.offset.y);
    };

    const Component = { regular: RegularPolygon, path: ExtrudedPolygonPath }[type];
    const defaultProps = {
        regular: {
            n: 4,
            width: 250,
            height: 250,
            depth: 100,
            angle: 90,
            topClass: "bg-pink-500",
            sideClass: "bg-pink-600",
        },
    }[type];

    const [props, setProps] = useState(defaultProps);

    const handleChange = (name, value) => {
        setProps({ ...props, [name]: value });
    };
    const handleReset = () => {
        setProps(defaultProps);
    };

    return (
        <div className="w-full h-full center">
            <div className="grid w-full max-w-5xl grid-cols-3 h-96 drop-shadow-xl">
                <div className="flex flex-col p-10 border-4 border-r-0 rounded rounded-r-none bg-zinc-900 border-zinc-950">
                    <dl className="flex flex-col gap-4 overflow-auto">
                        <div className="flex items-center">
                            <dt>Component</dt>
                            <dd className="ml-auto">
                                <select
                                    value={type}
                                    className="p-2 font-mono bg-zinc-950"
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="regular">RegularPolygon</option>
                                    <option value="path">PathPolygon</option>
                                </select>
                            </dd>
                        </div>
                        <PolygonProps props={props} onChange={handleChange} />
                    </dl>
                    <button className="py-1 mt-auto bg-zinc-800" onClick={handleReset}>
                        Reset
                    </button>
                </div>
                <motion.div
                    onPan={handlePan}
                    className="border-4 border-l-0 rounded rounded-l-none bg-zinc-200 border-zinc-300 center perspective-[1000px] col-span-2"
                >
                    <motion.div
                        animate={{ rotateX: 45, rotateZ: [0, 360] }}
                        style={{ rotateX: offsetY, rotateZ: offsetX }}
                        transition={{
                            rotateZ: {
                                repeat: Infinity,
                                type: "tween",
                                ease: "linear",
                                duration: 10,
                            },
                        }}
                        className="preserve-3d"
                    >
                        <Component {...props} />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
