import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { random } from "lodash";
import clsx from "clsx";

import { useSize } from "../hooks/useSize";

function Star({ x, y, className }) {
    return (
        <motion.div
            className={clsx("absolute text-[color:#ffff66] font-mono text-3xl", className)}
            style={{ x, y }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 3, when: "beforeChildren" }}
        >
            <motion.span
                variants={{
                    visible: {
                        opacity: 0.1,
                        transition: { repeat: Infinity, repeatType: "mirror", duration: 3 },
                    },
                }}
            >
                *
            </motion.span>
        </motion.div>
    );
}

export function Stars({ className }) {
    const ref = useRef();
    const { width, height } = useSize(ref);

    const points = useMemo(
        () =>
            [...Array(50).keys()].map((i) => {
                const silverRatio = 0.618;
                const x = ((silverRatio * i * width) % width) + random(-10, 10);
                const y = Math.random() * height;
                return { x, y };
            }),
        [height, width]
    );

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05 }}
        >
            {points.map(({ x, y }, i) => {
                return <Star key={i} x={x} y={y} />;
            })}
        </motion.div>
    );
}
