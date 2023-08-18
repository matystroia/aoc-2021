import { NoSymbolIcon } from "@heroicons/react/24/solid";
import { Box } from "/app/components/shapes/Box";
import { motion } from "framer-motion";

export function Barrier() {
    return (
        <div className="preserve-3d">
            <motion.div animate={{ rotateX: -165, z: 10 }} className="origin-bottom preserve-3d">
                <Box depth={5} sideClass="bg-red-950">
                    <div className="w-16 h-20 text-white bg-red-600 border center border-red-950">
                        <div className="relative z-10">
                            <NoSymbolIcon className="w-14 h-14 fill-red-900" />
                        </div>
                    </div>
                </Box>
            </motion.div>
            <motion.div animate={{ rotateX: -15 }} className="origin-top preserve-3d">
                <Box depth={5} sideClass="bg-red-950">
                    <div className="w-16 h-20 bg-red-600 border-red-950"></div>
                </Box>
            </motion.div>
        </div>
    );
}
