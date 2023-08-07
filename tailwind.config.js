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
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        // TODO: Add 3D transform utility
        plugin(function ({ addUtilities, theme }) {
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
        }),
    ],
};
