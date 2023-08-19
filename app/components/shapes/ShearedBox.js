import { memo } from "react";

import { Polygon } from "./Polygon";

export const ShearedBox = memo(function ShearedBox({ shear = 0, ...props }) {
    const { width, height } = props;

    const shearWidth = Math.sqrt(2) * shear;
    const sideWidth = width - 2 * shear;
    const sideHeight = height - 2 * shear;

    // TODO: ...
    const edges = [
        { x: shear, y: 0, angle: 0, internalAngle: Math.PI / 2, length: sideWidth },

        {
            x: shear + sideWidth,
            y: 0,
            angle: (1 / 4) * Math.PI,
            internalAngle: Math.PI / 4,
            length: shearWidth,
        },

        {
            x: width,
            y: shear,
            angle: Math.PI / 2,
            internalAngle: Math.PI / 2,
            length: sideHeight,
        },

        {
            x: width,
            y: shear + sideHeight,
            angle: (3 / 4) * Math.PI,
            internalAngle: Math.PI / 4,
            length: shearWidth,
        },

        {
            x: width - shear,
            y: height,
            angle: Math.PI,
            internalAngle: Math.PI / 2,
            length: sideWidth,
        },

        {
            x: shear,
            y: height,
            angle: (5 / 4) * Math.PI,
            internalAngle: Math.PI / 4,
            length: shearWidth,
        },

        {
            x: 0,
            y: height - shear,
            angle: (3 / 2) * Math.PI,
            internalAngle: Math.PI / 2,
            length: sideHeight,
        },

        {
            x: 0,
            y: shear,
            angle: (7 / 4) * Math.PI,
            internalAngle: Math.PI / 4,
            length: shearWidth,
        },
    ];

    return <Polygon edges={edges} {...props} />;
});
