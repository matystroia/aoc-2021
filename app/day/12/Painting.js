import Image from "next/image";
import { random } from "lodash";
import clsx from "clsx";

import paintings from "../../../public/minecraft/paintings";

export const getRandomPainting = () => {
    if (Math.random() > 0.5) return null;
    return {
        index: random(paintings.length - 1),
        isRight: Math.random() > 0.5,
    };
};

export const Painting = ({ index }) => {
    const { src, width, height } = paintings[index];
    const wClass = { 1: "w-16", 2: "w-32", 4: "w-64" }[width];
    const hClass = { 1: "h-16", 2: "h-32", 4: "h-64" }[height];
    return (
        <Image src={src} alt="Minecraft Painting" className={clsx("shadow-xl", wClass, hClass)} />
    );
};
