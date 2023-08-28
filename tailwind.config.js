const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                grow: "grow 1s ease-in-out infinite",
                flash: "flash 0.5s ease-in-out infinite",
                terminal: "terminal 1s ease-in-out infinite",
                "spin-die": "spin-die 0.5s linear infinite",
            },
            keyframes: {
                grow: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.1)" },
                },
                flash: {
                    "0%, 100%": { filter: "brightness(2)" },
                    "50%": { filter: "brightness(1)" },
                },
                terminal: {
                    "0%, 100%": { filter: "brightness(0.75)" },
                    "50%": { filter: "brightness(1)" },
                },
                "spin-die": {
                    "0%": { transform: "rotateX(0deg)" },
                    "100%": { transform: "rotateX(360deg)" },
                },
            },
            typography: (theme) => ({
                notes: {
                    css: {
                        color: theme("colors.slate.200"),
                        "h1,h2,h3,h4,h5,h6": {
                            color: theme("colors.amber.300"),
                        },
                        strong: {
                            color: theme("colors.slate.50"),
                        },
                        a: {
                            color: theme("colors.amber.300"),
                        },
                        ":not(pre)>code": {
                            color: theme("colors.slate.50"),
                            backgroundColor: theme("colors.slate.900"),
                            borderRadius: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            "&:before,&:after": { display: "none" },
                        },
                        "pre>code": {
                            display: "grid",
                        },
                        blockquote: {
                            color: theme("colors.slate.500"),
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        plugin(function ({ addUtilities, matchUtilities, addComponents, theme }) {
            addUtilities({
                ".center": {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                },
                ".aoc-glow": {
                    color: "#fff",
                    textShadow: "0 0 5px #fff",
                },
                ".preserve-3d": {
                    transformStyle: "preserve-3d",
                },
            });

            matchUtilities({
                perspective: (value) => ({ perspective: value }),
            });

            matchUtilities(
                {
                    "rotate-x": (value) => ({ transform: `rotateX(${value}deg)` }),
                },
                {
                    values: { 15: "15", 30: "30", 45: "45", 60: "60", 90: "90" },
                    supportsNegativeValues: true,
                }
            );

            matchUtilities(
                {
                    "rotate-y": (value) => ({ transform: `rotateY(${value}deg)` }),
                },
                {
                    values: { 15: "15", 30: "30", 45: "45", 60: "60", 90: "90" },
                    supportsNegativeValues: true,
                }
            );

            matchUtilities(
                {
                    "rotate-z": (value) => ({ transform: `rotateZ(${value}deg)` }),
                },
                {
                    values: { 15: "15", 30: "30", 45: "45", 60: "60", 90: "90" },
                    supportsNegativeValues: true,
                }
            );

            matchUtilities(
                {
                    "translate-z": (value) => ({ transform: `translateZ(${value})` }),
                },
                {
                    values: theme("spacing"),
                    supportsNegativeValues: true,
                }
            );

            // // Day 7 range input
            /* https://css-tricks.com/styling-cross-browser-compatible-range-inputs-css/ */
            addComponents({
                'input.crab-input[type="range"]': {
                    appearance: "none",
                    background: "transparent",

                    "&::range-track": {
                        appearance: "none",
                        height: "1.25rem",
                        transform: "translateY(0.625rem)",
                        borderTop: "2px dashed",
                        borderColor: theme("colors.slate.500"),
                    },

                    "&::range-thumb": {
                        appearance: "none",
                        backgroundColor: theme("colors.slate.500"),
                        borderRadius: "9999px",
                        border: "2px solid",
                        borderColor: theme("colors.slate.400"),
                        width: "1.25rem",
                        height: "1.25rem",
                        transform: "translate(0)",
                    },
                },
            });

            // // Polygon Kitchen Sink
            addComponents({
                'input.basic[type="number"]': {
                    "&:-webkit-inner-spin-button": {
                        appearance: "none",
                    },
                    "&:-webkit-outer-spin-button": {
                        appearance: "none",
                    },
                    appearance: "textfield",
                },
            });
        }),
    ],
};
