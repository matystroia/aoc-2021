import { useEffect, useState } from "react";

export function useMovementAxis(negativeKey, positiveKey) {
    const [isNegativePressed, setIsNegativePressed] = useState(false);
    const [isPositivePressed, setIsPositivePressed] = useState(false);

    useEffect(() => {
        const handleDown = (e) => {
            if (e.key === negativeKey) setIsNegativePressed(true);
            if (e.key === positiveKey) setIsPositivePressed(true);
        };
        const handleUp = (e) => {
            if (e.key === negativeKey) setIsNegativePressed(false);
            if (e.key === positiveKey) setIsPositivePressed(false);
        };

        document.addEventListener("keydown", handleDown);
        document.addEventListener("keyup", handleUp);
        return () => {
            document.removeEventListener("keydown", handleDown);
            document.removeEventListener("keyup", handleUp);
        };
    }, [negativeKey, positiveKey]);

    return -Number(isNegativePressed) + Number(isPositivePressed);
}
