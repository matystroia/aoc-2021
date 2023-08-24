import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

import { CustomDie } from "../../components/models/Die";

import { Pawn } from "./Pawn";

function Plane() {
    return <div className="absolute w-24 h-24 rounded-full bg-zinc-950 rotate-x-90" />;
}

const diceVariants = {
    initial: (i) => ({
        x: i * 100,
        y: -150,
        z: 32,
    }),
    center: { x: 0 },

    spinning: {
        rotateX: [0, -360],
        transition: {
            repeat: Infinity,
            repeatType: "loop",
            type: "tween",
            ease: "linear",
            duration: 0.5,
        },
    },
    static: {
        rotateX: 0,
    },
};

export function CloseUp({ isPlayerOne, dice, diceIndex }) {
    const pawnControls = useAnimation();
    const dieControls = useAnimation();

    useEffect(() => {
        if (diceIndex < 0 || diceIndex === 3) return;
        const handleDieHit = async () => {
            try {
                // Fade in and bring above pawn
                await dieControls.start("visible");
                await dieControls.start({ x: 0 });

                // Die starts spinning
                dieControls.start("spinning");

                // Pawn goes up
                await pawnControls.start({ y: -40 }, { delay: 0.5 });

                // Die is hit, showing value
                dieControls.start({ y: [null, -200, -150] });
                await dieControls.start(["static", "valueShown"]);

                // Pawn goes back down
                await pawnControls.start({ y: 0 });

                // Die returns to starting place
                dieControls.start("initial");
            } catch {}
        };
        handleDieHit();
        return () => {
            dieControls.stop();
            dieControls.start(["initial", "visible", "valueShown"]);
            dieControls.start({ rotateX: 0 });

            pawnControls.stop();
            pawnControls.start({ y: 0 });
        };
    }, [dieControls, pawnControls, diceIndex]);

    const getVariant = (i) => {
        // Combine dice, going to center & fading out
        if (diceIndex === 3) return ["invisible", "center"];

        if (i > diceIndex) return ["initial", "invisible"];
        if (i === diceIndex) return dieControls;
        if (i < diceIndex) return ["initial", "visible", "valueShown"];
    };

    const resultVariant = diceIndex === 3 ? ["visible", "valueShown"] : "invisible";

    return (
        <div className="relative flex justify-center h-64 border-2 w-72 border-zinc-800 perspective-[600px]">
            <motion.div className="absolute bottom-8 preserve-3d -rotate-x-15 center">
                <CustomDie
                    initial={false}
                    custom={-1}
                    value={dice[0]}
                    animate={getVariant(0)}
                    variants={diceVariants}
                />
                <CustomDie
                    initial={false}
                    custom={0}
                    value={dice[2]}
                    animate={getVariant(2)}
                    variants={diceVariants}
                />
                <CustomDie
                    initial={false}
                    custom={1}
                    value={dice[1]}
                    animate={getVariant(1)}
                    variants={diceVariants}
                />
                {/* Result Die */}
                <CustomDie
                    initial={false}
                    style={{ z: 32, y: -150 }}
                    value={dice[0] + dice[1] + dice[2]}
                    animate={resultVariant}
                    variants={diceVariants}
                />

                <Pawn
                    isPlayerTwo={!isPlayerOne}
                    className="absolute"
                    style={{ rotateX: 90 }}
                    animate={pawnControls}
                />

                <Plane />
            </motion.div>
        </div>
    );
}
