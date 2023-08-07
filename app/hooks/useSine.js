"use client";

import { useEffect, useState } from "react";

export function useSine(min, max, time) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const handleFrame = (t) => {
            setValue(min + ((Math.sin(t / (time * 1000)) + 1) / 2) * (max - min));
            request = requestAnimationFrame(handleFrame);
        };
        let request = requestAnimationFrame(handleFrame);
        return () => cancelAnimationFrame(request);
    }, [min, max, time]);

    return value;
}
