import { useState, forwardRef } from "react";
import { motion, useAnimation } from "framer-motion";
import clsx from "clsx";

import { ExtrudedPolygonPath } from "../../components/shapes/ExtrudedPolygonPath";
import { RegularPolygon } from "../../components/shapes/RegularPolygon";

import { ScannerCube } from "./ScannerCube";
import { RoundButton } from "./RoundButton";
import { RockerSwitch } from "./RockerSwitch";

function SwitchSide({ isOn, ledClass, onSwitchClick, onButtonClick }) {
    return (
        <div className="flex-col w-full h-full gap-2 rotate-180 center preserve-3d">
            <div
                className={clsx(
                    "absolute w-4 h-4 rounded right-6 top-1 m-2 border border-zinc-600",
                    ledClass
                )}
            />
            <div className="flex items-center justify-center w-full gap-8 preserve-3d">
                <div className="preserve-3d -translate-z-3">
                    <RockerSwitch
                        animate={isOn ? { rotateX: 6 } : { rotateX: -6 }}
                        onClick={onSwitchClick}
                    />
                    <div className="absolute inset-y-0 bg-zinc-950 -inset-x-1 translate-z-3" />
                </div>
                <div className="preserve-3d">
                    <RoundButton whileTap={{ z: -5 }} onClick={onButtonClick} />
                    <div className="absolute rounded-full -inset-0.5 bg-zinc-950" />
                </div>
            </div>
        </div>
    );
}

const height = 75;
const width = 128;
const angleRad = Math.atan(width / 2 / height) + Math.PI / 2;
const angleDeg = Math.floor((angleRad * 180) / Math.PI);

const Hologram = motion(
    forwardRef(function Hologram({ matchingBeacons, beacons }, ref) {
        return (
            <div className="w-full h-full center preserve-3d -rotate-x-90">
                <div ref={ref} className="preserve-3d">
                    <ExtrudedPolygonPath
                        path={[
                            { x: 0, y: 0 },
                            { x: "100%", y: 0 },
                            { x: "100%", y: "100%" },
                            { x: 0, y: "100%" },
                        ]}
                        className="rotate-x-90"
                        depth={height}
                        n={4}
                        width={width}
                        sideClass="bg-cyan-500/5"
                        sideBorder={{ width: 1, borderClass: "bg-cyan-500" }}
                        angle={angleDeg}
                    >
                        <ScannerCube
                            width={width}
                            beacons={beacons}
                            matchingBeacons={matchingBeacons}
                            style={{ transform: `translateZ(${width / 2}px)` }}
                        />
                    </ExtrudedPolygonPath>
                </div>
                <div className="absolute w-8 h-8 rounded-lg bg-zinc-950 rotate-x-90" />
            </div>
        );
    })
);

export function ScannerDevice({ isMatching, beacons, matchingBeacons, onMatch }) {
    const controls = useAnimation();
    const [isOn, setIsOn] = useState(false);
    const handleSwitchClick = () => {
        if (isOn) {
            controls.stop();
            controls.start({ scaleY: 0 });
            setIsOn(false);
        } else {
            controls.start({
                rotateY: [0, 360],
                scaleY: [0, 1],
            });
            setIsOn(true);
        }
    };

    return (
        <div className="relative preserve-3d -rotate-x-0">
            <div className="relative -mt-2 rotate-x-90 preserve-3d">
                <RegularPolygon
                    className=""
                    n={4}
                    alpha={Math.PI / 4}
                    topClass="bg-zinc-600"
                    width={200}
                    height={200}
                    depth={100}
                    sideClass="bg-zinc-800"
                    topBorder={{ width: 1, borderClass: "bg-zinc-900" }}
                    sideBorder={{ width: 1, borderClass: "bg-zinc-900" }}
                    angle={75}
                    sides={[
                        {
                            index: 0,
                            side: (
                                <SwitchSide
                                    isOn={isOn}
                                    ledClass={
                                        isMatching ? "bg-yellow-500 animate-flash" : "bg-zinc-900"
                                    }
                                    onSwitchClick={handleSwitchClick}
                                    onButtonClick={onMatch}
                                />
                            ),
                        },
                    ]}
                >
                    <Hologram
                        beacons={beacons}
                        matchingBeacons={matchingBeacons}
                        animate={controls}
                        initial={{ scaleY: 0 }}
                        transition={{
                            rotateY: {
                                repeat: Infinity,
                                type: "tween",
                                ease: "linear",
                                duration: 10,
                            },
                            scaleY: {
                                type: "spring",
                                duration: 1,
                            },
                        }}
                    />
                </RegularPolygon>
            </div>
        </div>
    );
}
