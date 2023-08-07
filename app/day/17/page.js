"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { experimental_useEffectEvent as useEffectEvent } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { ObjectInspector } from "app/components/ObjectInspector";
import { clamp, flatMap, inRange, intersection, isEqual, range, uniqWith } from "lodash";
import clsx from "clsx";
import { Box } from "app/components/shapes/Box";
import { useMovementAxis } from "app/hooks/useMovementAxis";
import { RegularPolygon } from "app/components/shapes/RegularPolygon";
import { product } from "app/utils";
import { PolygonBorder } from "app/components/shapes/PolygonBorder";

// Great work here:
// https://stackoverflow.com/questions/45238194/how-can-i-create-pure-css-3-dimensional-spheres
// Pseudo-shading would be cool but I can't figure it out.
// TODO: Move to own file, add size prop
function Sphere({ circleClass, className }) {
    return (
        <div className={clsx("relative preserve-3d", className)}>
            {["X", "Y", "Z"].map((axis) => (
                <>
                    {[0, 30, 60, 90, 120, 150].map((angle) => (
                        <div
                            key={angle}
                            className={clsx("absolute w-12 h-12 rounded-full", circleClass)}
                            style={{ transform: `rotate${axis}(${angle}deg)` }}
                        ></div>
                    ))}
                </>
            ))}
        </div>
    );
}

