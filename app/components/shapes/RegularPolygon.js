import clsx from "clsx";
import { Polygon } from "./Polygon";
import { ExtrudedPolygonPath } from "./ExtrudedPolygonPath";
import { memo } from "react";

// Harder than it looks. Thank you to Wikipedia:
// https://en.wikipedia.org/wiki/Regular_polygon
// export const RegularPolygon = memo(function RegularPolygon({ edges, ...props }) {
//     const { width } = props;

//     const angleSum = (edges - 2) * Math.PI;
//     const internalAngle = angleSum / edges;
//     const externalAngle = (2 * Math.PI) / edges;

//     const edgeLength = Math.floor(width * Math.sin(Math.PI / edges));

//     // Could probably just do transformOrigin: apothem
//     const apothem = edgeLength / (2 * Math.tan(Math.PI / edges));

//     const sides = [{ x: 0, y: 0, angle: 0, internalAngle, length: edgeLength }];
//     for (let i = 1; i < edges; i++) {
//         sides.push({
//             x: sides[i - 1].x + edgeLength * Math.cos(sides[i - 1].angle),
//             y: sides[i - 1].y + edgeLength * Math.sin(sides[i - 1].angle),
//             angle: sides[i - 1].angle + externalAngle,
//             internalAngle,
//             length: edgeLength,
//         });
//     }

//     const polygonHeight = edges % 2 == 0 ? apothem * 2 : width / 2 + apothem;

//     // No idea why triangles behave differently than other polygons, I've spent way too much time trying to figure it out
//     const xOffset = (width - edgeLength) / 2;
//     const yOffset = edges == 3 ? width - polygonHeight : (width - polygonHeight) / 2;

//     return <Polygon edges={sides} offset={{ x: xOffset, y: yOffset }} {...props} />;
// });

export const RegularPolygon = memo(function RegularPolygon({ n, ...props }) {
    const { width, height = width } = props;

    const externalAngle = (2 * Math.PI) / n;

    const path = [];
    for (let i = 0; i < n; i++) {
        path.push({
            x: ((Math.cos(i * externalAngle) + 1) / 2) * width,
            y: ((Math.sin(i * externalAngle) + 1) / 2) * height,
        });
    }

    return <ExtrudedPolygonPath path={path} {...props} />;
});
