import { motion } from "framer-motion";
import { forwardRef } from "react";

export const Periscope = forwardRef(function Periscope(props, ref) {
    return (
        <motion.div ref={ref} {...props}>
            <div className="relative z-50 w-10 h-40 border-t-[6px] border-zinc-400 bg-zinc-500">
                <div className="absolute w-16 h-10 rounded-tr-full top-[-45px] -left-6 bg-zinc-500">
                    <div className="absolute top-0 w-4 h-10 rounded-full bg-blue-950 -left-2 center">
                        <div className="absolute w-2 h-8 bg-blue-800 rounded-full" />
                    </div>
                </div>
                <div className="absolute flex justify-around w-full top-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                </div>
            </div>
        </motion.div>
    );
});