function Joystick({ onLeft, onRight, onUp, onDown }) {
    const xDirection = useMovementAxis("ArrowLeft", "ArrowRight");
    const yDirection = useMovementAxis("ArrowDown", "ArrowUp");

    const transform = `rotateY(${xDirection * 10}deg) rotateX(${yDirection * 10}deg)`;

    const onTick = useEffectEvent(() => {
        if (xDirection === -1) onLeft();
        if (xDirection === 1) onRight();
        if (yDirection === -1) onDown();
        if (yDirection === 1) onUp();
    });
    useEffect(() => {
        const interval = setInterval(() => onTick(), 250);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative center preserve-3d">
            <div
                className="absolute preserve-3d transition-transform"
                style={{ transform, transformOrigin: "" }}
            >
                <Box depth={60} angle={90} sideClass="bg-stone-900">
                    <div className="w-4 h-4 preserve-3d">
                        <Sphere
                            circleClass="bg-rose-700"
                            className="-left-4 -top-4 [transform:translateZ(1.5rem)]"
                        />
                    </div>
                </Box>
            </div>
            <div className="w-8 h-8 bg-stone-950 border-2 border-stone-900 rounded-lg"></div>
        </div>
    );
}

function DPadButton({ direction }) {
    const triangle = (
        <div className="w-3 h-3 bg-stone-800 relative [clipPath:polygon(0_100%,50%_0,100%_100%)]">
            <div className="w-[10px] h-[10px] absolute bg-stone-600 left-[1px] top-[1px] [clipPath:polygon(0_100%,50%_0,100%_100%)]"></div>
        </div>
    );

    const className = {
        up: "",
        down: "rotate-180",
        left: "-rotate-90",
        right: "rotate-90",
        center: "border-x-0 border-y-0",
    }[direction];

    return (
        <Box depth={7} angle={75} sideClass="bg-stone-900">
            <div
                className={clsx(
                    "w-6 h-6 bg-stone-700 border-2 border-b-0 border-stone-800 center",
                    className
                )}
            >
                {direction !== "center" && triangle}
            </div>
        </Box>
    );
}

function DPad({ onLeft, onRight, onUp, onDown }) {
    const xDirection = useMovementAxis("a", "d");
    const yDirection = useMovementAxis("s", "w");

    const onTick = useEffectEvent(() => {
        if (xDirection === -1) onLeft();
        if (xDirection === 1) onRight();
        if (yDirection === -1) onDown();
        if (yDirection === 1) onUp();
    });
    useEffect(() => {
        const interval = setInterval(() => onTick(), 100);
        return () => clearInterval(interval);
    }, []);

    const transform = `rotateY(${xDirection * 5}deg) rotateX(${yDirection * 5}deg)`;

    const borderWidth = 6;

    return (
        <div className="preserve-3d relative center">
            <div
                className="flex flex-col items-center preserve-3d transition-transform"
                style={{ transform }}
            >
                <DPadButton direction="up" />
                <div className="flex preserve-3d">
                    <DPadButton direction="left" />
                    <DPadButton direction="center" />
                    <DPadButton direction="right" />
                </div>
                <DPadButton direction="down" />
            </div>
            <div
                className="absolute bg-stone-900"
                style={{
                    width: `calc(100% + ${2 * borderWidth}px)`,
                    height: `calc(100% + ${2 * borderWidth}px)`,
                    clipPath:
                        "polygon(30% 0, 70% 0, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)",
                }}
            >
                <div
                    className="absolute bg-stone-950"
                    style={{
                        width: `calc(100% - ${6}px)`,
                        height: `calc(100% - ${6}px)`,
                        left: `${3}px`,
                        top: `${3}px`,

                        clipPath:
                            "polygon(30% 0, 70% 0, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)",
                    }}
                ></div>
            </div>
        </div>
    );
}

function Slider({ value, onChange, isVertical = false, className }) {
    const [isHeld, setIsHeld] = useState(false);

    const ref = useRef();
    const [originBox, setOriginBox] = useState(null);
    // Not sure if I should use a layout effect here.
    // My current thinking is that since rootBox doesn't
    // trigger a re-render a simple effect is fine.
    useEffect(() => {
        const box = ref.current.getBoundingClientRect();
        setOriginBox(box);
    }, []);

    const handleMove = (e) => {
        if (!isHeld) return;

        let delta;
        if (isVertical) {
            delta = e.clientY - originBox.y - originBox.height / 2;
        } else {
            delta = e.clientX - originBox.x - originBox.width / 2;
        }
        const newValue = clamp(Math.floor(delta / 10), -10, 10);

        onChange(newValue);
    };

    return (
        <div
            ref={ref}
            onPointerMove={handleMove}
            onPointerDown={() => setIsHeld(true)}
            onPointerUp={() => setIsHeld(false)}
            onPointerLeave={() => setIsHeld(false)}
            className={clsx(
                "border-4 border-stone-900 bg-stone-800 relative preserve-3d center",
                isVertical ? "w-4 h-48" : "w-48 h-4",
                className
            )}
        >
            <Box
                angle={75}
                className="absolute cursor-pointer transition-transform m-0 p-0 h-fit w-fit"
                style={{
                    transform: `translate(${!isVertical ? value * 10 : 0}px, ${
                        isVertical ? value * 10 : 0
                    }px)`,
                }}
                sideClass="bg-amber-950"
                borderWidth={2}
                borderClass="bg-amber-600"
            >
                <button
                    className={clsx(
                        "bg-amber-600 border-2 border-amber-950 block",
                        isVertical ? "h-5 w-12" : "h-12 w-5"
                    )}
                ></button>
            </Box>
        </div>
    );
}

function Screen({ velocity, velocityIndex, velocityCount, className }) {
    const { isPartOne } = useContext(ChallengeContext);

    return (
        <div
            className={clsx(
                "flex-col w-[7.5rem] h-[7.5rem] center bg-stone-900 font-mono rounded-lg text-stone-300 crt border-2 border-stone-800 relative text-xl",
                className
            )}
        >
            {!isPartOne && (
                <div className="flex justify-center text-base mb-1">
                    {velocityIndex} / {velocityCount}
                </div>
            )}
            <div className="flex w-full justify-between px-6">
                <span>X: </span>
                <span>{velocity.x}</span>
            </div>
            <div className="flex w-full justify-between px-6">
                <span>Y: </span> {velocity.y}
            </div>
        </div>
    );
}

function TriangleButton({ disabled, onClick, className }) {
    return (
        <button
            disabled={disabled}
            className={clsx("relative center preserve-3d cursor-pointer block group", className)}
            onClick={onClick}
        >
            <div className="relative center preserve-3d transition-transform active:group-enabled:[transform:translateZ(-5px)]">
                <RegularPolygon
                    edges={3}
                    angle={75}
                    width={50}
                    depth={10}
                    topClass={disabled ? "bg-zinc-600" : "bg-rose-600"}
                    topBorder={{ width: 6, borderClass: disabled ? "bg-zinc-800" : "bg-rose-950" }}
                    sideClass={disabled ? "bg-zinc-800" : "bg-rose-950"}
                />
                {!disabled && (
                    <div className="absolute w-20 h-20 bg-gradient-radial from-rose-600 to-30% opacity-50 [transform:translateZ(10px)]"></div>
                )}
            </div>
            <PolygonBorder
                className="absolute w-[60px] h-[60px] top-2"
                baseClass="bg-stone-950"
                borderClass="bg-stone-900"
                borderScale={0.8}
                style={{ clipPath: "polygon(0 0, 50% 85%, 100% 0)" }}
            />
        </button>
    );
}

function Controls({
    velocity,
    onChangeVelocity,
    view,
    onChangeView,
    velocities,
    velocityIndex,
    onChangeVelocityIndex,
}) {
    const [isActive, setIsActive] = useState(false);
    const { isPartOne } = useContext(ChallengeContext);

    return (
        <div className="flex items-center justify-center border-4 py-8 border-stone-900 bg-stone-600 preserve-3d">
            {isPartOne ? (
                <div className="flex flex-col preserve-3d gap-4">
                    <Joystick
                        onLeft={() => onChangeVelocity({ x: velocity.x - 1, y: velocity.y })}
                        onRight={() => onChangeVelocity({ x: velocity.x + 1, y: velocity.y })}
                        onUp={() => onChangeVelocity({ x: velocity.x, y: velocity.y + 1 })}
                        onDown={() => onChangeVelocity({ x: velocity.x, y: velocity.y - 1 })}
                    />
                    <DPad
                        onLeft={() => onChangeView({ x: view.x + 1, y: view.y })}
                        onRight={() => onChangeView({ x: view.x - 1, y: view.y })}
                        onUp={() => onChangeView({ x: view.x, y: view.y - 1 })}
                        onDown={() => onChangeView({ x: view.x, y: view.y + 1 })}
                    />
                </div>
            ) : (
                <div className="flex preserve-3d">
                    <TriangleButton
                        disabled={velocityIndex === 0}
                        onClick={() => onChangeVelocityIndex(velocityIndex - 1)}
                        className="[transform:rotateZ(90deg)]"
                    />
                    <TriangleButton
                        disabled={velocityIndex === velocities.length - 1}
                        onClick={() => onChangeVelocityIndex(velocityIndex + 1)}
                        className="[transform:rotateZ(-90deg)]"
                    />
                </div>
            )}
            <Screen
                velocity={isPartOne ? velocity : velocities[velocityIndex]}
                velocityIndex={velocityIndex}
                velocityCount={velocities.length}
                className="mx-12"
            />
            <div className="preserve-3d relative center">
                {/* TODO: Add safety lid you pull back */}
                <Box
                    depth={20}
                    angle={75}
                    sideClass="bg-rose-950"
                    borderWidth={2}
                    borderClass="bg-rose-600"
                    className="transition-transform"
                    style={{ transform: isActive ? "translateZ(-10px)" : "" }}
                >
                    <button
                        className="w-24 h-24 bg-rose-700 border-2 border-rose-950 font-mono block cell-shaded bg-gradient-radial"
                        onPointerDown={() => setIsActive(true)}
                        onPointerUp={() => setIsActive(false)}
                    ></button>
                </Box>
                <div className="absolute h-[7.5rem] w-[7.5rem] bg-stone-950 border-4 border-stone-900"></div>
                <div className="absolute h-[7.5rem] w-[7.5rem] bg-gradient-radial from-rose-600 to-80% opacity-50 [transform:translateZ(20px)] pointer-events-none"></div>
            </div>
        </div>
    );
}

const getProbePositions = (initialVelocity, targetX, targetY) => {
    const ret = [];

    let [velocityX, velocityY] = [initialVelocity.x, initialVelocity.y];
    let [x, y] = [0, 0];
    while (y >= targetY[1] - 100) {
        [x, y] = [x + velocityX, y + velocityY];
        ret.push({ x, y });

        if (velocityX) {
            velocityX = velocityX > 0 ? velocityX - 1 : velocityX + 1;
        }
        velocityY -= 1;
    }

    return ret;
};

const getY = (vy, step) => step * vy - (step * (step - 1)) / 2;
const getValidYSteps = (vy, targetY) => {
    const ret = [];

    let [step, y] = [0, 0];
    while (y >= targetY[1]) {
        if (y <= targetY[0]) ret.push(step);
        y = getY(vy, ++step);
    }

    return ret;
};

const getX = (vx, step) => step * vx - (step * (step - 1)) / 2;
const getValidXSteps = (vx, targetX, openMap) => {
    const ret = [];

    let [step, x] = [0, 0];
    while (x <= targetX[1] && step <= vx) {
        if (x >= targetX[0]) ret.push(step);
        x = getX(vx, ++step);
    }
    step -= 1;
    x = getX(vx, step);
    if (x >= targetX[0] && x <= targetX[1] && step >= vx) {
        if (!openMap.has(step)) openMap.set(step, []);
        openMap.get(step).push(vx);
    }

    return ret;
};

const getAllVelocities = (targetX, targetY) => {
    const yMap = new Map();
    for (let vy = targetY[1]; vy <= -targetY[1]; vy++) {
        getValidYSteps(vy, targetY).forEach((step) => {
            if (!yMap.has(step)) yMap.set(step, []);
            yMap.get(step).push(vy);
        });
    }

    const [xMap, xOpenMap] = [new Map(), new Map()];
    for (let vx = 1; vx <= targetX[1]; vx++) {
        getValidXSteps(vx, targetX, xOpenMap).forEach((step) => {
            if (!xMap.has(step)) xMap.set(step, []);
            xMap.get(step).push(vx);
        });
    }

    const validSteps = intersection(Array.from(xMap.keys()), Array.from(yMap.keys()));
    const ret = flatMap(validSteps, (s) => product(xMap.get(s), yMap.get(s)));

    yMap.forEach((vy, sy) => {
        xOpenMap.forEach((vx, sx) => {
            if (sx <= sy) ret.push(...product(vx, vy));
        });
    });

    return uniqWith(ret, isEqual).map(([x, y]) => ({ x, y }));
};

function Board({ velocity, viewOffset, targetX, targetY }) {
    let [rows, cols] = [15, 30];

    const positions = getProbePositions(velocity, targetX, targetY);
    const positionStr = positions.map(({ x, y }) => `${x},${y}`);
    const positionSet = new Set();
    positions.forEach(({ x, y }) => positionSet.add(`${x},${y}`));

    return (
        <div className="p-2 bg-stone-800 border-4 border-stone-900">
            <div className="flex flex-col bg-stone-800">
                {range(rows).map((i) => (
                    <div key={i} className="flex">
                        {range(cols).map((j) => {
                            let [x, y] = [j - viewOffset.x, -i - viewOffset.y];

                            const isTarget =
                                inRange(y, targetY[0], targetY[1] + 1) &&
                                inRange(x, targetX[0], targetX[1] + 1);

                            const isOrigin = x === 0 && y === 0;
                            const isPath = positionSet.has(`${x},${y}`);

                            let backgroundColor;
                            if (isPath) {
                                const stepIndex = positionStr.indexOf(`${x},${y}`) + 1;
                                backgroundColor = `#${(255 - stepIndex * 16).toString(16)}1d48`;
                            }

                            let cellColor;
                            if (isOrigin) cellColor = "bg-rose-500";
                            else if (isTarget) cellColor = "bg-emerald-700";

                            return (
                                <div
                                    key={j}
                                    className={clsx(
                                        "w-4 h-4 border-l-2 border-t-2 border-stone-900 center text-xs relative",
                                        cellColor,
                                        j === cols - 1 && "border-r-2",
                                        i === rows - 1 && "border-b-2"
                                    )}
                                    style={{
                                        backgroundColor,
                                    }}
                                >
                                    {!isOrigin && isPath && (
                                        <div
                                            className="absolute h-full w-full z-50 rounded-full animate-ping"
                                            style={{ backgroundColor }}
                                        ></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Laptop({ x1, x2, y1, y2, velocities }) {
    const [velocity, setVelocity] = useState({ x: 0, y: 0 });
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
    const [viewAngle, setViewAngle] = useState({ x: 0, y: 0 });

    const [velocityIndex, setVelocityIndex] = useState(0);

    const ref = useRef();
    const handleMove = (e) => {
        if (!ref) return;
        const box = ref.current.getBoundingClientRect();
        const relativeX = (e.clientX - box.x) / box.width;
        const relativeY = (e.clientY - box.y) / box.height;

        const [maxAngleX, maxAngleY] = [15, 30];

        setViewAngle({
            x: relativeX * maxAngleX - maxAngleX / 2,
            y: relativeY * maxAngleY - maxAngleY / 2,
        });
    };

    const { isPartOne } = useContext(ChallengeContext);

    const boxProps = {
        depth: 40,
        sideClass: "bg-stone-900",
    };
    return (
        <div
            ref={ref}
            className="bg-zinc-500 p-24 rounded-full"
            style={{ perspective: "800px", perspectiveOrigin: "center" }}
            onPointerMove={handleMove}
        >
            <div
                className="preserve-3d transform-gpu"
                style={{ transform: `rotateX(${viewAngle.y}deg) rotateY(${-viewAngle.x}deg)` }}
            >
                <div className="preserve-3d [transform:rotateX(15deg)] [transformOrigin:bottom]">
                    <Box {...boxProps}>
                        <Board
                            velocity={isPartOne ? velocity : velocities[velocityIndex]}
                            viewOffset={viewOffset}
                            targetX={[x1, x2]}
                            targetY={[y1, y2]}
                        />
                    </Box>
                </div>
                <div className="preserve-3d mt-8 [transform:rotateX(45deg)] [transformOrigin:top]">
                    <Box {...boxProps}>
                        <Controls
                            velocity={velocity}
                            onChangeVelocity={setVelocity}
                            view={viewOffset}
                            onChangeView={setViewOffset}
                            velocities={velocities}
                            velocityIndex={velocityIndex}
                            onChangeVelocityIndex={setVelocityIndex}
                        />
                    </Box>
                </div>
            </div>
        </div>
    );
}

export default function Day17() {
    const { lines } = useContext(ChallengeContext);
    const [_, x1, x2, y1, y2] = /x=(\d+)\.\.(\d+), y=(-\d+)\.\.(-\d+)/
        .exec(lines[0])
        .map((s) => parseInt(s));

    const velocities = getAllVelocities([x1, x2], [y2, y1]);

    return (
        <div className="h-full flex flex-col justify-center items-center">
            <Laptop x1={x1} x2={x2} y1={y1} y2={y2} velocities={velocities} />
        </div>
    );
}
