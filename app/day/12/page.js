"use client";

import { useState, useContext, useRef, forwardRef } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { motion, useAnimate } from "framer-motion";
import { Box } from "../../components/shapes/Box";
import clsx from "clsx";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import paintings from "/public/minecraft/paintings";
import { random } from "lodash";

const addEdge = (edges, node, edge) => {
    if (!edges.has(node)) {
        edges.set(node, []);
    }
    edges.set(node, edges.get(node).concat(edge));
};

const isBig = (node) => node.toUpperCase() === node;

const canVisit = (node, visited, isPartTwo) => {
    if (isBig(node)) return true;
    if (node === "start") return false;
    if (isPartTwo) {
        const smallVisited = visited.filter((n) => !isBig(n));
        const smallTwice = smallVisited.length > new Set(smallVisited).size;
        return !smallTwice || !visited.includes(node);
    } else {
        return !visited.includes(node);
    }
};
const dfs = (neighbors, node, visited, isPartTwo) => {
    const newVisited = visited.slice();
    newVisited.push(node);

    if (node === "end") return [newVisited];

    const ret = [];
    neighbors.get(node).forEach((neighbor) => {
        if (canVisit(neighbor, newVisited, isPartTwo)) {
            const nextPaths = dfs(neighbors, neighbor, newVisited, isPartTwo);
            ret.push(...nextPaths);
        }
    });

    return ret;
};

const MotionBox = motion(Box);

const Tape = ({ className }) => (
    <div
        className={clsx("absolute h-4 w-48 bg-yellow-300", className)}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2309090a' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
    ></div>
);

const Door = motion(
    forwardRef(function Door({ name, disabled, onClick }, ref) {
        const isBigRoom = isBig(name);
        const isEndRoom = name === "end";

        // let colors = "[--primary:#3f3f46] [--lighter:#52525b] [--darker:#27272a]";
        let colors = "[--primary:#7b5f36] [--lighter:#b18a4e] [--darker:#67502d]";
        if (isEndRoom) colors = "[--primary:#991b1b] [--lighter:#b91c1c] [--darker:#7f1d1d]";
        if (isBigRoom) colors = "[--primary:#334155] [--lighter:#475569] [--darker:#1e293b]";

        return (
            <div
                ref={ref}
                className={clsx("relative h-64 cursor-pointer center preserve-3d w-32", colors)}
                onClick={disabled ? () => {} : onClick}
            >
                <div className="absolute inset-0 font-mono bg-stone-950 center">
                    <motion.div
                        animate={{ scale: [null, 1.5] }}
                        transition={{ repeat: Infinity, duration: 0.5, repeatType: "mirror" }}
                    >
                        {/* ❓❓❓ */}
                    </motion.div>
                </div>
                <MotionBox
                    className="w-full h-full origin-left"
                    depth={10}
                    sideClass="bg-[--darker]"
                    borderWidth={2}
                    borderClass="bg-[--primary]"
                    variants={{ open: { rotateY: -90 } }}
                    initial={{ z: 5, rotateY: disabled ? 0 : -10 }}
                >
                    <div className="flex flex-col items-center w-full h-full border-4 border-[color:--darker] bg-[--primary]">
                        <div className="w-16 mt-8 font-mono text-center bg-[--lighter] text-[color:--darker]">
                            {name}
                        </div>
                        <div className="flex flex-col gap-2 mt-auto mb-2">
                            <div className="flex">
                                <div className="w-12 h-10 bg-[color:--darker]" />
                                <div className="w-12 h-10 bg-[color:--darker]" />
                            </div>
                            <div className="flex">
                                <div className="w-12 h-10 bg-[color:--darker]" />
                                <div className="w-12 h-10 bg-[color:--darker]" />
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-[--primary] border-2 border-[color:--darker] [transform:translateZ(-10px)]" />

                    {disabled && (
                        <div className="absolute inset-0 overflow-hidden center">
                            <Tape className="rotate-[15deg]" />
                            <Tape className="rotate-[-20deg]" />
                            <Tape className="mt-24 rotate-[-5deg]" />
                        </div>
                    )}
                </MotionBox>
            </div>
        );
    })
);
const Floor = ({ className }) => (
    <div
        className={clsx("absolute w-full h-[1000px] bg-stone-900", className)}
        style={{
            backgroundImage:
                `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='0.2'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                `linear-gradient(rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5)),` +
                `linear-gradient(to right, rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5))`,
        }}
    ></div>
);

const Wall = ({ className }) => (
    <div
        className={clsx("absolute w-[1000px] h-full bg-stone-900", className)}
        style={{
            backgroundImage:
                `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='1'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                `linear-gradient(rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5)),` +
                `linear-gradient(to right, rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5))`,
        }}
    ></div>
);

