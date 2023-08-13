"use client";

import { useState, useContext, useRef, forwardRef } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { motion, useAnimate } from "framer-motion";
import { Box } from "../../components/shapes/Box";
import clsx from "clsx";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

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
        className={clsx("absolute h-4 w-48 bg-yellow-500", className)}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2309090a' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
    ></div>
);

const Door = motion(
    forwardRef(function Door({ name, disabled, onClick }, ref) {
        const isBigRoom = isBig(name);
        const isEndRoom = name === "end";

        let colors = "[--primary:#3f3f46] [--lighter:#52525b] [--darker:#27272a]";
        if (isEndRoom) colors = "[--primary:#991b1b] [--lighter:#b91c1c] [--darker:#7f1d1d]";
        if (isBigRoom) colors = "[--primary:#334155] [--lighter:#475569] [--darker:#1e293b]";

        return (
            <div
                ref={ref}
                className={clsx(
                    "relative h-64 cursor-pointer center preserve-3d",
                    isBigRoom ? "w-40" : "w-32",
                    colors
                )}
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
                    <div className="flex justify-center w-full h-full border-2 border-[color:--darker] bg-[--primary] bg-gradient-to-t from-stone-950/20">
                        <div className="self-start w-16 mt-8 font-mono text-center bg-[--lighter] text-[color:--darker]">
                            {name}
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

const Wall = ({ className }) => (
    <div
        className={clsx("absolute w-full h-[1000px] bg-stone-900", className)}
        style={{
            backgroundImage:
                `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='0.2'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                `linear-gradient(rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5))`,
        }}
    ></div>
);

const bookHalfVariants = {
    open: (isRight) => ({ rotateY: isRight ? -15 : 15 }),
    closed: (isRight) => ({ rotateY: isRight ? -85 : 85 }),
};

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

    const [currentNode, setCurrentNode] = useState("dummy");
    const [currentPath, setCurrentPath] = useState([]);
    const [openDoor, setOpenDoor] = useState(null);

    const doorRefs = useRef(new Map());

    const [ref, animate] = useAnimate();
    const handleClick = async (node) => {
        setOpenDoor(node);

        const wallBox = ref.current.getBoundingClientRect();
        const doorBox = doorRefs.current.get(node).getBoundingClientRect();

        const x = doorBox.x - wallBox.width / 2;

        animate(
            ref.current,
            { y: [null, -15, 15] },
            { type: "tween", repeat: Infinity, repeatType: "mirror", duration: 0.5 }
        );
        await animate(ref.current, { x: -x, z: 1000 }, { duration: 1.5 });

        setCurrentNode(node);
        setCurrentPath(currentPath.concat(node));
        setOpenDoor(null);
    };

    const handleReset = () => {
        setCurrentNode("dummy");
        setCurrentPath([]);
        setOpenDoor(null);
    };

    return (
        <div className="flex flex-col justify-center overflow-hidden perspective-[1000px] -m-4 h-[calc(100%+2rem)]">
            <motion.div
                key={currentNode}
                ref={ref}
                className="flex items-center justify-center gap-32 pt-16 bg-stone-900 preserve-3d"
                style={{
                    backgroundImage:
                        `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='1'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                        `linear-gradient(rgba(0,0,0,0.25),transparent 10%, 90%, rgba(0,0,0,0.25))`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
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
                <Wall className="bottom-0 origin-bottom -rotate-x-90" />
                <Wall className="top-0 origin-top rotate-x-90" />
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
                className="absolute bottom-0 right-0 flex flex-col items-center w-24 gap-1 p-2 m-4 font-mono border rounded-md border-white/50 bg-stone-700"
                layout
            >
                {currentPath.toReversed().map((node, i) => (
                    <motion.div
                        className={clsx(
                            "w-full text-lg text-center rounded-sm border border-black/50",
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

            <motion.div
                className="absolute flex preserve-3d"
                animate={{ x: 250, y: 150, rotateX: 45, z: 500 }}
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
                    <div className="p-2 border bg-rose-700 border-rose-950">
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
                    variants={bookHalfVariants}
                >
                    <div className="p-2 border bg-rose-700 border-rose-950">
                        <div className="w-32 h-40 bg-yellow-100" />
                    </div>
                </MotionBox>
            </motion.div>
        </div>
    );
}
