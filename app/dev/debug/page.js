import clsx from "clsx";

import { ExtrudedPolygonPath } from "../../components/shapes/ExtrudedPolygonPath";
import { RegularPolygon } from "../../components/shapes/RegularPolygon";

export default function Debug() {
    return (
        <div className="w-full h-full center perspective-[1200px]">
            <div className="preserve-3d rotate-y-45">
                <ExtrudedPolygonPath
                    className="-rotate-x-[10]"
                    path={[
                        { x: 0, y: 0 },
                        { x: "100%", y: 0 },
                        { x: "100%", y: "100%" },
                        { x: 0, y: "100%" },
                    ]}
                    width={250}
                    height={250}
                    depth={50}
                    sideClass="bg-red-600"
                >
                    <div className="w-full h-full bg-red-500 center">
                        <div className="w-[16px] bg-red-400 h-1/2" />
                    </div>
                </ExtrudedPolygonPath>
                <ExtrudedPolygonPath
                    className="rotate-x-[10]"
                    path={[
                        { x: 0, y: 0 },
                        { x: "100%", y: 0 },
                        { x: "100%", y: "100%" },
                        { x: 0, y: "100%" },
                    ]}
                    topClass="bg-red-500"
                    width={250}
                    height={250}
                    depth={50}
                    sideClass="bg-red-600"
                    side={
                        <div className="w-full h-full bg-pink-500 preserve-3d center">
                            <RegularPolygon
                                className="bg-pink-500"
                                n={3}
                                alpha={Math.PI / 6}
                                topClass="bg-pink-500"
                                sideClass="bg-pink-950"
                                height={100}
                                width={100}
                                depth={50}
                            />
                        </div>
                    }
                >
                    <RegularPolygon
                        className="bg-pink-500"
                        n={3}
                        alpha={Math.PI / 6}
                        topClass="bg-pink-500"
                        sideClass="bg-pink-950"
                        height={100}
                        width={100}
                        depth={50}
                    />
                </ExtrudedPolygonPath>
            </div>
        </div>
    );
}