const getRandomPainting = () => {
    if (Math.random() > 0.5) return null;
    return {
        index: random(paintings.length - 1),
        isRight: Math.random() > 0.5,
    };
};
const Painting = ({ index }) => {
    const { src, width, height } = paintings[index];
    const wClass = { 1: "w-16", 2: "w-32", 4: "w-64" }[width];
    const hClass = { 1: "h-16", 2: "h-32", 4: "h-64" }[height];
    return (
        <Image src={src} alt="Minecraft Painting" className={clsx("shadow-xl", wClass, hClass)} />
    );
};

function PaperMap({ path, onNext }) {
    return (
        <motion.div
            onClick={onNext}
            className="absolute flex flex-col preserve-3d"
            initial="closed"
            whileHover="open"
            variants={{
                open: { y: 75, rotateX: 15 },
                closed: { rotateX: 0, x: -250, y: 125, z: 500 },
            }}
        >
            <motion.div
                className="relative w-48 h-32 origin-bottom bg-yellow-100 border-2 border-yellow-200 pointer-events-none preserve-3d"
                variants={{ open: { rotateX: -10 }, closed: { rotateX: -160 } }}
            >
                <div className="h-full p-2 overflow-hidden font-mono text-yellow-600">
                    {path.map((node, i) => (
                        <div key={i} className="">
                            {i + 1}. {node}
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 bg-yellow-100 [transform:translateZ(-1px)]" />
            </motion.div>
            <motion.div className="relative w-48 h-32 overflow-hidden bg-yellow-100 border-2 border-yellow-200 pointer-events-none">
                <div className="absolute h-full p-2 font-mono text-yellow-600 -top-32">
                    {path.map((node, i) => (
                        <div key={i} className="">
                            {i + 1}. {node}
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

const bookHalfVariants = {
    open: (isRight) => ({ rotateY: isRight ? -15 : 15 }),
    closed: (isRight) => ({ rotateY: isRight ? -85 : 85 }),
};
const Book = motion(
    forwardRef(function Book({ className }, ref) {
        return (
            <motion.div
                className={clsx("absolute flex preserve-3d", className)}
                animate={{ x: 250, y: 150, z: 500, rotateZ: 90 }}
                initial="closed"
                whileHover="open"
            >
                <MotionBox
                    custom={false}
                    className="origin-right"
                    depth={10}
                    sideClass="bg-rose-950"
                    baseClass="bg-rose-950 border-2 border-rose-600"
                    borderWidth={1}
                    borderClass="bg-rose-600"
                    variants={bookHalfVariants}
                >
                    <div className="p-2 pr-0 border bg-rose-700 border-rose-950">
                        <div className="w-32 h-40 bg-yellow-100" />
                    </div>
                </MotionBox>
                <MotionBox
                    custom={true}
                    className="origin-left"
                    depth={10}
                    sideClass="bg-rose-950"
                    baseClass="bg-rose-950 border-2 border-rose-600"
                    borderWidth={1}
                    borderClass="bg-rose-600"
                    // variants={bookHalfVariants}
                >
                    <div className="p-2 pl-0 border bg-rose-700 border-rose-950">
                        <div className="w-32 h-40 bg-yellow-100" />
                    </div>
                </MotionBox>
            </motion.div>
        );
    })
);

export default function Day12() {
    const { lines, isPartOne } = useContext(ChallengeContext);

    const nodes = new Set();
    const neighbors = new Map();

    lines.forEach((s) => {
        const [from, to] = s.split("-");
        nodes.add(from);
        nodes.add(to);
        addEdge(neighbors, from, to);
        addEdge(neighbors, to, from);
    });

    // Dummy node
    addEdge(neighbors, "dummy", "start");

    const paths = dfs(neighbors, "start", [], !isPartOne);
    const [pathIndex, setPathIndex] = useState(0);

    const [currentNode, setCurrentNode] = useState("dummy");
    const [currentPath, setCurrentPath] = useState([]);
    const [openDoor, setOpenDoor] = useState(null);
    const [randomPainting, setRandomPainting] = useState(null);

    const wallRef = useRef();
    const doorRefs = useRef(new Map());

    const [ref, animate] = useAnimate();
    const handleClick = async (node) => {
        setOpenDoor(node);

        const wallBox = wallRef.current.getBoundingClientRect();
        const doorBox = doorRefs.current.get(node).getBoundingClientRect();

        const x = doorBox.x - (wallBox.x + wallBox.width / 2) + 64;
        console.log({ doorBox: doorBox.x, wallBox: wallBox.width / 2, x });

        animate(
            ref.current,
            { y: [null, -15, 15] },
            { type: "tween", repeat: Infinity, repeatType: "mirror", duration: 0.5 }
        );
        await animate(ref.current, { x: -x, z: 1000 }, { duration: 1.5 });

        setCurrentNode(node);
        setCurrentPath(currentPath.concat(node));
        setOpenDoor(null);
        setRandomPainting(getRandomPainting());
    };

    const handleReset = () => {
        setCurrentNode("dummy");
        setCurrentPath([]);
        setOpenDoor(null);
        setRandomPainting(null);
    };

    let painting = randomPainting ? <Painting index={randomPainting.index} /> : null;

    return (
        <div className="flex flex-col justify-center items-center overflow-hidden perspective-[1000px] -m-4 h-[calc(100%+2rem)]">
            <motion.div
                key={currentNode}
                ref={ref}
                className={clsx(
                    "flex items-center justify-center bg-stone-900 preserve-3d px-16",
                    randomPainting?.isRight && "flex-row-reverse"
                )}
                style={{
                    backgroundImage:
                        `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='1'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                        `linear-gradient(rgba(0,0,0,0.25),transparent 10%, 90%, rgba(0,0,0,0.25)),` +
                        `linear-gradient(to right, rgba(0,0,0,0.25),transparent 10%, 90%, rgba(0,0,0,0.25))`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
            >
                <div
                    className={clsx(
                        "flex w-64",
                        randomPainting?.isRight ? "justify-start" : "justify-end"
                    )}
                >
                    {painting}
                </div>
                <div
                    ref={wallRef}
                    className="flex justify-center h-full gap-32 pt-16 mx-16 preserve-3d"
                >
                    {neighbors.get(currentNode).map((node) => {
                        const canMove = isBig(node) || !currentPath.includes(node);
                        return (
                            <Door
                                key={node}
                                name={node}
                                onClick={() => handleClick(node)}
                                ref={(elem) => {
                                    if (!elem) doorRefs.current.delete(node);
                                    else doorRefs.current.set(node, elem);
                                }}
                                whileHover={canMove && "open"}
                                animate={openDoor === node && "open"}
                                disabled={!canMove}
                            />
                        );
                    })}
                </div>
                <div className="w-64" />

                <Floor className="bottom-0 origin-bottom -rotate-x-90" />
                <Floor className="top-0 origin-top rotate-x-90" />
                <Wall className="left-0 origin-left -rotate-y-90" />
                <Wall className="right-0 origin-right rotate-y-90" />
            </motion.div>
            <motion.button
                onClick={handleReset}
                className="absolute bottom-0 self-center p-2 rounded-md shadow-lg shadow-stone-950/50 bg-zinc-600"
                initial={{ y: 250 }}
                animate={{ y: -50 }}
                whileHover={{ scale: 1.25, backgroundColor: "#a1a1aa" }}
                whileTap={{ scale: 1 }}
                transition={{ type: "spring" }}
            >
                <ArrowPathIcon className="w-12 h-12 fill-zinc-500" />
            </motion.button>

            <motion.div
                className="absolute bottom-0 right-0 flex flex-col items-center w-24 gap-1 p-2 m-4 font-mono rounded-md bg-stone-700"
                layout
            >
                {currentPath.toReversed().map((node, i) => (
                    <motion.div
                        className={clsx(
                            "w-full text-lg text-center rounded-sm",
                            isBig(node) ? "bg-slate-500" : "bg-zinc-500"
                        )}
                        key={currentPath.length - i - 1}
                        initial={{ x: 250 }}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                    >
                        {node}
                    </motion.div>
                ))}
            </motion.div>
            {/* <Book className="" /> */}
            <PaperMap
                path={paths[pathIndex]}
                onNext={() => setPathIndex((pathIndex + 1) % paths.length)}
            />
        </div>
    );
}
