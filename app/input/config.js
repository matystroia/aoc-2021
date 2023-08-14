import { clone, merge } from "lodash";

const names = {
    1: "Sonar Sweep",
    2: "Dive!",
    3: "Binary Diagnostic",
    4: "Giant Squid",
    5: "Hydrothermal Venture",
    6: "Lanternfish",
    7: "The Treachery of Whales",
    8: "Seven Segment Search",
    9: "Smoke Basin",
    10: "Syntax Scoring",
    11: "Dumbo Octopus",
    12: "Passage Pathing",
    13: "Transparent Origami",
    14: "Extended Polymerization",
    15: "Chiton",
    16: "Packet Decoder",
    17: "Trick Shot",
    18: "Snailfish",
    19: "Beacon Scanner",
    20: "Trench Map",
    21: "Dirac Dice",
    22: "Reactor Reboot",
    23: "Amphipod",
    24: "Arithmetic Logic Unit",
    25: "Sea Cucumber",
};

const defaultConfig = {
    exampleOnly: true,
};
export const ChallengeConfig = Object.fromEntries(
    Object.entries(names).map(([day, name]) => [
        day,
        merge(clone(defaultConfig), { name }, require(`../day/${day}/page`).config),
    ])
);
