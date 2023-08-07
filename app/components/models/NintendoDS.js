"use client";

import clsx from "clsx";
import { Box } from "../shapes/Box";
import { useCallback, useEffect, useRef, useState } from "react";
import { RegularPolygon } from "../shapes/RegularPolygon";
import { Polygon } from "../shapes/Polygon";
import { ShearedBox } from "../shapes/ShearedBox";
import { useMouse } from "../../hooks/useMouse";
import { pixelateFilter } from "../../utils";

function Button({ value }) {
    return (
        <div className="preserve-3d center">
            <RegularPolygon
                edges={10}
                width={40}
                depth={8}
                topClass="bg-zinc-700"
                topBorder={{ width: 2, borderClass: "bg-zinc-800" }}
                sideClass="bg-zinc-800"
            />
            <div className="absolute [transform:translateZ(8px)] text-center text-zinc-800 font-mono">
                {value}
            </div>
            <div className="absolute w-[44px] h-[44px] bg-zinc-950 rounded-full z-20" />
            <div className="absolute w-[48px] h-[48px] bg-zinc-900 rounded-full" />
        </div>
    );
}

function DPadButton({ center, className }) {
    return (
        <div className={clsx("preserve-3d center", className)}>
            <div
                className={clsx(
                    "preserve-3d origin-bottom",
                    center
                        ? "[transform:translateZ(-6px)]"
                        : "[transform:rotateX(-5deg)translateZ(-6px)]"
                )}
            >
                <Box depth={16} sideClass="bg-zinc-800">
                    <div
                        className={clsx(
                            "w-8 h-8 bg-zinc-700 center",
                            !center && "border-2 border-b-0 border-zinc-800"
                        )}
                    >
                        {!center && <div className="w-0.5 h-4 bg-zinc-800 rounded-full" />}
                    </div>
                </Box>
            </div>
            <div className="absolute w-[38px] h-[38px] bg-zinc-950 z-20" />
            <div className="absolute w-[42px] h-[42px] bg-zinc-900" />
        </div>
    );
}

function DPad({ className }) {
    return (
        <div className={clsx("flex flex-col preserve-3d items-center", className)}>
            <DPadButton />
            <div className="flex preserve-3d">
                <DPadButton className="-rotate-90" />
                <DPadButton center />
                <DPadButton className="rotate-90" />
            </div>
            <DPadButton className="rotate-180" />
        </div>
    );
}

function Screen({ children, className }) {
    const handleEnter = useCallback(() => {}, []);
    const handleLeave = useCallback(() => {}, []);

    const ref = useRef();
    const { relativePosition, isDown, isInside } = useMouse(ref);
    const screenX = relativePosition.x * 300;
    const screenY = relativePosition.y * 230;

    return (
        <div
            ref={ref}
            className={clsx(
                "w-[300px] h-[230px] border-4 border-zinc-800 bg-zinc-900 rounded-xl center preserve-3d relative cursor-none",
                className
            )}
        >
            <div
                className="w-[280px] h-[210px] rounded-lg bg-zinc-600 overflow-hidden flex relative crt2"
                style={{ filter: pixelateFilter(3) }}
            >
                {/* {children} */}
            </div>

            <div className={"absolute left-0 top-0 preserve-3d"}>
                <Stylus x={screenX} y={screenY} isDown={isDown} isHidden={!isInside} />
            </div>
        </div>
    );
}

function Top(className) {
    const renderBase = useCallback(
        ({ className, style }) => <div className={clsx(className, "bg-rose-600")} style={style} />,
        []
    );

    return (
        <div className="preserve-3d center relative">
            <ShearedBox
                shear={20}
                width={600}
                height={320}
                depth={30}
                topClass="bg-zinc-900"
                sideClass="bg-zinc-950"
                topBorder={{ width: 10, borderClass: "bg-zinc-800" }}
                sideBorder={{ width: 4, borderClass: "bg-zinc-800" }}
                renderBase={renderBase}
            />
            <div className="absolute left-0 top-0 w-[600px] h-[320px] [transform:translateZ(30px)] flex justify-center items-center gap-8 preserve-3d">
                <div className="flex flex-wrap basis-14 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-zinc-950 rounded-full" />
                    ))}
                </div>
                <Screen>
                    {/* <img src="https://i.redd.it/konrs7f5wr011.png" className="w-full" /> */}
                </Screen>
                <div className="flex flex-wrap basis-14 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-zinc-950 rounded-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function Bottom({ className }) {
    return (
        <div className="preserve-3d absolute center">
            <ShearedBox
                shear={20}
                width={600}
                height={320}
                depth={40}
                topClass="bg-zinc-900"
                sideClass="bg-zinc-950"
                topBorder={{ width: 10, borderClass: "bg-zinc-800" }}
                sideBorder={{ width: 4, borderClass: "bg-zinc-800" }}
            ></ShearedBox>
            <div className="absolute top-0 preserve-3d [transform:translate3d(0,0,40px)]">
                <ShearedBox
                    shear={10}
                    width={600}
                    height={40}
                    depth={30}
                    topClass="bg-zinc-900"
                    sideClass="bg-zinc-900"
                    topBorder={{ width: 2, borderClass: "bg-zinc-800" }}
                    sideBorder={{ width: 2, borderClass: "bg-zinc-800" }}
                />
            </div>
            <div className="absolute w-[600px] h-[320px] flex items-center justify-center [transform:translateZ(40px)] preserve-3d">
                <DPad className="basis-32" />
                <Screen
                    className=""
                    src="https://static.cinemagia.ro/img/resize/db/movie/01/21/31/baieti-buni-592050l-576x0-w-c19e5cb7.jpg"
                >
                    <div className="h-full w-full flex justify-center items-center gap-4">
                        <div className="flex flex-col items-center drop-shadow-lg">
                            <div className="w-10 h-14 bg-zinc-300 border-4 border-zinc-700 rounded-md rounded-bl-2xl"></div>
                            <span className="font-mono">puya.jpg</span>
                        </div>
                        <div className="flex flex-col items-center drop-shadow-lg">
                            <div className="w-10 h-14 bg-zinc-300 border-4 border-zinc-700 rounded-md rounded-bl-2xl"></div>
                            <span className="font-mono">cabral.jpg</span>
                        </div>
                    </div>
                </Screen>
                <div className="basis-32 flex flex-col preserve-3d justify-center items-center">
                    <Button value="X" />
                    <div className="flex preserve-3d gap-8">
                        <Button value="Y" />
                        <Button value="A" />
                    </div>
                    <Button value="B" />
                </div>
            </div>
        </div>
    );
}

