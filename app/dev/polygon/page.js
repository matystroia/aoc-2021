"use client";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useAnimation } from "framer-motion";
import clsx from "clsx";

import { RegularPolygon } from "../../components/shapes/RegularPolygon";
import { ExtrudedPolygonPath } from "../../components/shapes/ExtrudedPolygonPath";

import { Axes } from "./Axes";

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

    const panX = useMotionValue(0);
    const panY = useMotionValue(0);
    const handlePan = (e, info) => {
        panX.set(panX.get() + info.delta.x);
        panY.set(panY.get() + info.delta.y);
    };

    const controls = useAnimation();
    useEffect(() => {
        controls.start(
            { rotateX: 45, rotateZ: [null, panX.get() + 360] },
            { rotateZ: { type: "tween", ease: "linear", duration: 10, repeat: Infinity } }
        );
    }, [panX, controls]);
    const handlePanStart = () => {
        controls.stop();
    };
    const handlePanEnd = () => {
        controls.start(
            { rotateZ: [null, panX.get() + 360] },
            { type: "tween", ease: "linear", duration: 10, repeat: Infinity }
        );
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
            topBorder: { width: 2, borderClass: "bg-pink-950" },
            sideBorder: { width: 2, borderClass: "bg-pink-950" },
        },
    }[type];

    // const rotationX = useTransform();
    // const rotationZ = useTransform();

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
                    onPanStart={handlePanStart}
                    onPanEnd={handlePanEnd}
                    className="border-4 border-l-0 rounded rounded-l-none bg-zinc-200 border-zinc-300 center perspective-[1000px] col-span-2"
                >
                    <motion.div
                        animate={controls}
                        style={{ rotateX: panY, rotateZ: panX }}
                        className="preserve-3d"
                    >
                        <Component {...props} />
                    </motion.div>
                    <div className="absolute bottom-10 right-16 preserve-3d">
                        {/* <Axes rotationX={rotationX} /> */}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
