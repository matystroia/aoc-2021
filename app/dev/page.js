"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Die } from "../components/models/Die";
import { usePhysics } from "../hooks/usePhysics";
import { Cube } from "../components/shapes/Cube";
import { ExtrudedPolygonPath } from "../components/shapes/ExtrudedPolygonPath";
import { RegularPolygon } from "../components/shapes/RegularPolygon";

function Page({ href, name, children }) {
    return (
        <Link
            href={href}
            className="p-10 prose bg-orange-300 border-2 rounded-lg border-orange-950"
        >
            <h1 className="text-orange-950">{name}</h1>
            <div className="text-orange-950">{children}</div>
        </Link>
    );
}

export default function Dev() {
    return (
        <div className="relative w-screen h-screen overflow-auto bg-orange-200">
            <div className="flex flex-col items-start gap-8 m-4">
                <Page href="dev/toy" name="Toy">
                    A fun little idea I had to showcase the different types of 3D objects my last
                    iteration of ExtrudedPolygonPath is able to create :)
                </Page>
                <Page href="dev/nintendo-ds" name="Nintendo DS">
                    After <Link href="day/17">Day 17</Link>, I wanted to see how difficult it would
                    be to model a real-world object using only my Box and RegularPolygon components.
                    I ended up creating the (now obsolete) ShearedBox component because I wanted the
                    corners to be rounded.
                </Page>
                <Page href="dev/computer" name="Computer">
                    Another modeling exercise, but this time making clever use of the angle prop. I
                    really like how this turned out, and I especially enjoy the borders
                </Page>
                <Page href="dev/hills" name="Hills">
                    I remember seeing{" "}
                    <Link href="https://abdullahdostkhan.com/2016/11/22/mountainside/">
                        this painting
                    </Link>{" "}
                    by Abdullah Khan a long time ago and thinking that something like this but
                    procedurally generated and animated in parallax would look really cool as
                    something you put on an idle screen. More of a proof-of-concept, but I used some
                    of the things I learned here on the home page waves!
                </Page>
                <Page href="dev/polygon" name="Polygon Testing">
                    Just a page for debugging the regular polygon component.
                </Page>
            </div>
        </div>
    );
}
