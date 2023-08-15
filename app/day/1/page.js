"use client";

import { useEffect, useContext } from "react";
import { Canvas, CanvasContext } from "../../components/Canvas";
import { useCanvas } from "app/hooks/useCanvas";
import { ObjectInspector } from "app/components/ObjectInspector";
import { ChallengeContext } from "../ChallengeWrapper";

function part1(values) {
    let ans = 0;
    for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i - 1]) ans += 1;
    }

    return ans;
}

function part2(values) {
    let ans = 0;
    for (let i = 3; i < values.length; i++) {
        if (
            values[i - 3] + values[i - 2] + values[i - 1] <
            values[i - 2] + values[i - 1] + values[i]
        )
            ans += 1;
    }

    return ans;
}

export default function Day1() {
    const { lines } = useContext(ChallengeContext);
    const values = lines.map((s) => parseInt(s));

    const increases = part1(values);
    const windowIncreases = part2(values);

    // TODO: Should probably include size in dependency array
    // useEffect(() => {
    //     const { width, height } = canvasProps;

    //     const [minValue, maxValue] = [values[0], values[values.length - 1]];
    //     const [minY, maxY, minX, maxX] = [50, height - 50, 50, width - 50];

    //     const normalizedValues = values
    //         .map((v) => v - minValue)
    //         .map((v) => minY + (v / (maxValue - minValue)) * (maxY - minY));

    //     const coords = normalizedValues.map((y, x) => ({
    //         x: minX + (x / normalizedValues.length) * (maxX - minX),
    //         y,
    //     }));

    //     const ctx = canvasRef.current.getContext("2d");
    //     coords.forEach(({ x, y }, i) => {
    //         const prevCoords = i == 0 ? { x: minX, y: minY } : coords[i - 1];
    //         ctx.beginPath();
    //         ctx.moveTo(prevCoords.x, prevCoords.y);

    //         ctx.strokeStyle = i > 0 && y > coords[i - 1].y ? "green" : "red";

    //         ctx.lineTo(x, y);
    //         ctx.stroke();
    //     });

    //     return () => ctx.reset();
    // });

    const draw = (ctx, { width, height }) => {
        const canvasContext = new CanvasContext(ctx, width, height);

        // const [minValue, maxValue] = [values[0], values[values.length - 1]];
        // const [minY, maxY, minX, maxX] = [50, height - 50, 50, width - 50];

        // const normalizedValues = values
        //     .map((v) => v - minValue)
        //     .map((v) => minY + (v / (maxValue - minValue)) * (maxY - minY));

        const coords = values.map((y, x) => ({ x, y }));
        canvasContext.fit(coords, 20);

        for (let i = 0; i < coords.length - 1; i++) {
            const curr = coords[i];
            const next = coords[i + 1];

            canvasContext.ctx.lineWidth = 2;
            canvasContext.ctx.strokeStyle = next.y > curr.y ? "green" : "red";
            canvasContext.line(curr, next);
        }
    };

    // TODO: Add zoom and pan
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex gap-4 basis-1/4">
                <div className="flex-grow p-2 border-2 rounded-xl border-slate-500 bg-zinc-900">
                    <h1 className="font-mono text-lg text-center">Part One</h1>
                    <ObjectInspector>
                        {{
                            increases,
                        }}
                    </ObjectInspector>
                </div>
                <div className="flex-grow p-2 border-2 rounded-xl border-slate-500 bg-zinc-900">
                    <h1 className="font-mono text-lg text-center">Part Two</h1>
                    <ObjectInspector>
                        {{
                            windowIncreases,
                        }}
                    </ObjectInspector>
                </div>
            </div>

            <Canvas onDraw={draw} className="flex-grow" />
        </div>
    );
}
