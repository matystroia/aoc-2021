"use client";

import { useEffect } from "react";
import { useCanvas } from "app/hooks/useCanvas";
import { ObjectInspector } from "app/components/ObjectInspector";
import { useFile } from "app/hooks/useFile";

export default function Day1() {
    const { lines } = useFile("day1");
    const { wrapperRef, canvasRef, canvasProps } = useCanvas();

    const values = lines ? lines.map((x) => parseInt(x)) : [];

    function part1() {
        let ans = 0;
        for (let i = 1; i < values.length; i++) {
            if (values[i] > values[i - 1]) ans += 1;
        }

        return ans;
    }
    const increases = part1();

    function part2() {
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
    const windowIncreases = part2();

    // TODO: Should probably include size in dependency array
    useEffect(() => {
        const { width, height } = canvasProps;

        const [minValue, maxValue] = [values[0], values[values.length - 1]];
        const [minY, maxY, minX, maxX] = [50, height - 50, 50, width - 50];

        const normalizedValues = values
            .map((v) => v - minValue)
            .map((v) => minY + (v / (maxValue - minValue)) * (maxY - minY));

        const coords = normalizedValues.map((y, x) => ({
            x: minX + (x / normalizedValues.length) * (maxX - minX),
            y,
        }));

        const ctx = canvasRef.current.getContext("2d");
        coords.forEach(({ x, y }, i) => {
            const prevCoords = i == 0 ? { x: minX, y: minY } : coords[i - 1];
            ctx.beginPath();
            ctx.moveTo(prevCoords.x, prevCoords.y);

            ctx.strokeStyle = i > 0 && y > coords[i - 1].y ? "green" : "red";

            ctx.lineTo(x, y);
            ctx.stroke();
        });

        return () => ctx.reset();
    });

    // TODO: Add zoom and pan
    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex basis-1/4 gap-4">
                <div className="round-grid flex-grow p-2">
                    <h1 className="text-lg font-mono text-center">Part One</h1>
                    <ObjectInspector>
                        {{
                            increases,
                        }}
                    </ObjectInspector>
                </div>
                <div className="round-grid flex-grow p-2">
                    <h1 className="text-lg font-mono text-center">Part Two</h1>
                    <ObjectInspector>
                        {{
                            windowIncreases,
                        }}
                    </ObjectInspector>
                </div>
            </div>
            <div ref={wrapperRef} className="flex-grow box-border overflow-hidden basis-3/4">
                <canvas {...canvasProps} className="canvas-grid" />
            </div>
        </div>
    );
}
