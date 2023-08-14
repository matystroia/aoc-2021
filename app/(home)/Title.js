import { motion } from "framer-motion";

export function Title({ className }) {
    return (
        <motion.div
            className={className}
            initial={{ y: "-110%" }}
            animate={{ y: 200 }}
            transition={{ type: "spring", duration: 1, bounce: 0.5 }}
        >
            <div className="z-10 p-4 prose border-2 bg-slate-900 border-slate-800">
                <h1 className="text-center text-slate-200">
                    Advent of Code <span className="">2021</span>
                </h1>
            </div>
            <div className="absolute w-full h-full bg-slate-800 top-1 left-1 -z-10" />
        </motion.div>
    );
}
