import { motion } from "framer-motion";
import { RegularPolygon } from "../../components/shapes/RegularPolygon";
import clsx from "clsx";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export function PocketWatch({ onReset }) {
    return (
        <motion.div
            className="absolute w-64 h-64 cursor-pointer center preserve-3d"
            initial="closed"
            whileHover="open"
            whileTap={{ y: 325 }}
            // animate="open"
            variants={{ closed: { rotateX: 15, y: 400, x: 250 }, open: { rotateX: 45, y: 300 } }}
            onClick={onReset}
        >
            <motion.div
                className="origin-top pointer-events-none preserve-3d"
                style={{ z: 30 }}
                variants={{ closed: { rotateX: 15 }, open: { rotateX: 120 } }}
            >
                <RegularPolygon
                    edges={12}
                    width={175}
                    height={175}
                    topClass="bg-[#c57759]"
                    depth={10}
                    sideClass="bg-[#954839]"
                    // topBorder={{ width: 2, borderClass: "bg-[#381412]" }}
                    sideBorder={{ width: 1, borderClass: "bg-[#793c33]" }}
                    renderBase={({ className, style }) => (
                        <div className={clsx(className, "bg-[#62332c]")} style={style} />
                    )}
                />
            </motion.div>
            <motion.div className="absolute pointer-events-none preserve-3d">
                <RegularPolygon
                    edges={12}
                    width={175}
                    height={175}
                    topClass="bg-[#62332c]"
                    depth={30}
                    sideClass="bg-[#954839]"
                    // topBorder={{ width: 2, borderClass: "bg-[#341816]" }}
                    sideBorder={{ width: 1, borderClass: "bg-[#793c33]" }}
                    renderBase={({ className, style }) => (
                        <motion.div
                            className={clsx(className, "center")}
                            style={{ ...style, z: 30 }}
                            variants={{ closed: { rotate: 0 }, open: { rotate: 360 } }}
                            transition={{ duration: 1, type: "spring" }}
                        >
                            {/* <ArrowPathIcon className="w-24 h-24 fill-[#341816]" /> */}
                            <div className="w-full h-full scale-75 rounded-full flex justify-center bg-[#341816]">
                                <div
                                    className="w-4 translate-y-2 border-4 border-transparent bg-rose-700 h-1/2"
                                    style={{
                                        clipPath:
                                            "polygon(50% 0, 100% 80%, 50% 100%, 0 80%, 0 100%)",
                                    }}
                                />
                                <div
                                    className="absolute w-4 rotate-180 -translate-y-2 border-4 border-transparent bg-rose-200 h-1/2 top-1/2"
                                    style={{
                                        clipPath:
                                            "polygon(50% 0, 100% 80%, 50% 100%, 0 80%, 0 100%)",
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                />
            </motion.div>
        </motion.div>
    );
}
