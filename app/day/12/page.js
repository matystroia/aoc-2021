"use client";

import { Door } from "./Door";
import { Wall, Floor } from "./Wall";
import { PaperMap } from "./PaperMap";
import { PocketWatch } from "./PocketWatch";
import { getRandomPainting, Painting } from "./Painting";

import { useState, useContext, useRef, useEffect } from "react";
import { ChallengeContext } from "../ChallengeWrapper";
import { motion, animate } from "framer-motion";
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

const parseInput = (lines) => {
    const nodes = new Set();
    const neighbors = new Map();

    lines.forEach((s) => {
        const [from, to] = s.split("-");
        nodes.add(from);
        nodes.add(to);
        addEdge(neighbors, from, to);
        addEdge(neighbors, to, from);
    });

    addEdge(neighbors, "dummy", "start");

    return { nodes, neighbors };
};

const perspective = 1000;

const animateBobbing = (ref) => {
    return animate(
        ref.current,
        { y: [null, -15, 15] },
        { type: "tween", repeat: Infinity, repeatType: "mirror", duration: 0.5 }
    );
};

export default function Day12() {
    const { lines, isPartOne } = useContext(ChallengeContext);
    const { nodes, neighbors } = parseInput(lines);

    const paths = dfs(neighbors, "start", [], !isPartOne);
    const [pathIndex, setPathIndex] = useState(0);

    const [currentNode, setCurrentNode] = useState("dummy");
    const [currentPath, setCurrentPath] = useState([]);
    const [openDoor, setOpenDoor] = useState(null);
    const [randomPainting, setRandomPainting] = useState(null);

    const wallRef = useRef();
    const doorRefs = useRef(new Map());

    const ref = useRef();
    const blackRef = useRef();
    const handleClick = async (node) => {
        setOpenDoor(node);

        const wallBox = wallRef.current.getBoundingClientRect();
        const doorBox = doorRefs.current.get(node).getBoundingClientRect();

        const x = doorBox.x - (wallBox.x + wallBox.width / 2) + 64;

        // Head bobbing
        const bobbing = animateBobbing(ref);
        // Walk to door
        await animate(ref.current, { x: -x, z: perspective }, { duration: 1.5 });
        bobbing.stop();

        // Stop flicker
        animate(blackRef.current, { opacity: 1 }, { duration: 0 });

        setCurrentNode(node);
        setCurrentPath(currentPath.concat(node));
        setOpenDoor(null);
        setRandomPainting(getRandomPainting());
    };

    useEffect(() => {
        // Fade from black
        animate(
            blackRef.current,
            { opacity: 0 },
            { from: 1, duration: 0.5, type: "tween", ease: "easeIn" }
        );

        // Walk into room
        const bobbing = animateBobbing(ref);
        animate(ref.current, { z: 0 }, { from: -perspective * 1.5, duration: 1 }).then(() =>
            bobbing.stop()
        );
    }, [ref, blackRef, currentNode]);

    const handleReset = () => {
        setCurrentNode("dummy");
        setCurrentPath([]);
        setOpenDoor(null);
        setRandomPainting(null);
    };

    return (
        <motion.div
            className="flex flex-col justify-center items-center overflow-hidden -m-4 h-[calc(100%+2rem)]"
            style={{ perspective }}
        >
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
                // initial={{ z: -perspective * 1.5 }}
                // animate={{ z: 0 }}
                // transition={{ duration: 1 }}
            >
                <div
                    className={clsx(
                        "flex w-64",
                        randomPainting?.isRight ? "justify-start" : "justify-end"
                    )}
                >
                    {randomPainting && <Painting index={randomPainting.index} />}
                </div>
                <div
                    ref={wallRef}
                    className="flex justify-center h-full gap-32 pt-16 mx-16 preserve-3d"
                >
                    {neighbors.get(currentNode).map((node) => {
                        const canMove = isBig(node) || !currentPath.includes(node);
                        const type = node === "end" ? "end" : isBig(node) ? "big" : "small";
                        return (
                            <Door
                                key={node}
                                name={node}
                                type={type}
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
                {/* To balance out painting */}
                <div className="w-64" />

                <Floor height={perspective * 2} className="bottom-0 origin-bottom -rotate-x-90" />
                <Floor height={perspective * 2} className="top-0 origin-top rotate-x-90" />
                <Wall width={perspective * 2} className="left-0 origin-left -rotate-y-90" />
                <Wall width={perspective * 2} className="right-0 origin-right rotate-y-90" />
            </motion.div>

            {/* To fade in new room */}
            <motion.div
                ref={blackRef}
                className="absolute inset-0 pointer-events-none bg-stone-950"
                style={{ opacity: 1 }}
            />

            {/* <motion.button
                onClick={handleReset}
                className="absolute bottom-0 self-center p-2 rounded-md shadow-lg shadow-stone-950/50 bg-zinc-600"
                initial={{ y: 250 }}
                animate={{ y: -50 }}
                whileHover={{ scale: 1.25, backgroundColor: "#a1a1aa" }}
                whileTap={{ scale: 1 }}
                transition={{ type: "spring" }}
            >
                <ArrowPathIcon className="w-12 h-12 fill-zinc-500" />
            </motion.button> */}

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

            <PaperMap
                path={paths[pathIndex]}
                pathIndex={`${pathIndex + 1} / ${paths.length}`}
                onPrev={() => setPathIndex(Math.max(0, pathIndex - 1))}
                onNext={() => setPathIndex(Math.min(paths.length - 1, pathIndex + 1))}
            />

            <PocketWatch onReset={handleReset} />
        </motion.div>
    );
}
