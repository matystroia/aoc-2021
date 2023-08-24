"use client";

import {
    useContext,
    useState,
    useEffect,
    experimental_useEffectEvent as useEffectEvent,
} from "react";
import { range } from "lodash";
import clsx from "clsx";

import { ChallengeContext } from "../ChallengeWrapper";
import { product } from "../../utils";

import { CloseUp } from "./CloseUp";
import { Pawn } from "./Pawn";
import { Track } from "./Track";
import { Buttons } from "./Buttons";

export const coords = (i) => [
    Math.cos(((2 * Math.PI) / 10) * i) * 150,
    Math.sin(((2 * Math.PI) / 10) * i) * 150,
];

const map = new Map();
function wins(i1, i2, s1, s2, isOne) {
    const key = `${i1},${i2},${s1},${s2},${isOne}`;
    if (map.has(key)) {
        return map
            .get(key)
            .split(",")
            .map((s) => parseInt(s));
    }

    if (s1 >= 21) return [1, 0];
    if (s2 >= 21) return [0, 1];

    const ret = [0, 0];
    for (const dice of product([1, 2, 3], [1, 2, 3], [1, 2, 3])) {
        const k = dice[0] + dice[1] + dice[2];
        let sub;
        if (isOne) {
            const i = (i1 + k) % 10;
            sub = wins(i, i2, s1 + i + 1, s2, false);
        } else {
            const i = (i2 + k) % 10;
            sub = wins(i1, i, s1, s2 + i + 1, true);
        }
        ret[0] += sub[0];
        ret[1] += sub[1];
    }

    map.set(key, `${ret[0]},${ret[1]}`);
    return ret;
}

export default function Day21() {
    const { lines } = useContext(ChallengeContext);

    const [isPlayerOne, setIsPlayerOne] = useState(true);
    const [turn, setTurn] = useState(1);
    const [positionOne, setPositionOne] = useState(parseInt(lines[0].split(" ").at(-1)) - 1);
    const [positionTwo, setPositionTwo] = useState(parseInt(lines[1].split(" ").at(-1)) - 1);
    const [scoreOne, setScoreOne] = useState(0);
    const [scoreTwo, setScoreTwo] = useState(0);

    const [dice, setDice] = useState([1, 2, 3]);

    const handleNextTurn = () => {
        const lastVal = (turn - 1) * 3;
        const newDice = [(lastVal + 1) % 100, (lastVal + 2) % 100, (lastVal + 3) % 100];
        setTurn(turn + 1);
        setDice(newDice);

        const sum = newDice[0] + newDice[1] + newDice[2];

        if (isPlayerOne) {
            const newPosition = (positionOne + sum) % 10;
            setPositionOne(newPosition);
            setScoreOne(scoreOne + newPosition + 1);
        } else {
            const newPosition = (positionTwo + sum) % 10;
            setPositionTwo(newPosition);
            setScoreTwo(scoreTwo + newPosition + 1);
        }

        setIsPlayerOne(!isPlayerOne);
    };

    const coordsOne = coords(positionOne);
    const coordsTwo = coords(positionTwo);
    const isConflict = positionOne === positionTwo;

    const pawnStyle = ([x, y], isPlayerTwo) => ({
        x: !isConflict ? x : x + 25 * (isPlayerTwo ? -1 : 1),
        y,
    });

    const [diceIndex, setDiceIndex] = useState(-1);
    const handleReset = () => {};
    const handleDice = () => {
        if (diceIndex === 3) {
            handleNextTurn();
            setDiceIndex(-1);
        } else {
            setDiceIndex(diceIndex + 1);
        }
    };

    const [isSkipping, setIsSkipping] = useState(false);

    const onTick = useEffectEvent(() => {
        handleDice();
    });
    useEffect(() => {
        if (!isSkipping) return;
        const interval = setInterval(() => onTick(), 50);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSkipping]);

    const handleSkip = () => {
        setIsSkipping(!isSkipping);
    };

    return (
        <div className="flex justify-center w-full h-full gap-32 center">
            {/* <div className="">
                <CloseUp isPlayerOne={isPlayerOne} dice={dice} />
            </div> */}
            <div className="[perspective:600px]">
                <div className="center preserve-3d" style={{ transform: "rotateX(60deg)" }}>
                    <Track positionOne={positionOne} positionTwo={positionTwo} />
                    <Pawn
                        className="absolute"
                        animate={pawnStyle(coordsOne, false)}
                        transition={{ type: "tween", duration: 0.1 }}
                    />
                    <Pawn
                        className="absolute"
                        isPlayerTwo
                        animate={pawnStyle(coordsTwo, true)}
                        transition={{ type: "tween", duration: 0.1 }}
                    />
                </div>
            </div>

            <div className="flex flex-col items-stretch p-6 rounded-lg bg-zinc-900">
                <div className="flex justify-around py-4 font-mono border-2 rounded-t-lg border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-600" />
                        <span>{scoreOne}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-cyan-600" />
                        <span>{scoreTwo}</span>
                    </div>
                </div>
                <CloseUp isPlayerOne={isPlayerOne} dice={dice} diceIndex={diceIndex} key={turn} />
                <div className="h-10 border-2 rounded-b-lg border-zinc-800">
                    <Buttons
                        onReset={handleReset}
                        onDice={handleDice}
                        onSkip={handleSkip}
                        isSkipping={isSkipping}
                    />
                </div>
            </div>
        </div>
    );
}
