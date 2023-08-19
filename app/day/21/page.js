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
import { Sphere } from "../../components/shapes/Sphere";
import { RegularPolygon } from "../../components/shapes/RegularPolygon";
import { product } from "../../utils";
import { CustomDie } from "../../components/models/Die";

const coords = (i) => [
    Math.cos(((2 * Math.PI) / 10) * i) * 150,
    Math.sin(((2 * Math.PI) / 10) * i) * 150,
];

function Pawn({ position, isPlayerTwo, isConflict }) {
    const [x, y] = coords(position);
    return (
        <div
            className="absolute transition-transform duration-75 center preserve-3d"
            style={{
                transform: `translate(${x}px, ${y}px)${
                    isConflict ? `translateX(${25 * (isPlayerTwo ? -1 : 1)}px)` : ""
                }`,
            }}
        >
            <Sphere
                circleClass={clsx("w-8 h-8", isPlayerTwo ? "bg-cyan-700" : "bg-rose-700")}
                className="absolute [transform:translate3d(-1rem,-1rem,50px)]"
            />
            <RegularPolygon
                className="absolute"
                n={5}
                angle={80}
                width={30}
                height={30}
                depth={30}
                topClass={isPlayerTwo ? "bg-cyan-600" : "bg-rose-600"}
                sideClass={isPlayerTwo ? "bg-cyan-800" : "bg-rose-800"}
                topBorder={{ width: 1, borderClass: isPlayerTwo ? "bg-cyan-800" : "bg-rose-800" }}
                sideBorder={{ width: 1, borderClass: isPlayerTwo ? "bg-cyan-600" : "bg-rose-600" }}
            />
        </div>
    );
}

let die = 0;
let count = 0;
const roll = () => {
    count++;

    die += 1;
    die = die > 100 ? 1 : die;
    return die;
};

function Die({ value }) {
    const [isSpinning, setIsSpinning] = useState(false);

    return (
        <div
            className={clsx(
                "bg-zinc-300 border-4 border-zinc-400 w-16 h-16 font-mono text-2xl text-zinc-700 center drop-shadow-lg rounded-md"
            )}
        >
            {value}
        </div>
    );
}

function Track({ positionOne, positionTwo }) {
    return (
        <div className="w-[400px] h-[400px] center bg-zinc-900 rounded-2xl">
            {range(10).map((i) => {
                const [x, y] = coords(i);

                let circleClass;
                if (i === positionOne && i === positionTwo)
                    circleClass = "bg-gradient-to-r from-cyan-600 from-50% to-rose-600 to-50%";
                else if (i === positionOne) circleClass = "bg-rose-600";
                else if (i === positionTwo) circleClass = "bg-cyan-600";
                else circleClass = "bg-zinc-600";

                return (
                    <div
                        key={i}
                        className={clsx(
                            "absolute w-16 h-16 rounded-full center font-mono text-zinc-800",
                            circleClass
                        )}
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                        }}
                    >
                        {i + 1}
                    </div>
                );
            })}
        </div>
    );
}

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
    const [positionOne, setPositionOne] = useState(parseInt(lines[0].split(" ").at(-1)) - 1);
    const [positionTwo, setPositionTwo] = useState(parseInt(lines[1].split(" ").at(-1)) - 1);
    const [scoreOne, setScoreOne] = useState(0);
    const [scoreTwo, setScoreTwo] = useState(0);

    const [dice, setDice] = useState(["?", "?", "?"]);

    const handleNextTurn = () => {
        const newDice = [roll(), roll(), roll()];
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

    const onNextTurn = useEffectEvent(() => {
        if (scoreOne < 1000 && scoreTwo < 1000) {
            handleNextTurn();
        }
    });

    const [isSkip, setIsSkip] = useState(false);
    useEffect(() => {
        if (!isSkip) return;
        const interval = setInterval(() => onNextTurn(), 50);
        return () => clearInterval(interval);
    }, [isSkip]);

    console.log(wins(positionOne, positionTwo, 0, 0, true));

    return (
        <div className="flex flex-col h-full center" onClick={handleNextTurn}>
            <div className="flex flex-col gap-4 items-center bg-zinc-800 px-6 py-4 border-zinc-950 border [perspective:500px]">
                <div className="flex gap-6 preserve-3d">
                    <CustomDie delay={1} value={dice[0]} />
                    <CustomDie delay={2} value={dice[1]} />
                    <CustomDie delay={3} value={dice[2]} />
                </div>
                <Die value={dice[0] + dice[1] + dice[2]} />
                {count}
            </div>
            <div className="[perspective:600px]">
                <div className="center preserve-3d" style={{ transform: "rotateX(60deg)" }}>
                    <Track positionOne={positionOne} positionTwo={positionTwo} />
                    <Pawn position={positionOne} isConflict={positionOne === positionTwo} />
                    <Pawn
                        position={positionTwo}
                        isConflict={positionOne === positionTwo}
                        isPlayerTwo
                    />
                </div>
            </div>
            <div
                className="flex flex-col gap-4 p-6 font-mono text-xl border bg-zinc-800 border-zinc-950"
                onClick={() => setIsSkip(true)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-600" />
                    <span>{scoreOne}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-600" />
                    <span>{scoreTwo}</span>
                </div>
            </div>
        </div>
    );
}
