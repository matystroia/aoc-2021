import { motion } from "framer-motion";

import { ExtrudedPolygonPath } from "../../components/shapes/ExtrudedPolygonPath";
import { RegularPolygon } from "../../components/shapes/RegularPolygon";

import { ScannerCube } from "./ScannerCube";

export function ScannerDevice({ beacons }) {
    return (
        <div className="flex flex-col preserve-3d -rotate-x-45">
            <motion.div
                className="preserve-3d"
                animate={{ rotateY: [0, 360] }}
                transition={{
                    repeat: Infinity,
                    type: "tween",
                    ease: "linear",
                    duration: 10,
                }}
            >
                <ScannerCube beacons={beacons} />
                <ExtrudedPolygonPath
                    path={[
                        { x: 0, y: 0 },
                        { x: "100%", y: 0 },
                        { x: "100%", y: "100%" },
                        { x: 0, y: "100%" },
                    ]}
                    className="mt-[32px] rotate-x-90"
                    depth={100}
                    n={4}
                    width={128}
                    height={128}
                    // sideClass="bg-blue-950"
                    sideBorder={{ width: 1, borderClass: "bg-blue-500" }}
                    angle={120}
                />
            </motion.div>

            <RegularPolygon
                className="-mt-20 rotate-x-90"
                n={5}
                topClass="bg-pink-500"
                width={128}
                height={128}
                depth={20}
                sideClass="bg-pink-950"
                angle={75}
            />
        </div>
    );
}
