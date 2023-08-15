import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Box } from "/app/components/shapes/Box";
import clsx from "clsx";

const MotionBox = motion(Box);

const Tape = ({ className }) => (
    <div
        className={clsx("absolute h-4 w-48 bg-yellow-300", className)}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2309090a' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
    ></div>
);

export const Door = motion(
    forwardRef(function Door({ name, type, disabled, onClick }, ref) {
        // let colors = "[--primary:#3f3f46] [--lighter:#52525b] [--darker:#27272a]";
        let colors = "[--primary:#7b5f36] [--lighter:#b18a4e] [--darker:#67502d]";
        if (type === "end") {
            colors = "[--primary:#991b1b] [--lighter:#b91c1c] [--darker:#7f1d1d]";
        } else if (type === "big") {
            colors = "[--primary:#334155] [--lighter:#475569] [--darker:#1e293b]";
        }

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
