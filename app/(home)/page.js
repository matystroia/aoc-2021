"use client";

import { Calendar } from "./Calendar";
import { Waves } from "./Waves";
import { Stars } from "./Stars";
import { Periscope } from "./Periscope";

import {
    animate,
    motion,
    useAnimate,
    useMotionValue,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import { Title } from "./Title";
import { useRef, useState, useEffect } from "react";
import { random } from "lodash";
import { useSize } from "../hooks/useSize";

function Droplet({ initialX, initialY, deltaX, deltaY }) {
    const t = useMotionValue(Math.PI);
    const x = useTransform(t, (t) => {
        if (t > 2 * Math.PI) return initialX + deltaX;
        return ((Math.cos(t) + 1) / 2) * deltaX + initialX;
    });
    const y = useTransform(t, (t) => Math.sin(t) * deltaY + initialY);
    const rotate = useTransform(t, [Math.PI, 2 * Math.PI], [0, deltaX > 0 ? 180 : -180]);

    animate(t, 2.5 * Math.PI, { duration: 1, type: "tween" });

    return (
        <motion.div
            style={{ x, y, rotate }}
            className="absolute w-10 h-10 bg-blue-500 rounded-full"
        >
            <div className="absolute border-blue-500 border-[1.25rem] border-t-[2.5rem] top-6 border-x-transparent border-b-transparent" />
        </motion.div>
    );
}

export default function Page() {
    const wrapperRef = useRef();
    const { height } = useSize(wrapperRef);

    const { scrollY } = useScroll();
    const scrollSpring = useSpring(scrollY);
    const calendarY = useTransform(scrollSpring, (value) => value);

    const calendarRef = useRef();
    const { scrollYProgress } = useScroll({
        target: calendarRef,
        offset: ["center 0.4", "center 1"],
    });

    // Droplets
    const [droplets, setDroplets] = useState([]);
    useMotionValueEvent(scrollYProgress, "change", (value) => {
        if (value === 0) {
            const newDroplets = [];

            for (let i = 0; i < 3; i++) {
                // Left
                newDroplets.push({
                    initialX: -200,
                    deltaX: random(-300, -100),
                    deltaY: random(100, 250),
                });
                // Right
                newDroplets.push({
                    initialX: 200,
                    deltaX: random(100, 300),
                    deltaY: random(100, 250),
                });
            }

            setDroplets(newDroplets);
            setTimeout(() => setDroplets([]), 1000);
        }
    });

    // Periscope
    const [scope, animate] = useAnimate();
    useEffect(() => {
        const interval = setInterval(async () => {
            await animate(scope.current, { x: random(-500, 500) });
            await animate(scope.current, { y: random(0, 100) });
            await animate(scope.current, { scaleX: Math.random() > 0.5 ? 1 : -1 });
            await animate(scope.current, { y: 250 }, { delay: 1 });
        }, 5000);
        return () => clearInterval(interval);
    }, [scope, animate]);

    return (
        <main className="flex flex-col items-center w-screen overflow-x-hidden overflow-y-auto bg-slate-950">
            <div
                ref={wrapperRef}
                className="relative flex flex-col items-center justify-center w-full h-screen"
            >
                <Stars className="absolute inset-0 z-10" />

                <Title className="absolute top-0 z-30" />

                <Waves className="absolute inset-0 z-20">
                    <Calendar
                        ref={calendarRef}
                        className="w-3/4 max-w-4xl"
                        // initial={{ y: "100%" }}
                        // animate={{ y: -500 }}
                        style={{ y: calendarY }}
                        transition={{ delay: 4, duration: 2.5, bounce: 0.7, type: "spring" }}
                    />

                    <div className="absolute bottom-[250px]">
                        {droplets.map(({ initialX, deltaX, deltaY }, i) => (
                            <Droplet
                                key={i}
                                initialX={initialX}
                                initialY={0}
                                deltaX={deltaX}
                                deltaY={deltaY}
                            />
                        ))}
                    </div>

                    <Periscope ref={scope} className="absolute bottom-48" />
                </Waves>
            </div>

            <div className="relative z-40 flex flex-col w-full center bg-gradient-to-b from-blue-300 to-blue-600">
                <motion.article className="my-8 -mt-16 prose" initial={{ opacity: 1 }}>
                    <div className="relative p-4 border-2 text-slate-200 bg-slate-900 border-slate-800 before:absolute before:w-full before:h-full before:bg-slate-800 before:left-1.5 before:top-1.5 before:-z-10"></div>
                </motion.article>

                <motion.div
                    className="perspective-[1000px] mt-8 mb-16"
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delayChildren: 1 }}
                >
                    <Calendar
                        className="max-w-2xl"
                        variants={{
                            hidden: { opacity: 0, y: -250, z: -400 },
                            visible: { opacity: 1, y: 0, z: 0 },
                        }}
                        transition={{
                            type: "spring",
                            bounce: 0.5,
                            z: { type: "spring", duration: 1 },
                        }}
                    />
                </motion.div>
            </div>
        </main>
    );
}
