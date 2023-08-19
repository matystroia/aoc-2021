import { motion } from "framer-motion";
import clsx from "clsx";

function Axis({ className }) {
    return (
        <div className={clsx("w-12 h-0.5", className)}>
            <div
                className="absolute w-3 h-3 -top-1.5 -right-3 bg-inherit"
                style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
            />
        </div>
    );
}

export function Axes({ rotationX, rotationY, rotationZ }) {
    return (
        <motion.div
            className="relative preserve-3d"
            style={{ rotateX: rotationX, rotateY: rotationY, rotateZ: rotationZ }}
        >
            <Axis className="absolute bottom-0 bg-red-500" />
            <Axis className="absolute bottom-0 origin-left -rotate-90 bg-green-500" />
            <Axis className="absolute bottom-0 origin-left bg-blue-500 -rotate-y-90" />
        </motion.div>
    );
}
