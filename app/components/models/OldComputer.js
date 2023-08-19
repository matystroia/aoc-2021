"use client";

import { useState, useRef } from "react";
import { enableMapSet } from "immer";
import { useImmer } from "use-immer";
import clsx from "clsx";

import { Box } from "../shapes/Box";
import { ShearedBox } from "../shapes/ShearedBox";
import { useSine } from "../../hooks/useSine";

function KeyboardKey({ value, alt, width = 32, isDown }) {
    return (
        <div
            className={clsx(
                "preserve-3d transition-transform ease-out duration-75",
                isDown && "[transform:translateZ(-7px)]",
                width === 0 && "grow"
            )}
        >
            <Box
                angle={75}
                depth={15}
                sideClass="bg-yellow-900"
                borderWidth={1}
                borderClass="bg-yellow-200"
            >
                <div
                    className={clsx(
                        "h-8 bg-yellow-200 border-2 border-yellow-900 font-bold text-yellow-800 pl-1 flex flex-col",
                        alt ? "text-[0.5rem]" : "text-xs"
                    )}
                    style={{ width: width === 0 ? null : width }}
                >
                    <span>{value}</span>
                    <span>{alt}</span>
                </div>
            </Box>
        </div>
    );
}

function Computer() {
    return (
        <Box depth={300} sideClass="bg-yellow-900 border-4 border-yellow-200">
            <div className="w-32 h-64 bg-yellow-200"></div>
            <div className="absolute w-32 h-[300px] origin-top [transform:rotateX(-90deg)] flex flex-col items-stretch p-2 bg-yellow-900 border-4 border-yellow-200">
                {/* <div className="flex flex-col p-2 gap-1">
                    <div className="h-5 border-2 border-yellow-600" />
                    <div className="self-end w-4 h-2 bg-yellow-600 border-yellow-600 rounded-full" />
                </div>
                <div className="flex flex-col p-2 gap-1">
                    <div className="h-5 border-2 border-yellow-600" />
                    <div className="self-end w-4 h-2 bg-yellow-600 rounded-full" />
                </div> */}
            </div>
        </Box>
    );
}

function Monitor({ value, isOn, onToggle }) {
    return (
        <div className="preserve-3d relative center cursor-pointer" onClick={onToggle}>
            <ShearedBox
                shear={20}
                width={400}
                height={300}
                depth={150}
                sideClass="bg-yellow-900"
                renderBase={({ className, style }) => (
                    <div
                        className={clsx(
                            className,
                            "bg-yellow-200 center [transform:translateZ(150px)]"
                        )}
                        style={style}
                    >
                        <div className="absolute bg-zinc-950 rounded-xl w-[350px] h-[250px]" />
                        <div
                            className={clsx(
                                "bg-yellow-950 w-[350px] h-[250px] rounded-xl p-8 relative overflow-hidden crt transition-opacity duration-[1500ms]",
                                isOn ? "opacity-100" : "opacity-0"
                            )}
                        >
                            <span className="font-mono text-yellow-100 whitespace-pre-line">
                                {value}
                            </span>
                        </div>
                    </div>
                )}
            />
            <div className="absolute [transform:rotateX(180deg)] preserve-3d">
                <Box angle={80} sideClass="bg-yellow-950" depth={250} className="absolute">
                    <div className="w-[250px] h-[150px] bg-yellow-950" />
                </Box>
            </div>
        </div>
    );
}

function Keyboard({ onChange }) {
    const [keysDown, updateKeysDown] = useImmer(new Set());
    const handleKeyDown = (e) => {
        updateKeysDown((draft) => {
            draft.add(e.key.toLowerCase());
        });
    };
    const handleKeyUp = (e) => {
        updateKeysDown((draft) => {
            draft.delete(e.key.toLowerCase());
        });
    };

    const ref = useRef();

    const heightOffset = useSine(-10, 10, 0.5);

    const fromString = (s) => Array.from(s, (k) => ({ value: k }));
    const rows = [
        [
            { value: "~", alt: "`" },
            { value: "!", alt: "1" },
            { value: "@", alt: "2" },
            { value: "#", alt: "3" },
            { value: "$", alt: "4" },
            { value: "%", alt: "5" },
            { value: "^", alt: "6" },
            { value: "&", alt: "7" },
            { value: "*", alt: "8" },
            { value: "(", alt: "9" },
            { value: ")", alt: "0" },
            { value: "_", alt: "-" },
            { value: "+", alt: "=" },
            { value: "", width: 0 },
        ],
        [
            { value: "", width: 40 },
            ...fromString("QWERTYUIOP"),
            { value: "{", alt: "[" },
            { value: "}", alt: "]" },
            { value: "", width: 0 },
        ],
        [
            { value: "", width: 60 },
            ...fromString("ASDFGHJKL"),
            { value: ":", alt: ";" },
            { value: '"', alt: "'" },
            { value: "", width: 0 },
        ],
        [
            { value: "SHIFT", width: 80 },
            ...fromString("ZXCVBNM"),
            { value: "<", alt: "," },
            { value: ">", alt: "." },
            { value: "?", alt: "/" },
            { value: "", width: 0 },
        ],
        [
            { value: "", width: 50 },
            { value: "", width: 44 },
            { value: " ", width: 384 },
            { value: "", width: 40 },
            { value: "", width: 0 },
        ],
    ];
    return (
        <div
            className="relative preserve-3d cursor-pointer"
            style={{ transform: `translateZ(${heightOffset}px)` }}
            onClick={() => ref.current.focus()}
        >
            <Box depth={25} sideClass="bg-yellow-900 border-2 border-yellow-200">
                <div className="border-yellow-200 preserve-3d border-y-8 border-x-4 py-2">
                    <div className="flex flex-col gap-3 [transform:translateZ(-10px)] preserve-3d">
                        {rows.map((row, i) => (
                            <div key={i} className="flex gap-2.5 preserve-3d w-[600px]">
                                {row.map((key) => (
                                    <KeyboardKey
                                        key={key.value}
                                        {...key}
                                        isDown={keysDown.has(key.value.toLowerCase())}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Box>
            <div className="absolute left-0 top-0 bg-yellow-950 w-full h-full" />

            <textarea
                ref={ref}
                autoFocus
                className="absolute opacity-0"
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onChange={(e) => onChange(e.target.value)}
            ></textarea>
        </div>
    );
}

export function OldComputer() {
    const [isMonitorOn, setIsMonitorOn] = useState(false);
    const [value, setValue] = useState("");
    enableMapSet();

    return (
        <div className="flex [perspective:800px]">
            <div className="flex [transform:rotateX(50deg)translateX(-300px)] preserve-3d relative">
                <div className="absolute [transform:scale(0.8)translateZ(-100px)] preserve-3d">
                    <Keyboard onChange={(value) => setValue(value)} />
                </div>
                {/* <div className="absolute [transform:translate3d(500px,-250px,0px)] preserve-3d">
                    <Computer />
                </div> */}
                <div className="absolute [transform:rotateX(-90deg)translate3d(100px,-150px,-200px)scale(0.75)] preserve-3d">
                    <Monitor
                        value={value}
                        isOn={isMonitorOn}
                        onToggle={() => setIsMonitorOn(!isMonitorOn)}
                    />
                </div>
            </div>
        </div>
    );
}
