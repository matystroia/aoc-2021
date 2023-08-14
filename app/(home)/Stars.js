import { motion } from "framer-motion";
import { useRef } from "react";
import { useSize } from "../hooks/useSize";
import { random } from "lodash";
import clsx from "clsx";

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

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05 }}
        >
            {[...Array(50).keys()].map((i) => {
                const silverRatio = 0.618;
                const x = (silverRatio * i * width) % width;
                return <Star key={i} x={x + random(-10, 10)} y={Math.random() * height} />;
            })}
        </motion.div>
    );
}