function Stylus({ x, y, isDown, isHidden, className }) {
    return (
        <div
            className={clsx("absolute top-0 left-0 preserve-3d", className)}
            style={{ transform: `translate3d(${x}px, ${y}px, 50px)` }}
        >
            {[0, 90].map((angle) => (
                <div
                    key={angle}
                    className="absolute transition-transform preserve-3d origin-left"
                    style={{
                        transform: `rotateY(-${45 + (isDown && 5)}deg) ${
                            isDown ? "translateX(-50px)" : ""
                        }`,
                    }}
                    // style={{
                    //     transform: `rotateX(90deg) rotateZ(${45 + (isDown && 5)}deg) ${
                    //         isDown ? "translateX(-50px)" : ""
                    //     }`,
                    // }}
                >
                    <div style={{ transform: `rotateX(${angle}deg)` }}>
                        <div
                            className={clsx(
                                "flex items-center transition-opacity duration-500",
                                isHidden ? "opacity-0" : "opacity-100"
                            )}
                        >
                            <div className="absolute w-[20px] h-[10px] bg-zinc-900 rounded-full -left-3"></div>
                            <div
                                className="w-[50px] h-[25px] bg-zinc-800 rounded-md relative"
                                style={{ clipPath: "polygon(0 5px, 100% 0, 100% 100%, 0 20px)" }}
                            ></div>
                            <div className="w-[350px] h-[25px] bg-zinc-800 rounded-l-md border-r-0"></div>
                            <div className="w-[100px] h-[34px] bg-zinc-800 mt-[9px] border-l-0"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function RotationCube() {
    return (
        <Box depth={40} sideClass="bg-zinc-300 border-2 border-zinc-400 rounded-md">
            <div className="w-10 h-10 bg-zinc-300 border-2 border-zinc-400 rounded-md" />
        </Box>
    );
}

export function NintendoDS() {
    const [tick, setTick] = useState(0);
    // useEffect(() => {
    //     let ignore = false;

    //     const animate = () => {
    //         setTick((t) => t + 1);
    //         if (!ignore) requestAnimationFrame(animate);
    //     };
    //     animate();

    //     return () => {
    //         ignore = true;
    //     };
    // });

    const [isDown, setIsDown] = useState(false);
    const [viewAngle, setViewAngle] = useState({ x: 0, y: 0 });
    const handleMove = (e) => {
        if (!isDown) return;
        setViewAngle({ x: viewAngle.x + e.movementY, y: viewAngle.y + e.movementX });
    };

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="flex flex-col justify-center items-center preserve-3d [perspective:1600px] w-full h-full relative"
            onPointerMove={handleMove}
            onPointerDown={() => setIsDown(true)}
            onPointerUp={() => setIsDown(false)}
        >
            <div
                className="preserve-3d"
                style={{
                    transform: `translateZ(50px) rotateX(${30 + viewAngle.x / 2}deg) rotateZ(${
                        viewAngle.y / 2
                    }deg)`,
                }}
            >
                <div
                    className="preserve-3d [transformOrigin:bottom] transition-transform duration-1000"
                    style={{
                        transform:
                            "translate3d(0, 0, 75px) rotateX(-180deg)" +
                            (isOpen ? "rotateX(120deg)" : ""),
                    }}
                >
                    <Top />
                </div>
                <div className="preserve-3d origin-top relative">
                    <Bottom />
                </div>
            </div>
            <button
                className={clsx(
                    "absolute bottom-4 right-4 w-24 h-24 text-black rounded-xl border-2 z-30",
                    isOpen ? "bg-amber-500 border-amber-600" : "bg-zinc-500 border-zinc-600"
                )}
                onClick={() => setIsOpen(!isOpen)}
            ></button>
            <div className="preserve-3d absolute top-10 left-10 [perspective:200px] z-50">
                <div
                    className="preserve-3d"
                    style={{
                        transform: `rotateX(${viewAngle.x}deg) rotateZ(${viewAngle.y / 2}deg)`,
                    }}
                >
                    <RotationCube />
                </div>
            </div>
        </div>
    );
}
