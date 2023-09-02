import { motion, useMotionTemplate, useTransform } from "framer-motion";

export function SeaFloorRamp({ from, to, toAnimated, gap }) {
    const getRampLength = (h1, h2) => Math.floor(Math.sqrt((h1 - h2) * (h1 - h2) + gap * gap));
    const getAngle = (h1, h2) => -Math.atan((h2 - h1) / gap);

    const rampLength = useTransform(toAnimated, (h) => getRampLength(from, h));
    const angle = useTransform(toAnimated, (h) => getAngle(from, h));
    const rotation = useMotionTemplate`rotateY(${angle}rad)`;

    // const rampLength = getRampLength(from, to);
    // const angle = getAngle(from, to);

    return (
        <>
            <motion.div
                className="absolute top-0 h-full origin-right bg-emerald-700 right-full"
                style={{ width: rampLength, transform: rotation }}
            ></motion.div>

            {/* <motion.div
                className="absolute origin-top bg-pink-900 border-2 top-full right-full border-stone-800"
                style={{
                    width: gap,
                    clipPath: `polygon(${polygonPath}, 100% 100%, 0 100%)`,
                    transform: `rotateX(-90deg) translateY(-${Math.max(0, from - to)}px)`,
                    height: Math.max(from, to),
                }}
            /> */}
        </>
    );
}
