import { forwardRef } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { noop } from "lodash";

const PaperHalf = motion(
    forwardRef(function PaperHalf({ isTop, className, children }, ref) {
        return (
            <motion.div
                ref={ref}
                className={clsx(
                    "relative w-80 h-64 bg-yellow-100 border-4 border-yellow-200 pointer-events-none preserve-3d",
                    className
                )}
                custom={isTop}
                variants={{
                    open: (isTop) => isTop && { rotateX: -10 },
                    closed: (isTop) => isTop && { rotateX: -160 },
                }}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23fde047' fill-opacity='1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
                }}
            >
                {/* So text doesn't show through */}
                {isTop && (
                    <div className="absolute w-full h-full bg-yellow-100 [transform:translateZ(-1px)]" />
                )}

                {children}
            </motion.div>
        );
    })
);

function Content({ isTop, path, pathIndex, onPrev = noop, onNext = noop, className }) {
    return (
        <div
            className={clsx(
                "w-full flex flex-col p-4 font-mono text-yellow-600 text-xl",
                isTop ? "h-full" : "h-[200%]",
                className
            )}
        >
            <div className="flex flex-col flex-grow">
                {path.map((node, i) => (
                    <div key={i} className="">
                        {i + 1}. {node}
                    </div>
                ))}
            </div>
            {!isTop && (
                <div className="flex justify-between w-full">
                    <ArrowLongLeftIcon className="w-8 h-8 cursor-pointer" onClick={onPrev} />
                    {pathIndex}
                    <ArrowLongRightIcon className="w-8 h-8 cursor-pointer" onClick={onNext} />
                </div>
            )}
        </div>
    );
}

export function PaperMap({ path, pathIndex, onPrev, onNext }) {
    return (
        <motion.div
            className="absolute flex flex-col pointer-events-none preserve-3d"
            initial="closed"
            whileHover="open"
            variants={{
                open: { y: 150, rotateX: 15 },
                closed: { rotateX: 0, x: -250, y: 300, z: 0 },
            }}
        >
            <PaperHalf isTop className="origin-bottom">
                <Content isTop path={path} pathIndex={pathIndex} className="overflow-hidden" />
            </PaperHalf>
            <PaperHalf className="overflow-hidden pointer-events-auto">
                <Content
                    path={path}
                    pathIndex={pathIndex}
                    onPrev={onPrev}
                    onNext={onNext}
                    className="absolute -top-full"
                />
            </PaperHalf>
        </motion.div>
    );
}
